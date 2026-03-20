import { useState } from "react";
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
  const [originalWidth, setOriginalWidth] = useState(0);
  const [originalHeight, setOriginalHeight] = useState(0);
  const { processImage } = useImageProcessor();

  const handleImageLoad = (data: ImageData, url: string) => {
    setImageData(data);
    setImageUrl(url);
    setOriginalWidth(data.width);
    setOriginalHeight(data.height);
  };

  const processed = imageData ? processImage(imageData, shortEdge) : null;

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
              <ImageUploader onImageLoad={handleImageLoad} imageUrl={imageUrl} />
            </div>
          </div>
        </div>

        <div className="flex-1 p-6 overflow-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
            <div className="flex items-center justify-between px-4 pt-4 mb-4">
              <h2 className="text-lg font-semibold text-gray-700">拼豆图样预览</h2>
              {processed && <DownloadButton pixels={processed.pixels} />}
            </div>
            <div className="flex-1 px-4 pb-4 overflow-auto">
              {processed ? (
                <PerlerGrid pixels={processed.pixels} beadSize={beadSize} />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
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
            onShortEdgeChange={setShortEdge}
            beadSize={beadSize}
            onBeadSizeChange={setBeadSize}
            width={originalWidth}
            height={originalHeight}
          />

          {processed && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="font-medium text-gray-700 mb-3">图样统计</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>总像素: <span className="font-medium">{processed.width * processed.height}</span></p>
                <p>宽 x 高: <span className="font-medium">{processed.width} x {processed.height}</span></p>
                <p>使用颜色: <span className="font-medium">{new Set(processed.pixels.flat().map(p => p.color.name)).size}</span></p>
              </div>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-medium text-gray-700 mb-3">使用说明</h3>
            <ul className="text-sm text-gray-500 space-y-2">
              <li>1. 在左侧上传图片</li>
              <li>2. 调整滑轨控制像素数</li>
              <li>3. 选择拼豆尺寸</li>
              <li>4. 点击下载保存图样</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
