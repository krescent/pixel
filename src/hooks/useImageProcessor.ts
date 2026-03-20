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
        const colorWeights: Map<string, { color: PerlerColor; weight: number; r: number; g: number; b: number }> = new Map();
        
        for (let sy = startY; sy < endY && sy < srcHeight; sy++) {
          for (let sx = startX; sx < endX && sx < srcWidth; sx++) {
            const srcIndex = (sy * srcWidth + sx) * 4;
            const a = data[srcIndex + 3];
            
            const overlapLeft = Math.max(srcXStart, sx);
            const overlapRight = Math.min(srcXEnd, sx + 1);
            const overlapTop = Math.max(srcYStart, sy);
            const overlapBottom = Math.min(srcYEnd, sy + 1);
            
            const weight = (overlapRight - overlapLeft) * (overlapBottom - overlapTop);
            
            if (a < 128) continue;
            
            const r = data[srcIndex];
            const g = data[srcIndex + 1];
            const b = data[srcIndex + 2];
            const perlerColor = findClosestPerlerColor(r, g, b);
            const key = `${perlerColor.code}`;
            
            const existing = colorWeights.get(key);
            if (existing) {
              existing.weight += weight;
            } else {
              colorWeights.set(key, { color: perlerColor, weight, r, g, b });
            }
          }
        }
        
        let color: PerlerColor;
        let rgb: [number, number, number];
        let transparent = false;
        
        if (colorWeights.size === 0) {
          color = WHITE_COLOR;
          rgb = [255, 255, 255];
          transparent = true;
        } else {
          let maxEntry = { weight: 0, color: WHITE_COLOR, r: 255, g: 255, b: 255 };
          for (const entry of colorWeights.values()) {
            if (entry.weight > maxEntry.weight) {
              maxEntry = entry;
            }
          }
          
          if (maxEntry.weight < totalArea * 0.5) {
            color = WHITE_COLOR;
            rgb = [255, 255, 255];
            transparent = true;
          } else {
            color = maxEntry.color;
            rgb = [maxEntry.r, maxEntry.g, maxEntry.b];
          }
        }
        
        row.push({ color, rgb, transparent });
      }
      pixels.push(row);
    }
    
    return { pixels, width, height };
  }, []);

  return { processImage };
}
