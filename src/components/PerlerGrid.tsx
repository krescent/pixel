import { useState, useCallback } from "react";
import type { WheelEvent } from "react";
import type { ProcessedPixel } from "../hooks/useImageProcessor";
import { rgbToHex } from "../utils/colorMatching";

interface PerlerGridProps {
  pixels: ProcessedPixel[][];
}

export function PerlerGrid({ pixels }: PerlerGridProps) {
  const [scale, setScale] = useState(1);

  const handleWheel = useCallback((e: WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale(prev => Math.max(0.5, Math.min(3, prev + delta)));
  }, []);

  if (pixels.length === 0) return null;

  const width = pixels[0]?.length ?? 0;
  const baseSize = 16;
  const displaySize = Math.round(baseSize * scale);

  return (
    <div 
      className="overflow-auto bg-gray-200 rounded-xl p-4 max-w-full max-h-full"
      onWheel={handleWheel}
    >
      <div className="inline-block">
        <div 
          className="inline-grid border border-gray-400"
          style={{
            gridTemplateColumns: `repeat(${width}, ${displaySize}px)`,
            gap: '1px',
          }}
        >
          {pixels.flat().map((pixel, index) => {
            const textColor = isLightColor(pixel.rgb) ? '#333' : '#fff';
            return (
              <div
                key={index}
                className="rounded-sm flex items-center justify-center text-[3px] font-bold select-none"
                style={{
                  width: `${displaySize}px`,
                  height: `${displaySize}px`,
                  backgroundColor: rgbToHex(...pixel.rgb),
                  color: textColor,
                  boxShadow: "inset 0 -1px 2px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.3)",
                }}
                title={`${pixel.color.code} - ${pixel.color.name}`}
              >
                {displaySize >= 8 && pixel.color.code}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function isLightColor(rgb: [number, number, number]): boolean {
  const [r, g, b] = rgb;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}
