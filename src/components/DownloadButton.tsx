import { useCallback, useState } from "react";
import type { ProcessedPixel } from "../hooks/useImageProcessor";
import { rgbToHex } from "../utils/colorMatching";

interface DownloadButtonProps {
  pixels: ProcessedPixel[][];
  fillWhite: boolean;
}

export function DownloadButton({ pixels, fillWhite }: DownloadButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const downloadImage = useCallback(async (mirrored: boolean = false) => {
    if (pixels.length === 0) return;
    
    setIsGenerating(true);
    
    const colorCounts = new Map<string, { code: string; count: number; rgb: [number, number, number] }>();
    pixels.flat().forEach(p => {
      if (p.transparent) return;
      const code = p.color.code;
      if (colorCounts.has(code)) {
        colorCounts.get(code)!.count++;
      } else {
        colorCounts.set(code, { code, count: 1, rgb: p.color.rgb });
      }
    });
    const stats = Array.from(colorCounts.values()).sort((a, b) => b.count - a.count);
    
    const height = pixels.length;
    const width = pixels[0]?.length ?? 0;
    const cellSize = 40;
    const axisWidth = 40;
    
    const statsHeight = Math.ceil(stats.length / 10) * 30 + 40;
    
    const canvas = document.createElement("canvas");
    canvas.width = width * cellSize + axisWidth * 2;
    canvas.height = height * cellSize + axisWidth * 2 + statsHeight;
    const ctx = canvas.getContext("2d");
    
    if (!ctx) {
      setIsGenerating(false);
      return;
    }
    
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    pixels.forEach((row, y) => {
      row.forEach((pixel, x) => {
        if (pixel.transparent) {
          if (!fillWhite) return;
        }
        
        const drawX = mirrored ? width - 1 - x : x;
        const px = drawX * cellSize + axisWidth;
        const py = y * cellSize + axisWidth;
        
        ctx.fillStyle = rgbToHex(...pixel.rgb);
        ctx.fillRect(px, py, cellSize, cellSize);
        
        const textColor = isLightColor(pixel.rgb) ? "#333333" : "#ffffff";
        ctx.fillStyle = textColor;
        ctx.font = `bold ${cellSize * 0.35}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(pixel.color.code, px + cellSize / 2, py + cellSize / 2);
      });
    });
    
    ctx.strokeStyle = "#333333";
    ctx.lineWidth = 1;
    for (let x = 0; x <= width; x++) {
      ctx.beginPath();
      ctx.moveTo(x * cellSize + axisWidth, axisWidth);
      ctx.lineTo(x * cellSize + axisWidth, height * cellSize + axisWidth);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y++) {
      ctx.beginPath();
      ctx.moveTo(axisWidth, y * cellSize + axisWidth);
      ctx.lineTo(width * cellSize + axisWidth, y * cellSize + axisWidth);
      ctx.stroke();
    }
    
    ctx.strokeStyle = "#ff4444";
    ctx.lineWidth = 1.5;
    for (let x = 0; x <= width; x += 5) {
      ctx.beginPath();
      ctx.moveTo(x * cellSize + axisWidth, axisWidth);
      ctx.lineTo(x * cellSize + axisWidth, height * cellSize + axisWidth);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += 5) {
      ctx.beginPath();
      ctx.moveTo(axisWidth, y * cellSize + axisWidth);
      ctx.lineTo(width * cellSize + axisWidth, y * cellSize + axisWidth);
      ctx.stroke();
    }
    
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.strokeRect(axisWidth, axisWidth, width * cellSize, height * cellSize);
    
    const renderLabel = (i: number, posX: number, posY: number, isMajor: boolean) => {
      ctx.font = isMajor ? "bold 12px Arial" : "10px Arial";
      ctx.fillStyle = isMajor ? "#ff4444" : "#666666";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(i + 1), posX, posY);
    };
    
    for (let i = 0; i < width; i++) {
      const isMajor = (i + 1) % 5 === 0;
      const x = axisWidth + i * cellSize + cellSize / 2;
      renderLabel(i, x, axisWidth / 2, isMajor);
      renderLabel(i, x, axisWidth + height * cellSize + axisWidth / 2, isMajor);
    }
    
    for (let i = 0; i < height; i++) {
      const isMajor = (i + 1) % 5 === 0;
      const y = axisWidth + i * cellSize + cellSize / 2;
      renderLabel(i, axisWidth / 2, y, isMajor);
      renderLabel(i, axisWidth + width * cellSize + axisWidth / 2, y, isMajor);
    }
    
    const gridBottom = height * cellSize + axisWidth * 2 + 20;
    
    ctx.fillStyle = "#333333";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("颜色清单:", axisWidth, gridBottom);
    
    const colWidth = (width * cellSize) / 10;
    const swatchSize = Math.min(colWidth - 10, 36);
    stats.forEach((stat, idx) => {
      const col = idx % 10;
      const row = Math.floor(idx / 10);
      const x = axisWidth + col * colWidth;
      const y = gridBottom + 20 + row * (swatchSize + 4);
      
      const rgb = (stat as { code: string; count: number; rgb: [number, number, number] }).rgb;
      
      ctx.fillStyle = rgbToHex(...rgb);
      ctx.fillRect(x, y, swatchSize, swatchSize);
      
      const textColor = isLightColor(rgb) ? "#333333" : "#ffffff";
      ctx.fillStyle = textColor;
      ctx.font = `bold ${swatchSize * 0.35}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(stat.code, x + swatchSize / 2, y + swatchSize / 2);
      
      ctx.fillStyle = "#333333";
      ctx.font = `${swatchSize * 0.35}px Arial`;
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(`x${stat.count}`, x + swatchSize + 4, y + swatchSize / 2);
    });
    
    const dataUrl = canvas.toDataURL("image/png");
    
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isFirefox = /Firefox/i.test(navigator.userAgent);
    const filename = mirrored ? "perler-bead-pattern-mirrored.png" : "perler-bead-pattern.png";
    
    if (isMobile) {
      if (isFirefox) {
        const newWindow = window.open("", "_blank");
        if (newWindow) {
          newWindow.document.write(`<img src="${dataUrl}" style="max-width:100%;height:auto;">`);
        }
      } else if (isIOS) {
        try {
          const response = await fetch(dataUrl);
          const blob = await response.blob();
          const file = new File([blob], filename, { type: "image/png" });
          
          if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: "拼豆图样",
            });
            setIsGenerating(false);
            return;
          }
        } catch {
          // 静默处理分享失败
        }
        
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (navigator.share && !isFirefox) {
        try {
          const response = await fetch(dataUrl);
          const blob = await response.blob();
          const file = new File([blob], filename, { type: "image/png" });
          
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: "拼豆图样",
            });
            setIsGenerating(false);
            return;
          }
        } catch {
          // 静默处理分享失败
        }
        
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
      } else {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        
        if (isFirefox) {
          window.open(blobUrl, "_blank");
          setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
        } else {
          const link = document.createElement("a");
          link.href = blobUrl;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
        }
      }
    } else {
      const link = document.createElement("a");
      link.download = filename;
      link.href = dataUrl;
      link.click();
    }
    
    setIsGenerating(false);
  }, [pixels, fillWhite]);

  return (
    <div className="flex gap-2">
      <button
        onClick={() => downloadImage(false)}
        disabled={pixels.length === 0 || isGenerating}
        className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <span>⬇️</span>
        {isGenerating ? "生成中..." : "下载拼豆图"}
      </button>
      <button
        onClick={() => downloadImage(true)}
        disabled={pixels.length === 0 || isGenerating}
        className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <span>↔️</span>
        {isGenerating ? "生成中..." : "下载毛巾烫图"}
      </button>
    </div>
  );
}

function isLightColor(rgb: [number, number, number]): boolean {
  const [r, g, b] = rgb;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}
