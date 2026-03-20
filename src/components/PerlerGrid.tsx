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
  const scaleRef = useRef(1);
  const [scale, setScale] = useState(1);

  const fitToContainer = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const fitScale = Math.min(
      rect.width / displayWidth,
      rect.height / displayWidth
    );

    scaleRef.current = fitScale;
    setScale(fitScale);

    const scrollX = (displayWidth * fitScale - rect.width) / 2;
    const scrollY = (displayWidth * fitScale - rect.height) / 2;
    container.scrollLeft = scrollX;
    container.scrollTop = scrollY;
  }, [displayWidth]);

  const handleDoubleClick = useCallback(() => {
    fitToContainer();
  }, [fitToContainer]);

  const handleWheel = useCallback((e: WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    let newScale = scaleRef.current * delta;
    newScale = Math.max(0.5, Math.min(10, newScale));

    const mouseRatioX = mouseX / (displayWidth * scaleRef.current);
    const mouseRatioY = mouseY / (displayWidth * scaleRef.current);

    scaleRef.current = newScale;
    setScale(newScale);

    requestAnimationFrame(() => {
      const newMouseX = mouseRatioX * displayWidth * newScale;
      const newMouseY = mouseRatioY * displayWidth * newScale;
      container.scrollLeft = newMouseX - mouseX;
      container.scrollTop = newMouseY - mouseY;
    });
  }, [displayWidth]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || pixels.length === 0) return;

    const timeoutId = setTimeout(fitToContainer, 0);

    const observer = new ResizeObserver(fitToContainer);
    observer.observe(container);

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [displayWidth, pixels.length, fitToContainer]);

  if (pixels.length === 0) return null;

  const width = pixels[0]?.length ?? 0;
  const displaySize = displayWidth * scale;
  const showCode = displaySize / width >= 8;

  return (
    <div 
      ref={containerRef}
      className="overflow-auto bg-gray-500 rounded-xl p-4"
      onWheel={handleWheel}
      onDoubleClick={handleDoubleClick}
      style={{
        width: '100%',
        height: '100%',
      }}
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
