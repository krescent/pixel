import { useState, useCallback, useRef, useEffect } from "react";

interface ImageUploaderProps {
  onImageLoad: (imageData: ImageData, url: string) => void;
  imageUrl: string | null;
  imageWidth: number;
  imageHeight: number;
  cropSize: number;
  onCropPositionChange: (x: number, y: number) => void;
  cropPosition: { x: number; y: number };
}

export function ImageUploader({
  onImageLoad,
  imageUrl,
  imageWidth,
  imageHeight,
  cropSize,
  onCropPositionChange,
  cropPosition,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imgScale, setImgScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

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

  useEffect(() => {
    if (imgRef.current) {
      const updateScale = () => {
        setImgScale(imgRef.current!.clientWidth / imageWidth);
      };
      
      const observer = new ResizeObserver(updateScale);
      observer.observe(imgRef.current);
      updateScale();
      
      return () => observer.disconnect();
    }
  }, [imageUrl, imageWidth]);

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

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !imgRef.current) return;

    const dx = (e.clientX - dragStart.x) / imgScale;
    const dy = (e.clientY - dragStart.y) / imgScale;

    const maxX = imageWidth - cropSize;
    const maxY = imageHeight - cropSize;

    const newX = Math.max(0, Math.min(maxX, cropPosition.x + dx));
    const newY = Math.max(0, Math.min(maxY, cropPosition.y + dy));

    onCropPositionChange(Math.round(newX), Math.round(newY));
    setDragStart({ x: e.clientX, y: e.clientY });
  }, [isDragging, dragStart, imgScale, imageWidth, imageHeight, cropSize, cropPosition, onCropPositionChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  if (imageUrl) {
    return (
      <div className="h-full flex flex-col">
        <div 
          ref={containerRef}
          className="flex-1 overflow-hidden flex items-center justify-center bg-gray-100 rounded-xl border border-gray-200 relative"
        >
          <img 
            ref={imgRef}
            src={imageUrl} 
            alt="Preview" 
            className="max-w-full max-h-full object-contain select-none"
            draggable={false}
          />
          
          <div
            className="absolute border-4 border-blue-500 bg-blue-500/20 cursor-move group"
            style={{
              left: `${cropPosition.x * imgScale}px`,
              top: `${cropPosition.y * imgScale}px`,
              width: `${cropSize * imgScale}px`,
              height: `${cropSize * imgScale}px`,
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <div className="absolute inset-0 border-2 border-white/50" />
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              拖动调整取景框
            </div>
            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-1 py-0.5 rounded">
              {cropSize}x{cropSize}
            </div>
          </div>
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
