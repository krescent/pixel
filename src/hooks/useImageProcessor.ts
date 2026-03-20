import { useCallback } from "react";
import { findClosestPerlerColor } from "../utils/colorMatching";
import type { PerlerColor } from "../utils/perlerColors";

export interface ProcessedPixel {
  color: PerlerColor | null;
  rgb: [number, number, number];
  transparent: boolean;
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
        
        let totalR = 0, totalG = 0, totalB = 0, totalA = 0, count = 0;
        let transparentCount = 0;
        
        for (let sy = startY; sy < endY && sy < srcHeight; sy++) {
          for (let sx = startX; sx < endX && sx < srcWidth; sx++) {
            const srcIndex = (sy * srcWidth + sx) * 4;
            const a = data[srcIndex + 3];
            
            if (a < 10) {
              transparentCount++;
              continue;
            }
            
            totalR += data[srcIndex];
            totalG += data[srcIndex + 1];
            totalB += data[srcIndex + 2];
            totalA += a;
            count++;
          }
        }
        
        if (count === 0 || transparentCount > (endX - startX) * (endY - startY) / 2) {
          row.push({ 
            color: null, 
            rgb: [255, 255, 255] as [number, number, number],
            transparent: true 
          });
        } else {
          const avgR = Math.round(totalR / count);
          const avgG = Math.round(totalG / count);
          const avgB = Math.round(totalB / count);
          
          const color = findClosestPerlerColor(avgR, avgG, avgB, totalA / count);
          row.push({ color: color!, rgb: [avgR, avgG, avgB], transparent: false });
        }
      }
      pixels.push(row);
    }
    
    return { pixels, width, height };
  }, []);

  return { processImage };
}
