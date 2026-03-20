import { useCallback } from "react";
import { findClosestPerlerColor } from "../utils/colorMatching";
import type { PerlerColor } from "../utils/perlerColors";
import { PERLER_COLORS } from "../utils/perlerColors";

const WHITE_COLOR = PERLER_COLORS.find((c: PerlerColor) => c.code === "H1")!;

export interface ProcessedPixel {
  color: PerlerColor;
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
        
        const totalArea = (srcXEnd - srcXStart) * (srcYEnd - srcYStart);
        let dominantR = 0, dominantG = 0, dominantB = 0, maxWeight = 0;
        
        for (let sy = startY; sy < endY && sy < srcHeight; sy++) {
          for (let sx = startX; sx < endX && sx < srcWidth; sx++) {
            const srcIndex = (sy * srcWidth + sx) * 4;
            const a = data[srcIndex + 3];
            
            const overlapLeft = Math.max(srcXStart, sx);
            const overlapRight = Math.min(srcXEnd, sx + 1);
            const overlapTop = Math.max(srcYStart, sy);
            const overlapBottom = Math.min(srcYEnd, sy + 1);
            
            const weight = (overlapRight - overlapLeft) * (overlapBottom - overlapTop);
            
            if (a < 128 || weight <= maxWeight) continue;
            
            maxWeight = weight;
            dominantR = data[srcIndex];
            dominantG = data[srcIndex + 1];
            dominantB = data[srcIndex + 2];
          }
        }
        
        let color: PerlerColor;
        let rgb: [number, number, number];
        let transparent = false;
        
        if (maxWeight === 0 || maxWeight < totalArea * 0.5) {
          color = WHITE_COLOR;
          rgb = [255, 255, 255];
          transparent = true;
        } else {
          color = findClosestPerlerColor(dominantR, dominantG, dominantB);
          rgb = [dominantR, dominantG, dominantB];
        }
        
        row.push({ color, rgb, transparent });
      }
      pixels.push(row);
    }
    
    return { pixels, width, height };
  }, []);

  return { processImage };
}
