import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/theme-provider";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative glass-effect border-border/50 bg-background/80 text-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 dark:bg-muted/30 dark:text-muted-foreground dark:hover:bg-muted/50 dark:border-border/30 shadow-md backdrop-blur-sm"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Переключить тему</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="glass-effect bg-background/95 border-border/50 text-foreground backdrop-blur-md shadow-lg dark:bg-muted/90 dark:border-border/30"
      >
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={`flex items-center gap-2 text-foreground hover:bg-primary/10 hover:text-primary ${
            theme === "light" ? "bg-primary/20 text-primary font-medium" : ""
          }`}
        >
          <Sun className="h-4 w-4" />
          <span>Светлая</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={`flex items-center gap-2 text-foreground hover:bg-primary/10 hover:text-primary ${
            theme === "dark" ? "bg-primary/20 text-primary font-medium" : ""
          }`}
        >
          <Moon className="h-4 w-4" />
          <span>Тёмная</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className={`flex items-center gap-2 text-foreground hover:bg-primary/10 hover:text-primary ${
            theme === "system" ? "bg-primary/20 text-primary font-medium" : ""
          }`}
        >
          <Monitor className="h-4 w-4" />
          <span>Системная</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}