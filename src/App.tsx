import { useState, useCallback, useMemo } from "react";
import { ImageUploader } from "./components/ImageUploader";
import { PerlerGrid } from "./components/PerlerGrid";
import { Controls } from "./components/Controls";
import { DownloadButton } from "./components/DownloadButton";
import { useImageProcessor } from "./hooks/useImageProcessor";


function App() {
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [shortEdge, setShortEdge] = useState(50);
  const [beadSize, setBeadSize] = useState(3);
  const [cropPosition, setCropPosition] = useState({ x: 0, y: 0 });
  const [colorBrand, setColorBrand] = useState("MARD 221色");
  const [fillWhite, setFillWhite] = useState(true);
  const { processImage } = useImageProcessor();

  const imageShortEdge = imageData ? Math.min(imageData.width, imageData.height) : 0;

  const handleImageLoad = useCallback((data: ImageData, url: string) => {
    setImageData(data);
    setImageUrl(url);
    setCropPosition({ x: 0, y: 0 });
  }, []);

  const handleCropPositionChange = useCallback((x: number, y: number) => {
    setCropPosition({ x, y });
  }, []);

  const handleShortEdgeChange = useCallback((value: number) => {
    setShortEdge(value);
  }, []);

  const croppedImageData = useMemo(() => {
    if (!imageData) return null;
    
    const { data, width: srcWidth, height: srcHeight } = imageData;
    const { x: cropX, y: cropY } = cropPosition;
    const cropSize = imageShortEdge;
    
    if (cropX + cropSize > srcWidth || cropY + cropSize > srcHeight) {
      return null;
    }
    
    const canvas = document.createElement("canvas");
    canvas.width = cropSize;
    canvas.height = cropSize;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const imageDataCropped = ctx.createImageData(cropSize, cropSize);
    
    for (let y = 0; y < cropSize; y++) {
      for (let x = 0; x < cropSize; x++) {
        const srcIndex = ((cropY + y) * srcWidth + (cropX + x)) * 4;
        const dstIndex = (y * cropSize + x) * 4;
        
        imageDataCropped.data[dstIndex] = data[srcIndex];
        imageDataCropped.data[dstIndex + 1] = data[srcIndex + 1];
        imageDataCropped.data[dstIndex + 2] = data[srcIndex + 2];
        imageDataCropped.data[dstIndex + 3] = data[srcIndex + 3];
      }
    }
    
    return imageDataCropped;
  }, [imageData, cropPosition, imageShortEdge]);

  const processed = croppedImageData ? processImage(croppedImageData, shortEdge, colorBrand, fillWhite) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-800">🎨 拼豆图样生成器</h1>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        <div className="flex-1 p-4 flex flex-col gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex-1 flex flex-col p-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">原图预览</h2>
            <div className="flex-1 min-h-0">
              <ImageUploader
                onImageLoad={handleImageLoad}
                imageUrl={imageUrl}
                imageWidth={imageData?.width ?? 0}
                imageHeight={imageData?.height ?? 0}
                cropSize={imageShortEdge}
                onCropPositionChange={handleCropPositionChange}
                cropPosition={cropPosition}
              />
            </div>
          </div>
        </div>

        <div className="flex-1 p-4 flex flex-col gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex-1 flex flex-col p-4">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">拼豆图样预览</h2>
            <div className="flex-1 min-h-0 flex flex-col">
              <div className="flex-1 flex items-center justify-center">
                {processed ? (
                  <PerlerGrid 
                    pixels={processed.pixels} 
                    displayWidth={shortEdge}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                    <p>上传图片后将显示拼豆图样</p>
                  </div>
                )}
              </div>
              {processed && (
                <div className="mt-4">
                  <DownloadButton pixels={processed.pixels} fillWhite={fillWhite} />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="w-80 border-l border-gray-200 bg-white p-4 overflow-auto">
          <h2 className="text-lg font-semibold text-gray-700 mb-6">设置</h2>
          
          <Controls
            shortEdge={shortEdge}
            onShortEdgeChange={handleShortEdgeChange}
            beadSize={beadSize}
            onBeadSizeChange={setBeadSize}
            colorBrand={colorBrand}
            onColorBrandChange={setColorBrand}
            fillWhite={fillWhite}
            onFillWhiteChange={setFillWhite}
          />

          {processed && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="font-medium text-gray-700 mb-3">图样统计</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>像素尺寸: <span className="font-medium">{processed.width} x {processed.height}</span></p>
                {(() => {
                  const total = processed.pixels.flat().length;
                  const transparentCount = processed.pixels.flat().filter(p => p.transparent).length;
                  const colorCount = new Set(processed.pixels.flat().filter(p => !p.transparent).map(p => p.color.code)).size;
                  return (
                    <>
                      <p>拼豆总数: <span className="font-medium">{total - transparentCount}</span> {transparentCount > 0 && <span className="text-gray-400">(不含透明: {total})</span>}</p>
                      <p>使用颜色: <span className="font-medium">{colorCount}</span></p>
                    </>
                  );
                })()}
              </div>
              <div className="mt-4 space-y-1">
                <h4 className="text-sm font-medium text-gray-700">颜色清单:</h4>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {(() => {
                    const colorCounts = new Map<string, { count: number; rgb: [number, number, number]; name: string }>();
                    processed.pixels.flat().forEach(p => {
                      if (p.transparent) return;
                      const code = p.color.code;
                      if (colorCounts.has(code)) {
                        colorCounts.get(code)!.count++;
                      } else {
                        colorCounts.set(code, { count: 1, rgb: p.color.rgb, name: p.color.name });
                      }
                    });
                    return Array.from(colorCounts.entries())
                      .sort((a, b) => b[1].count - a[1].count)
                      .map(([code, { count, rgb }]) => {
                        const isLight = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255 > 0.5;
                        return (
                          <div key={code} className="flex items-center gap-1 text-xs">
                            <div 
                              className="w-5 h-5 rounded flex-shrink-0 flex items-center justify-center font-bold"
                              style={{ 
                                backgroundColor: `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`,
                                color: isLight ? '#333' : '#fff',
                                fontSize: '7px'
                              }}
                            >
                              {code}
                            </div>
                            <span className="text-gray-600 text-xs">x{count}</span>
                          </div>
                        );
                      });
                  })()}
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-medium text-gray-700 mb-3">使用说明</h3>
            <ul className="text-sm text-gray-500 space-y-2">
              <li>1. 在左侧上传图片</li>
              <li>2. 拖动蓝色取景框调整区域</li>
              <li>3. 调整滑轨控制像素数</li>
              <li>4. 选择拼豆尺寸</li>
              <li>5. 点击下载保存图样</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
