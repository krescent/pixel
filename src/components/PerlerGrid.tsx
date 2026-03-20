import { useState, useRef, useEffect, useCallback } from "react";
import type { ProcessedPixel } from "../hooks/useImageProcessor";
import { rgbToHex } from "../utils/colorMatching";

interface PerlerGridProps {
  pixels: ProcessedPixel[][];
  displayWidth: number;
}

export function PerlerGrid({ pixels, displayWidth }: PerlerGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scaleRef = useRef(1);
  const [scale, setScale] = useState(1);
  const isUserZooming = useRef(false);

  const fitToContainer = useCallback(() => {
    if (isUserZooming.current) return;
    
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const padding = 32;
    const fitScale = Math.min(
      (rect.width - padding) / displayWidth,
      (rect.height - padding) / displayWidth
    );

    scaleRef.current = fitScale;
    setScale(fitScale);
    
    requestAnimationFrame(() => {
      const contentWidth = displayWidth * fitScale;
      const contentHeight = displayWidth * fitScale;
      container.scrollLeft = Math.max(0, (contentWidth - rect.width + padding) / 2);
      container.scrollTop = Math.max(0, (contentHeight - rect.height + padding) / 2);
    });
  }, [displayWidth]);

  useEffect(() => {
    isUserZooming.current = false;
    fitToContainer();
  }, [fitToContainer, displayWidth]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      if (!isUserZooming.current) {
        fitToContainer();
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [fitToContainer]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const container = containerRef.current;
    if (!container) return;

    isUserZooming.current = true;
    
    const rect = container.getBoundingClientRect();
    const oldScale = scaleRef.current;
    
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.5, Math.min(10, oldScale * delta));
    scaleRef.current = newScale;
    setScale(newScale);

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const contentX = container.scrollLeft + mouseX;
    const contentY = container.scrollTop + mouseY;
    
    const newContentX = (contentX / oldScale) * newScale;
    const newContentY = (contentY / oldScale) * newScale;

    container.scrollLeft = newContentX - mouseX;
    container.scrollTop = newContentY - mouseY;
  };

  if (pixels.length === 0) return null;

  const width = pixels[0]?.length ?? 0;
  const displaySize = displayWidth * scale;
  const showCode = displaySize / width >= 8;

  return (
    <div 
      ref={containerRef}
      className="overflow-auto bg-gray-500 rounded-xl p-4"
      onWheel={handleWheel}
      style={{ width: '100%', height: '100%' }}
    >
      <div 
        className="inline-block"
        style={{
          width: `${displaySize}px`,
          height: `${displaySize}px`,
        }}
      >
        <div 
          className="inline-grid border-2 border-gray-600 w-full h-full"
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
                className="rounded-sm flex items-center justify-center text-[3px] font-bold select-none aspect-square"
                style={{
                  backgroundColor: rgbToHex(...pixel.rgb),
                  color: textColor,
                  boxShadow: "inset 0 -1px 2px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.3)",
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
