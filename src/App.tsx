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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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
    <div className="h-screen bg-gradient-to-br from-purple-50 to-blue-50 overflow-hidden">
      <div className="flex h-full p-2">
        <div className="flex-1 flex flex-col lg:flex-row gap-2 overflow-y-auto lg:overflow-hidden snap-y lg:snap-none">
          <div className="w-full lg:w-1/2 h-screen lg:h-full flex-shrink-0 snap-start">
            <div className="h-full bg-white rounded-xl border border-gray-200 flex flex-col p-4">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">原图预览</h2>
              <div className="flex-1 min-h-0 overflow-auto">
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

          <div className="w-full lg:w-1/2 h-screen lg:h-full flex-shrink-0 snap-start">
            <div className="h-full bg-white rounded-xl border border-gray-200 flex flex-col p-4">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">拼豆图样预览</h2>
              <div className="flex-1 min-h-0 flex flex-col overflow-auto">
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
        </div>
      </div>

      {!sidebarCollapsed && (
        <button
          onClick={() => setSidebarCollapsed(true)}
          className="fixed right-2 top-2 w-10 h-10 bg-white rounded-lg shadow-lg flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors z-30"
          title="展开设置"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      )}

      {sidebarCollapsed && (
        <div className="fixed inset-0 bg-black/50 z-20 flex items-center justify-center p-8" onClick={() => setSidebarCollapsed(false)}>
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-xl w-full h-full overflow-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-xl font-bold text-gray-800">🎨 拼豆图样生成器</h1>
              <button
                onClick={() => setSidebarCollapsed(false)}
                className="w-8 h-8 bg-white rounded-lg shadow-md flex items-center justify-center text-gray-600 hover:text-gray-900"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex flex-wrap gap-4 flex-1 overflow-auto">
              <div className="flex-1 min-w-[300px] bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">⚙️ 设置</h2>
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
              </div>

              {processed && (
                <div className="flex-1 min-w-[300px] bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <h2 className="text-lg font-semibold text-gray-700 mb-3">📊 图样统计</h2>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>像素尺寸: <span className="font-medium">{processed.width} x {processed.height}</span></p>
                    {(() => {
                      const total = processed.pixels.flat().length;
                      const transparentCount = processed.pixels.flat().filter(p => p.transparent).length;
                      const colorCount = new Set(processed.pixels.flat().filter(p => !p.transparent).map(p => p.color.code)).size;
                      return (
                        <>
                          <p>拼豆总数: <span className="font-medium">{fillWhite ? total : total - transparentCount}</span> {!fillWhite && transparentCount > 0 && <span className="text-gray-400">(透明: {transparentCount})</span>}</p>
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

              <div className="flex-1 min-w-[300px] bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <h2 className="text-lg font-semibold text-gray-700 mb-3">📖 使用说明</h2>
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
      )}
    </div>
  );
}

export default App;
