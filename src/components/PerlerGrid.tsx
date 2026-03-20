import { useRef, useEffect, useState } from "react";
import type { ProcessedPixel } from "../hooks/useImageProcessor";
import { rgbToHex } from "../utils/colorMatching";

interface PerlerGridProps {
  pixels: ProcessedPixel[][];
  displayWidth: number;
}

export function PerlerGrid({ pixels, displayWidth }: PerlerGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState(16);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const padding = 32;
      const availableWidth = rect.width - padding;
      const availableHeight = rect.height - padding;
      const size = Math.min(availableWidth, availableHeight, displayWidth);
      setCellSize(size);
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(container);
    return () => observer.disconnect();
  }, [displayWidth]);

  if (pixels.length === 0) return null;

  const width = pixels[0]?.length ?? 0;
  const gridWidth = width * cellSize;
  const gridHeight = width * cellSize;
  const showCode = cellSize >= 10;

  return (
    <div 
      ref={containerRef}
      className="flex items-center justify-center bg-gray-500 rounded-xl p-4 w-full h-full overflow-hidden"
    >
      <div 
        style={{
          width: `${gridWidth}px`,
          height: `${gridHeight}px`,
          flexShrink: 0,
        }}
      >
        <div 
          className="grid w-full h-full"
          style={{
            gridTemplateColumns: `repeat(${width}, 1fr)`,
            gap: '1px',
          }}
        >
          {pixels.flat().map((pixel, index) => {
            const textColor = isLightColor(pixel.rgb) ? '#333' : '#fff';
            return (
              <div
                key={index}
                className="rounded-full flex items-center justify-center font-bold select-none aspect-square"
                style={{
                  backgroundColor: rgbToHex(...pixel.rgb),
                  color: textColor,
                  fontSize: `${Math.max(4, cellSize * 0.35)}px`,
                  boxShadow: "inset 0 -2px 4px rgba(0,0,0,0.2), inset 0 2px 4px rgba(255,255,255,0.3)",
                }}
                title={`${pixel.color.code} - ${pixel.color.name}`}
              >
                {showCode && pixel.color.code}
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
