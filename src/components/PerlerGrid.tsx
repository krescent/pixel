import { useRef, useEffect, useState } from "react";
import type { ProcessedPixel } from "../hooks/useImageProcessor";
import { rgbToHex } from "../utils/colorMatching";

interface PerlerGridProps {
  pixels: ProcessedPixel[][];
  displayWidth: number;
}

export function PerlerGrid({ pixels, displayWidth }: PerlerGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ cellSize: 16, gridSize: 16 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const padding = 48;
      const availableWidth = rect.width - padding;
      const availableHeight = rect.height - padding;
      
      const maxCellByWidth = Math.floor(availableWidth / displayWidth);
      const maxCellByHeight = Math.floor(availableHeight / displayWidth);
      const cellSize = Math.min(maxCellByWidth, maxCellByHeight, 20);
      
      setDimensions({
        cellSize,
        gridSize: displayWidth * cellSize
      });
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(container);
    return () => observer.disconnect();
  }, [displayWidth]);

  if (pixels.length === 0) return null;

  const width = pixels[0]?.length ?? 0;
  const { cellSize, gridSize } = dimensions;
  const axisWidth = 24;
  const showCode = cellSize >= 10;
  const totalWidth = gridSize + axisWidth * 2;
  const totalHeight = gridSize + axisWidth * 2;

  const renderAxisLabels = () => {
    const labels = [];
    
    for (let i = 0; i < displayWidth; i++) {
      const isMajor = (i + 1) % 5 === 0;
      const fontSize = isMajor ? 10 : 8;
      const color = isMajor ? "#ff4444" : "#666";
      const fontWeight = isMajor ? "bold" : "normal";
      
      const xPos = axisWidth + i * cellSize + cellSize / 2;
      
      labels.push(
        <text
          key={`top-${i}`}
          x={xPos}
          y={axisWidth / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={fontSize}
          fontWeight={fontWeight}
          fill={color}
        >
          {i + 1}
        </text>
      );
      
      labels.push(
        <text
          key={`bottom-${i}`}
          x={xPos}
          y={axisWidth + gridSize + axisWidth / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={fontSize}
          fontWeight={fontWeight}
          fill={color}
        >
          {i + 1}
        </text>
      );
      
      const yPos = axisWidth + i * cellSize + cellSize / 2;
      
      labels.push(
        <text
          key={`left-${i}`}
          x={axisWidth / 2}
          y={yPos}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={fontSize}
          fontWeight={fontWeight}
          fill={color}
        >
          {i + 1}
        </text>
      );
      
      labels.push(
        <text
          key={`right-${i}`}
          x={axisWidth + gridSize + axisWidth / 2}
          y={yPos}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={fontSize}
          fontWeight={fontWeight}
          fill={color}
        >
          {i + 1}
        </text>
      );
    }
    return labels;
  };

  return (
    <div 
      ref={containerRef}
      className="flex items-center justify-center bg-white w-full h-full overflow-auto"
    >
      <svg
        width={totalWidth}
        height={totalHeight}
        style={{ flexShrink: 0 }}
      >
        <defs>
          <pattern id="gridBg" width={cellSize} height={cellSize} patternUnits="userSpaceOnUse">
            <rect width={cellSize} height={cellSize} fill="white" />
          </pattern>
        </defs>
        
        <g transform={`translate(${axisWidth}, ${axisWidth})`}>
          <rect x="0" y="0" width={gridSize} height={gridSize} fill="url(#gridBg)" />
          
          {pixels.flat().map((pixel, index) => {
            const x = index % width;
            const y = Math.floor(index / width);
            const px = x * cellSize;
            const py = y * cellSize;
            const textColor = isLightColor(pixel.rgb) ? '#333' : '#fff';
            
            return (
              <g key={index}>
                {!pixel.transparent && (
                  <rect
                    x={px}
                    y={py}
                    width={cellSize}
                    height={cellSize}
                    fill={rgbToHex(...pixel.rgb)}
                  />
                )}
                {showCode && !pixel.transparent && (
                  <text
                    x={px + cellSize / 2}
                    y={py + cellSize / 2}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={cellSize * 0.35}
                    fontWeight="bold"
                    fill={textColor}
                  >
                    {pixel.color.code}
                  </text>
                )}
              </g>
            );
          })}
          
          {Array.from({ length: width + 1 }).map((_, i) => (
            <line
              key={`v-${i}`}
              x1={i * cellSize}
              y1={0}
              x2={i * cellSize}
              y2={gridSize}
              stroke={i % 5 === 0 ? "#ff4444" : "#333"}
              strokeWidth={i % 5 === 0 ? 1.5 : 1}
            />
          ))}
          {Array.from({ length: displayWidth + 1 }).map((_, i) => (
            <line
              key={`h-${i}`}
              x1={0}
              y1={i * cellSize}
              x2={gridSize}
              y2={i * cellSize}
              stroke={i % 5 === 0 ? "#ff4444" : "#333"}
              strokeWidth={i % 5 === 0 ? 1.5 : 1}
            />
          ))}
          
          <rect x="0" y="0" width={gridSize} height={gridSize} fill="none" stroke="#000" strokeWidth="2" />
        </g>
        
        {renderAxisLabels()}
      </svg>
    </div>
  );
}

function isLightColor(rgb: [number, number, number]): boolean {
  const [r, g, b] = rgb;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}
