import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Key, Plus, Trash2, Copy, Shield, Clock, Eye, EyeOff, 
  AlertTriangle, CheckCircle, XCircle, RefreshCw
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Types
interface ApiToken {
  id: number;
  tokenPrefix: string;
  name: string;
  permissions: string[];
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
  lastUsed: string | null;
  usageCount: number;
  rateLimit: number;
  isExpired: boolean;
  revokedAt: string | null;
}

interface CreateTokenResponse {
  id: number;
  token: string;
  tokenPrefix: string;
  name: string;
  permissions: string[];
  expiresAt: string | null;
  rateLimit: number;
  createdAt: string;
  warning: string;
}

// Form schema
const createTokenSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  permissions: z.array(z.enum(['read', 'write', 'admin'])).min(1, "At least one permission required"),
  expiresInDays: z.number().min(1).max(365).default(90),
  ipWhitelist: z.string().optional(),
  rateLimit: z.number().min(1).max(10000).default(1000),
});

type CreateTokenForm = z.infer<typeof createTokenSchema>;

export default function TokenManagement() {
  const [showNewToken, setShowNewToken] = useState(false);
  const [newTokenData, setNewTokenData] = useState<CreateTokenResponse | null>(null);
  const [showTokenValue, setShowTokenValue] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch tokens
  const { data: tokens, isLoading } = useQuery<ApiToken[]>({
    queryKey: ["/api/tokens"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Form for creating tokens
  const form = useForm<CreateTokenForm>({
    resolver: zodResolver(createTokenSchema),
    defaultValues: {
      name: "",
      permissions: [],
      expiresInDays: 90,
      rateLimit: 1000,
      ipWhitelist: "",
    },
  });

  // Create token mutation
  const createTokenMutation = useMutation({
    mutationFn: async (data: CreateTokenForm) => {
      const requestData = {
        name: data.name,
        permissions: data.permissions,
        expiresAt: new Date(Date.now() + data.expiresInDays * 24 * 60 * 60 * 1000).toISOString(),
        rateLimit: data.rateLimit,
        ipWhitelist: data.ipWhitelist ? data.ipWhitelist.split('\n').map(ip => ip.trim()).filter(ip => ip) : undefined,
      };

      const response = await fetch("/api/tokens", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: (data: CreateTokenResponse) => {
      setNewTokenData(data);
      setShowNewToken(true);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/tokens"] });
      toast({
        title: "Token created successfully",
        description: `Token "${data.name}" has been created. Make sure to copy it now.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create token",
        description: error?.message || "An error occurred while creating the token",
        variant: "destructive",
      });
    },
  });

  // Revoke token mutation
  const revokeTokenMutation = useMutation({
    mutationFn: async (tokenId: number) => {
      const response = await fetch(`/api/tokens/${tokenId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('token') || ''}`
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tokens"] });
      toast({
        title: "Token revoked",
        description: "The token has been successfully revoked.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to revoke token",
        description: error?.message || "An error occurred while revoking the token",
        variant: "destructive",
      });
    },
  });

  const handleCreateToken = (data: CreateTokenForm) => {
    createTokenMutation.mutate(data);
  };

  const handleRevokeToken = (tokenId: number, tokenName: string) => {
    if (confirm(`Are you sure you want to revoke the token "${tokenName}"? This action cannot be undone.`)) {
      revokeTokenMutation.mutate(tokenId);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Token has been copied to your clipboard.",
    });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTokenStatus = (token: ApiToken) => {
    if (token.revokedAt) {
      return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Revoked</Badge>;
    }
    if (token.isExpired) {
      return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Expired</Badge>;
    }
    if (token.isActive) {
      return <Badge variant="default" className="bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
    }
    return <Badge variant="secondary">Inactive</Badge>;
  };

  const getPermissionBadges = (permissions: string[]) => {
    const colors = {
      read: "bg-blue-100 text-primary",
      write: "bg-green-100 text-secondary",
      admin: "bg-red-100 text-destructive"
    };

    return permissions.map(permission => (
      <Badge key={permission} className={colors[permission as keyof typeof colors]}>
        {permission}
      </Badge>
    ));
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" />
            Loading tokens...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Key className="w-6 h-6" />
            API Token Management
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage API tokens for external integrations and automation
          </p>
        </div>
        <Button onClick={() => form.reset()}>
          <Plus className="w-4 h-4 mr-2" />
          Create New Token
        </Button>
      </div>

      {/* New Token Display */}
      {showNewToken && newTokenData && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-secondary flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Token Created Successfully
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg border">
                <Label className="text-sm font-medium text-secondary">Your new API token:</Label>
                <div className="flex items-center gap-2 mt-2">
                  <code className="flex-1 p-2 bg-muted/50 rounded font-mono text-sm">
                    {showTokenValue ? newTokenData.token : '•'.repeat(50)}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowTokenValue(!showTokenValue)}
                  >
                    {showTokenValue ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => copyToClipboard(newTokenData.token)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800">Important Security Notice</p>
                  <p className="text-yellow-700 mt-1">
                    This token will not be shown again. Store it securely and never share it in plain text.
                    Use environment variables or secure credential management systems.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setShowNewToken(false);
                  setNewTokenData(null);
                  setShowTokenValue(false);
                }}
              >
                Done
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Token Form */}
      <Card>
        <CardHeader>
          <CardTitle>Create New API Token</CardTitle>
          <p className="text-sm text-muted-foreground">
            Generate a new secure API token for external integrations
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(handleCreateToken)} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Token Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., N8N Integration, Mobile App"
                  {...form.register("name")}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="expiresInDays">Expires in (days)</Label>
                <Input
                  id="expiresInDays"
                  type="number"
                  min="1"
                  max="365"
                  {...form.register("expiresInDays", { valueAsNumber: true })}
                />
              </div>
            </div>

            <div>
              <Label>Permissions</Label>
              <div className="flex gap-4 mt-2">
                {['read', 'write', 'admin'].map((permission) => (
                  <div key={permission} className="flex items-center space-x-2">
                    <Checkbox
                      id={permission}
                      checked={form.watch('permissions').includes(permission as any)}
                      onCheckedChange={(checked) => {
                        const current = form.getValues('permissions');
                        if (checked) {
                          form.setValue('permissions', [...current, permission as any]);
                        } else {
                          form.setValue('permissions', current.filter(p => p !== permission));
                        }
                      }}
                    />
                    <Label htmlFor={permission} className="capitalize">
                      {permission}
                    </Label>
                  </div>
                ))}
              </div>
              {form.formState.errors.permissions && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.permissions.message}
                </p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rateLimit">Rate Limit (requests/hour)</Label>
                <Input
                  id="rateLimit"
                  type="number"
                  min="1"
                  max="10000"
                  {...form.register("rateLimit", { valueAsNumber: true })}
                />
              </div>

              <div>
                <Label htmlFor="ipWhitelist">IP Whitelist (optional)</Label>
                <Textarea
                  id="ipWhitelist"
                  placeholder="192.168.1.1&#10;10.0.0.1"
                  rows={3}
                  {...form.register("ipWhitelist")}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  One IP address per line. Leave empty to allow all IPs.
                </p>
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={createTokenMutation.isPending}
              className="w-full"
            >
              {createTokenMutation.isPending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Creating Token...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Create Secure Token
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Existing Tokens */}
      <Card>
        <CardHeader>
          <CardTitle>Your API Tokens</CardTitle>
          <p className="text-sm text-muted-foreground">
            Manage your existing API tokens and their permissions
          </p>
        </CardHeader>
        <CardContent>
          {tokens && tokens.length > 0 ? (
            <div className="space-y-4">
              {tokens.map((token) => (
                <div key={token.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">{token.name}</h3>
                        {getTokenStatus(token)}
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <code className="bg-muted/50 px-2 py-1 rounded">{token.tokenPrefix}...</code>
                        <span>•</span>
                        <span>Used {token.usageCount} times</span>
                        <span>•</span>
                        <span>Rate limit: {token.rateLimit}/hour</span>
                      </div>

                      <div className="flex gap-2">
                        {getPermissionBadges(token.permissions)}
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Created:</span> {formatDate(token.createdAt)}
                        </div>
                        <div>
                          <span className="font-medium">Last used:</span> {formatDate(token.lastUsed)}
                        </div>
                        {token.expiresAt && (
                          <div>
                            <span className="font-medium">Expires:</span> {formatDate(token.expiresAt)}
                          </div>
                        )}
                        {token.revokedAt && (
                          <div>
                            <span className="font-medium">Revoked:</span> {formatDate(token.revokedAt)}
                          </div>
                        )}
                      </div>
                    </div>

                    {token.isActive && !token.isExpired && !token.revokedAt && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRevokeToken(token.id, token.name)}
                        disabled={revokeTokenMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Key className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No API tokens found</p>
              <p className="text-sm">Create your first token to get started with API integrations</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}