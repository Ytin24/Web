import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, ZoomIn, ZoomOut } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useState, useEffect } from "react";

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  imageAlt: string;
}

export default function ImageModal({ isOpen, onClose, imageUrl, imageAlt }: ImageModalProps) {
  const [zoom, setZoom] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Reset zoom when modal opens
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setImageLoaded(false);
      setImageError(false);
    }
  }, [isOpen]);

  if (!isOpen || !imageUrl) return null;

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.5, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.5, 0.5));

  const handleImageLoad = () => setImageLoaded(true);
  const handleImageError = () => setImageError(true);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-4 bg-black/95 border border-white/20">
        <VisuallyHidden>
          <DialogTitle>Просмотр изображения</DialogTitle>
          <DialogDescription>
            Полноэкранный просмотр изображения: {imageAlt}
          </DialogDescription>
        </VisuallyHidden>
        
        {/* Controls */}
        <div className="absolute top-4 right-4 z-20 flex gap-2">
          <Button
            variant="secondary"
            size="icon"
            className="bg-white/20 hover:bg-white/30 text-white border-white/20"
            onClick={handleZoomOut}
            disabled={zoom <= 0.5}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="bg-white/20 hover:bg-white/30 text-white border-white/20"
            onClick={handleZoomIn}
            disabled={zoom >= 3}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="bg-white/20 hover:bg-white/30 text-white border-white/20"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Image Container */}
        <div className="relative flex items-center justify-center min-h-[60vh] overflow-auto">
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white text-lg">Загрузка изображения...</div>
            </div>
          )}
          
          {imageError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white text-lg">Ошибка загрузки изображения</div>
            </div>
          )}
          
          <img 
            src={imageUrl}
            alt={imageAlt}
            onLoad={handleImageLoad}
            onError={handleImageError}
            className="max-w-full max-h-[80vh] object-contain transition-transform duration-300 cursor-grab active:cursor-grabbing"
            style={{ 
              transform: `scale(${zoom})`,
              display: imageError ? 'none' : 'block'
            }}
          />
        </div>

        {/* Image Info */}
        {imageLoaded && (
          <div className="absolute bottom-4 left-4 right-4">
            <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 text-white">
              <div className="text-sm font-medium">{imageAlt}</div>
              <div className="text-xs opacity-70 mt-1">Увеличение: {Math.round(zoom * 100)}%</div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}