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
    const cellSize = 60;
    const gap = 4;
    
    const canvas = document.createElement("canvas");
    canvas.width = width * (cellSize + gap);
    canvas.height = height * (cellSize + gap);
    const ctx = canvas.getContext("2d");
    
    if (!ctx) {
      setIsGenerating(false);
      return;
    }
    
    ctx.fillStyle = "#888888";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    pixels.forEach((row, y) => {
      row.forEach((pixel, x) => {
        const px = x * (cellSize + gap);
        const py = y * (cellSize + gap);
        
        ctx.beginPath();
        ctx.arc(px + cellSize / 2, py + cellSize / 2, cellSize / 2 - 2, 0, Math.PI * 2);
        ctx.fillStyle = rgbToHex(...pixel.rgb);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(px + cellSize / 2 - 6, py + cellSize / 2 - 6, cellSize / 8, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.fill();
        
        const textColor = isLightColor(pixel.rgb) ? "#333333" : "#ffffff";
        ctx.fillStyle = textColor;
        ctx.font = `bold ${cellSize * 0.45}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(pixel.color.code, px + cellSize / 2, py + cellSize / 2);
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

function isLightColor(rgb: [number, number, number]): boolean {
  const [r, g, b] = rgb;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}
