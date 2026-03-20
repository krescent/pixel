import { useState } from "react";
import { ImageUploader } from "./components/ImageUploader";
import { PerlerGrid } from "./components/PerlerGrid";
import { Controls } from "./components/Controls";
import { DownloadButton } from "./components/DownloadButton";
import { useImageProcessor } from "./hooks/useImageProcessor";

function App() {
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [shortEdge, setShortEdge] = useState(50);
  const [beadSize, setBeadSize] = useState(3);
  const { processImage } = useImageProcessor();

  const handleImageLoad = (data: ImageData) => {
    setImageData(data);
  };

  const processed = imageData ? processImage(imageData, shortEdge) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🎨 拼豆图样生成器</h1>
          <p className="text-gray-600">上传图片，生成拼豆图样</p>
        </header>

        <div className="space-y-6">
          {!imageData && <ImageUploader onImageLoad={handleImageLoad} />}

          {processed && (
            <>
              <Controls
                shortEdge={shortEdge}
                onShortEdgeChange={setShortEdge}
                beadSize={beadSize}
                onBeadSizeChange={setBeadSize}
                width={processed.width}
                height={processed.height}
              />

              <div className="flex justify-center overflow-auto pb-4">
                <PerlerGrid pixels={processed.pixels} beadSize={beadSize} />
              </div>

              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setImageData(null)}
                  className="px-6 py-3 bg-gray-600 text-white rounded-xl font-medium hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <span>🔄</span>
                  重新上传
                </button>
                <DownloadButton pixels={processed.pixels} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
