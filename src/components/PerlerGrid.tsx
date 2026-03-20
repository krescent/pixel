import type { ProcessedPixel } from "../hooks/useImageProcessor";
import { rgbToHex } from "../utils/colorMatching";

interface PerlerGridProps {
  pixels: ProcessedPixel[][];
  beadSize: number;
}

export function PerlerGrid({ pixels, beadSize }: PerlerGridProps) {
  if (pixels.length === 0) return null;

  const width = pixels[0]?.length ?? 0;
  const beadPx = beadSize;
  const gap = 1;

  return (
    <div 
      className="inline-grid border border-gray-300"
      style={{
        gridTemplateColumns: `repeat(${width}, ${beadPx}px)`,
        gap: `${gap}px`,
      }}
    >
      {pixels.flat().map((pixel, index) => (
        <div
          key={index}
          className="rounded-full"
          style={{
            width: `${beadPx}px`,
            height: `${beadPx}px`,
            backgroundColor: rgbToHex(...pixel.color.rgb),
            boxShadow: "inset 0 -2px 4px rgba(0,0,0,0.2), inset 0 2px 4px rgba(255,255,255,0.3)",
          }}
          title={pixel.color.name}
        />
      ))}
    </div>
  );
}
