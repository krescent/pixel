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
      
      for (let x = 0; x < width; x++) {
        const srcXStart = (x / width) * srcWidth;
        const srcXEnd = ((x + 1) / width) * srcWidth;
        const srcYStart = (y / height) * srcHeight;
        const srcYEnd = ((y + 1) / height) * srcHeight;
        
        const startX = Math.floor(srcXStart);
        const endX = Math.ceil(srcXEnd);
        const startY = Math.floor(srcYStart);
        const endY = Math.ceil(srcYEnd);
        
        let totalR = 0, totalG = 0, totalB = 0, count = 0;
        
        for (let sy = startY; sy < endY && sy < srcHeight; sy++) {
          for (let sx = startX; sx < endX && sx < srcWidth; sx++) {
            const srcIndex = (sy * srcWidth + sx) * 4;
            totalR += data[srcIndex];
            totalG += data[srcIndex + 1];
            totalB += data[srcIndex + 2];
            count++;
          }
        }
        
        const avgR = count > 0 ? Math.round(totalR / count) : 255;
        const avgG = count > 0 ? Math.round(totalG / count) : 255;
        const avgB = count > 0 ? Math.round(totalB / count) : 255;
        
        const color = findClosestPerlerColor(avgR, avgG, avgB);
        row.push({ color, rgb: [avgR, avgG, avgB] });
      }
      pixels.push(row);
    }
    
    return { pixels, width, height };
  }, []);

  return { processImage };
}
