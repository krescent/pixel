import { useCallback } from "react";
import { findClosestPerlerColor } from "../utils/colorMatching";
import type { PerlerColor } from "../utils/perlerColors";

export interface ProcessedPixel {
  color: PerlerColor;
  rgb: [number, number, number];
}

export function useImageProcessor() {
  const processImage = useCallback((
    imageData: ImageData,
    targetShortEdge: number
  ): { pixels: ProcessedPixel[][]; width: number; height: number } => {
    const { data, width: srcWidth, height: srcHeight } = imageData;
    
    const aspectRatio = srcWidth / srcHeight;
    const shortEdge = Math.min(targetShortEdge, Math.max(srcWidth, srcHeight));
    const longEdge = Math.round(shortEdge * aspectRatio);
    
    const width = srcWidth >= srcHeight ? shortEdge : longEdge;
    const height = srcHeight >= srcWidth ? shortEdge : longEdge;
    
    const pixels: ProcessedPixel[][] = [];
    
    for (let y = 0; y < height; y++) {
      const row: ProcessedPixel[] = [];
      const srcY = Math.floor((y / height) * srcHeight);
      
      for (let x = 0; x < width; x++) {
        const srcX = Math.floor((x / width) * srcWidth);
        const srcIndex = (srcY * srcWidth + srcX) * 4;
        
        const r = data[srcIndex];
        const g = data[srcIndex + 1];
        const b = data[srcIndex + 2];
        
        const color = findClosestPerlerColor(r, g, b);
        row.push({ color, rgb: [r, g, b] });
      }
      pixels.push(row);
    }
    
    return { pixels, width, height };
  }, []);

  return { processImage };
}
