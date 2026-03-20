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

  const processed = croppedImageData ? processImage(croppedImageData, shortEdge) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-800">🎨 拼豆图样生成器</h1>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        <div className="flex-1 p-6 overflow-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
            <h2 className="text-lg font-semibold text-gray-700 px-4 pt-4 mb-4">原图预览</h2>
            <div className="flex-1 px-4 pb-4 overflow-auto">
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

        <div className="flex-1 p-6 overflow-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
            <div className="flex items-center justify-between px-4 pt-4 mb-4">
              <h2 className="text-lg font-semibold text-gray-700">拼豆图样预览</h2>
              {processed && <DownloadButton pixels={processed.pixels} />}
            </div>
            <div className="flex-1 px-4 pb-4 flex items-center justify-center">
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
          </div>
        </div>

        <div className="w-80 border-l border-gray-200 bg-white p-6 overflow-auto">
          <h2 className="text-lg font-semibold text-gray-700 mb-6">设置</h2>
          
          <Controls
            shortEdge={shortEdge}
            onShortEdgeChange={handleShortEdgeChange}
            beadSize={beadSize}
            onBeadSizeChange={setBeadSize}
          />

          {processed && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="font-medium text-gray-700 mb-3">图样统计</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>像素尺寸: <span className="font-medium">{processed.width} x {processed.height}</span></p>
                <p>使用颜色: <span className="font-medium">{new Set(processed.pixels.flat().map(p => p.color.code)).size}</span></p>
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
