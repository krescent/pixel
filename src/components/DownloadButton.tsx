import { useCallback, useState } from "react";
import type { ProcessedPixel } from "../hooks/useImageProcessor";
import { rgbToHex } from "../utils/colorMatching";

interface DownloadButtonProps {
  pixels: ProcessedPixel[][];
}

export function DownloadButton({ pixels }: DownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const downloadImage = useCallback(() => {
    if (pixels.length === 0) return;
    
    setIsGenerating(true);
    
    const height = pixels.length;
    const width = pixels[0]?.length ?? 0;
    const pixelSize = 20;
    const gap = 1;
    
    const canvas = document.createElement("canvas");
    canvas.width = width * (pixelSize + gap);
    canvas.height = height * (pixelSize + gap);
    const ctx = canvas.getContext("2d");
    
    if (!ctx) {
      setIsGenerating(false);
      return;
    }
    
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    pixels.forEach((row, y) => {
      row.forEach((pixel, x) => {
        const px = x * (pixelSize + gap);
        const py = y * (pixelSize + gap);
        
        ctx.beginPath();
        ctx.arc(px + pixelSize / 2, py + pixelSize / 2, pixelSize / 2 - 1, 0, Math.PI * 2);
        ctx.fillStyle = rgbToHex(...pixel.color.rgb);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(px + pixelSize / 2 - 2, py + pixelSize / 2 - 2, pixelSize / 4, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.fill();
      });
    });
    
    const link = document.createElement("a");
    link.download = "perler-bead-pattern.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
    
    setIsGenerating(false);
  }, [pixels]);

  return (
    <button
      onClick={downloadImage}
      disabled={pixels.length === 0 || isGenerating}
      className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
    >
      <span>⬇️</span>
      {isGenerating ? "生成中..." : "下载 PNG"}
    </button>
  );
}
