import { useCallback, useState } from "react";

interface ImageUploaderProps {
  onImageLoad: (imageData: ImageData, url: string) => void;
  imageUrl: string | null;
}

export function ImageUploader({ onImageLoad, imageUrl }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const processFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const url = e.target?.result as string;
        onImageLoad(imageData, url);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, [onImageLoad]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      processFile(file);
    }
  }, [processFile]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

  if (imageUrl) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 overflow-auto flex items-center justify-center bg-gray-50 rounded-xl border border-gray-200">
          <img src={imageUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
        </div>
        <div className="mt-4 flex justify-center">
          <label className="cursor-pointer px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="image-upload"
            />
            更换图片
          </label>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`h-full flex items-center justify-center border-2 border-dashed rounded-xl transition-colors ${
        isDragging ? "border-purple-500 bg-purple-50" : "border-gray-300 hover:border-gray-400"
      }`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        id="image-upload"
      />
      <label htmlFor="image-upload" className="cursor-pointer text-center p-8">
        <div className="text-6xl mb-4">📷</div>
        <p className="text-lg font-medium text-gray-700 mb-2">
          拖拽图片到这里，或点击选择
        </p>
        <p className="text-sm text-gray-500">
          支持 JPG, PNG, GIF, WebP 格式
        </p>
      </label>
    </div>
  );
}
