import { useState, useCallback, useRef, useEffect } from "react";
import type { WheelEvent } from "react";
import type { ProcessedPixel } from "../hooks/useImageProcessor";
import { rgbToHex } from "../utils/colorMatching";

interface PerlerGridProps {
  pixels: ProcessedPixel[][];
  displayWidth: number;
}

export function PerlerGrid({ pixels, displayWidth }: PerlerGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const handleWheel = useCallback((e: WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left + container.scrollLeft;
    const mouseY = e.clientY - rect.top + container.scrollTop;

    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newScale = Math.max(0.5, Math.min(10, scale + delta));
    
    const scaleRatio = newScale / scale;
    const newScrollX = mouseX * scaleRatio - (e.clientX - rect.left);
    const newScrollY = mouseY * scaleRatio - (e.clientY - rect.top);

    setScale(newScale);
    
    requestAnimationFrame(() => {
      container.scrollLeft = newScrollX;
      container.scrollTop = newScrollY;
    });
  }, [scale]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const fitScale = Math.min(
      container.clientWidth / (displayWidth),
      container.clientHeight / (displayWidth)
    );
    setScale(fitScale);
    
    const scrollX = (displayWidth * fitScale - container.clientWidth) / 2;
    const scrollY = (displayWidth * fitScale - container.clientHeight) / 2;
    container.scrollLeft = scrollX;
    container.scrollTop = scrollY;
  }, [displayWidth]);

  if (pixels.length === 0) return null;

  const width = pixels[0]?.length ?? 0;
  const baseSize = displayWidth / width;
  const displaySize = Math.round(baseSize * scale);

  return (
    <div 
      ref={containerRef}
      className="overflow-auto bg-gray-500 rounded-xl p-4"
      onWheel={handleWheel}
      style={{
        maxWidth: '100%',
        maxHeight: '100%',
      }}
    >
      <div className="inline-block">
        <div 
          className="inline-grid border-2 border-gray-600"
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
