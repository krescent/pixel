import type { ProcessedPixel } from "../hooks/useImageProcessor";
import { rgbToHex } from "../utils/colorMatching";

interface PerlerGridProps {
  pixels: ProcessedPixel[][];
}

export function PerlerGrid({ pixels }: PerlerGridProps) {
  if (pixels.length === 0) return null;

  const width = pixels[0]?.length ?? 0;
  const displaySize = 16;

  return (
    <div 
      className="inline-grid border border-gray-400"
      style={{
        gridTemplateColumns: `repeat(${width}, ${displaySize}px)`,
        gap: '1px',
      }}
    >
      {pixels.flat().map((pixel, index) => (
        <div
          key={index}
          className="rounded-sm flex items-center justify-center text-[3px] font-bold text-gray-800 select-none"
          style={{
            width: `${displaySize}px`,
            height: `${displaySize}px`,
            backgroundColor: rgbToHex(...pixel.color.rgb),
            boxShadow: "inset 0 -1px 2px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.3)",
          }}
          title={`${pixel.color.code} - ${pixel.color.name}`}
        >
          {pixel.color.code}
        </div>
      ))}
    </div>
  );
}
