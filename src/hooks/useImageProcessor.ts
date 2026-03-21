import { useCallback } from "react";
import { findClosestPerlerColor } from "../utils/colorMatching";
import type { PerlerColor } from "../utils/perlerColors";
import { COLOR_BRANDS, PERLER_COLORS } from "../utils/perlerColors";

const WHITE_COLOR = PERLER_COLORS.find((c: PerlerColor) => c.code === "H1")!;

export interface ProcessedPixel {
  color: PerlerColor;
  rgb: [number, number, number];
  transparent: boolean;
}

export function useImageProcessor() {
  const processImage = useCallback((
    imageData: ImageData,
    targetShortEdge: number,
    brandName?: string
  ): { pixels: ProcessedPixel[][]; width: number; height: number } => {
    const colors = brandName 
      ? COLOR_BRANDS.find(b => b.name === brandName)?.colors ?? PERLER_COLORS
      : PERLER_COLORS;
    
    const { data, width: srcWidth, height: srcHeight } = imageData;
    
    const aspectRatio = srcWidth / srcHeight;
    const shortEdge = Math.min(targetShortEdge, Math.max(srcWidth, srcHeight));
    const longEdge = Math.round(shortEdge * aspectRatio);
    
    const width = srcWidth >= srcHeight ? shortEdge : longEdge;
    const height = srcHeight >= srcWidth ? shortEdge : longEdge;
    
    const scaleX = srcWidth / width;
    const scaleY = srcHeight / height;
    
    const colorCache = new Map<number, PerlerColor>();
    const getColor = (r: number, g: number, b: number): PerlerColor => {
      const key = (r << 16) | (g << 8) | b;
      let cached = colorCache.get(key);
      if (!cached) {
        cached = findClosestPerlerColor(r, g, b, colors);
        colorCache.set(key, cached);
      }
      return cached;
    };
    
    const pixels: ProcessedPixel[][] = [];
    
    for (let y = 0; y < height; y++) {
      const row: ProcessedPixel[] = [];
      
      for (let x = 0; x < width; x++) {
        const srcXStart = x * scaleX;
        const srcXEnd = (x + 1) * scaleX;
        const srcYStart = y * scaleY;
        const srcYEnd = (y + 1) * scaleY;
        
        const startX = Math.floor(srcXStart);
        const endX = Math.min(Math.ceil(srcXEnd), srcWidth);
        const startY = Math.floor(srcYStart);
        const endY = Math.min(Math.ceil(srcYEnd), srcHeight);
        
        const colorWeights: { code: string; weight: number; r: number; g: number; b: number }[] = [];
        const colorMap = new Map<string, number>();
        
        for (let sy = startY; sy < endY; sy++) {
          const yFracTop = sy < srcYStart ? srcYStart - sy : 0;
          const yFracBottom = (sy + 1) > srcYEnd ? (sy + 1) - srcYEnd : 1;
          const yWeight = Math.min(yFracBottom, 1) - Math.max(yFracTop, 0);
          
          for (let sx = startX; sx < endX; sx++) {
            const srcIndex = (sy * srcWidth + sx) * 4;
            const a = data[srcIndex + 3];
            
            if (a < 128) continue;
            
            const xFracLeft = sx < srcXStart ? srcXStart - sx : 0;
            const xFracRight = (sx + 1) > srcXEnd ? (sx + 1) - srcXEnd : 1;
            const xWeight = Math.min(xFracRight, 1) - Math.max(xFracLeft, 0);
            
            const weight = xWeight * yWeight;
            if (weight <= 0) continue;
            
            const r = data[srcIndex];
            const g = data[srcIndex + 1];
            const b = data[srcIndex + 2];
            const perlerColor = getColor(r, g, b);
            const code = perlerColor.code;
            
            const idx = colorMap.get(code);
            if (idx !== undefined) {
              const entry = colorWeights[idx];
              entry.weight += weight;
            } else {
              colorMap.set(code, colorWeights.length);
              colorWeights.push({ code, weight, r, g, b });
            }
          }
        }
        
        let color: PerlerColor;
        let rgb: [number, number, number];
        let transparent = false;
        
        if (colorWeights.length === 0) {
          color = WHITE_COLOR;
          rgb = [255, 255, 255];
          transparent = true;
        } else {
          let maxEntry = colorWeights[0];
          let maxLuminance = 0.299 * maxEntry.r + 0.587 * maxEntry.g + 0.114 * maxEntry.b;
          
          for (let i = 1; i < colorWeights.length; i++) {
            const entry = colorWeights[i];
            if (entry.weight > maxEntry.weight || 
                (entry.weight === maxEntry.weight && 
                 (0.299 * entry.r + 0.587 * entry.g + 0.114 * entry.b) < maxLuminance)) {
              maxEntry = entry;
              maxLuminance = 0.299 * maxEntry.r + 0.587 * maxEntry.g + 0.114 * maxEntry.b;
            }
          }
          
          color = getColor(maxEntry.r, maxEntry.g, maxEntry.b);
          rgb = [maxEntry.r, maxEntry.g, maxEntry.b];
        }
        
        row.push({ color, rgb, transparent });
      }
      pixels.push(row);
    }
    
    return { pixels, width, height };
  }, []);

  return { processImage };
}
