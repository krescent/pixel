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
        backgroundColor: '#888',
      }}
    >
      {pixels.flat().map((pixel, index) => (
        <div
          key={index}
          className="rounded-sm flex items-center justify-center text-[3px] font-bold select-none"
          style={{
            width: `${displaySize}px`,
            height: `${displaySize}px`,
            backgroundColor: pixel.transparent ? 'transparent' : rgbToHex(...pixel.color?.rgb ?? [255, 255, 255]),
            color: pixel.transparent ? 'transparent' : (isLightColor(pixel.color?.rgb) ? '#333' : '#fff'),
            boxShadow: pixel.transparent ? 'none' : "inset 0 -1px 2px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.3)",
          }}
          title={pixel.transparent ? '透明' : `${pixel.color?.code} - ${pixel.color?.name}`}
        >
          {pixel.transparent ? '' : pixel.color?.code}
        </div>
      ))}
    </div>
  );
}

function isLightColor(rgb?: [number, number, number]): boolean {
  if (!rgb) return false;
  const [r, g, b] = rgb;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}
