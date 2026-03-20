import { useCallback } from "react";
import { findClosestPerlerColor } from "../utils/colorMatching";
import type { PerlerColor } from "../utils/perlerColors";
import { PERLER_COLORS } from "../utils/perlerColors";

const WHITE_COLOR = PERLER_COLORS.find((c: PerlerColor) => c.code === "H1")!;

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
        let transparentCount = 0;
        const totalPixels = (endX - startX) * (endY - startY);
        
        for (let sy = startY; sy < endY && sy < srcHeight; sy++) {
          for (let sx = startX; sx < endX && sx < srcWidth; sx++) {
            const srcIndex = (sy * srcWidth + sx) * 4;
            const a = data[srcIndex + 3];
            
            if (a < 128) {
              transparentCount++;
              continue;
            }
            
            totalR += data[srcIndex];
            totalG += data[srcIndex + 1];
            totalB += data[srcIndex + 2];
            count++;
          }
        }
        
        let color: PerlerColor;
        let rgb: [number, number, number];
        
        if (transparentCount > totalPixels * 0.5 || count === 0) {
          color = WHITE_COLOR;
          rgb = [255, 255, 255];
        } else {
          const avgR = Math.round(totalR / count);
          const avgG = Math.round(totalG / count);
          const avgB = Math.round(totalB / count);
          color = findClosestPerlerColor(avgR, avgG, avgB);
          rgb = [avgR, avgG, avgB];
        }
        
        row.push({ color, rgb });
      }
      pixels.push(row);
    }
    
    return { pixels, width, height };
  }, []);

  return { processImage };
}
