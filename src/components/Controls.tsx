interface ControlsProps {
  shortEdge: number;
  onShortEdgeChange: (value: number) => void;
  beadSize: number;
  onBeadSizeChange: (value: number) => void;
  width: number;
  height: number;
}

export function Controls({
  shortEdge,
  onShortEdgeChange,
  beadSize,
  onBeadSizeChange,
  width,
  height,
}: ControlsProps) {
  const actualWidth = width > height ? shortEdge : Math.round(shortEdge * (width / height));
  const actualHeight = height > width ? shortEdge : Math.round(shortEdge * (height / width));
  const widthCm = (actualWidth * beadSize / 10).toFixed(1);
  const heightCm = (actualHeight * beadSize / 10).toFixed(1);

  return (
    <div className="space-y-6 bg-gray-50 rounded-xl p-6">
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="font-medium text-gray-700">短边像素数</label>
          <span className="text-purple-600 font-bold">{shortEdge}</span>
        </div>
        <input
          type="range"
          min="20"
          max="100"
          value={shortEdge}
          onChange={(e) => onShortEdgeChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>20 (粗略)</span>
          <span>100 (精细)</span>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="font-medium text-gray-700">拼豆尺寸</label>
          <div className="flex gap-2">
            {[3, 5].map((size) => (
              <button
                key={size}
                onClick={() => onBeadSizeChange(size)}
                className={`px-4 py-1 rounded-lg text-sm font-medium transition-colors ${
                  beadSize === size
                    ? "bg-purple-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:border-purple-400"
                }`}
              >
                {size}mm
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          <p>成品尺寸: <span className="font-medium">{widthCm}</span> × <span className="font-medium">{heightCm}</span> cm</p>
          <p className="text-xs text-gray-400 mt-1">
            像素: {actualWidth} × {actualHeight}
          </p>
        </div>
      </div>
    </div>
  );
}
