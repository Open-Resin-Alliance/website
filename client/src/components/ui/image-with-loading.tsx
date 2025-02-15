import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface ImageWithLoadingProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
}

export function ImageWithLoading({ src, alt, className, ...props }: ImageWithLoadingProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Reset states when src changes
    setIsLoading(true);
    setError(false);

    // Preload image
    const img = new Image();
    img.src = src;
    
    img.onload = () => {
      setIsLoading(false);
    };
    
    img.onerror = () => {
      setIsLoading(false);
      setError(true);
    };

    // Clean up
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  if (isLoading) {
    return <Skeleton className={cn("bg-muted", className)} />;
  }

  if (error) {
    return <div className={cn("bg-muted flex items-center justify-center text-muted-foreground", className)}>Failed to load image</div>;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={cn("transition-opacity duration-300", className)}
      {...props}
    />
  );
}