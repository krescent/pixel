import { COLOR_BRANDS } from "../utils/perlerColors";

interface ControlsProps {
  shortEdge: number;
  onShortEdgeChange: (value: number) => void;
  beadSize: number;
  onBeadSizeChange: (value: number) => void;
  colorBrand: string;
  onColorBrandChange: (value: string) => void;
  fillWhite: boolean;
  onFillWhiteChange: (value: boolean) => void;
}

export function Controls({
  shortEdge,
  onShortEdgeChange,
  beadSize,
  onBeadSizeChange,
  colorBrand,
  onColorBrandChange,
  fillWhite,
  onFillWhiteChange,
}: ControlsProps) {
  const sizeCm = (shortEdge * beadSize / 10).toFixed(1);

  return (
    <div className="space-y-5 bg-gray-50 rounded-xl p-4">
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="font-medium text-gray-700">拼豆像素数</label>
          <span className="text-purple-600 font-bold">{shortEdge} x {shortEdge}</span>
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
        <div className="flex justify-between items-center">
          <label className="font-medium text-gray-700">拼豆尺寸</label>
          <div className="flex gap-2">
            {[3, 5].map((size) => (
              <button
                key={size}
                onClick={() => onBeadSizeChange(size)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
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

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="font-medium text-gray-700">色系品牌</label>
        </div>
        <select
          value={colorBrand}
          onChange={(e) => onColorBrandChange(e.target.value)}
          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:border-purple-500"
        >
          {COLOR_BRANDS.map((brand) => (
            <option key={brand.name} value={brand.name}>
              {brand.name} ({brand.colors.length}色)
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="font-medium text-gray-700 mb-2 block">背景处理</label>
        <div className="flex gap-2">
          <button
            onClick={() => onFillWhiteChange(false)}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              !fillWhite
                ? "bg-purple-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:border-purple-400"
            }`}
          >
            保留透明
          </button>
          <button
            onClick={() => onFillWhiteChange(true)}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              fillWhite
                ? "bg-purple-600 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:border-purple-400"
            }`}
          >
            填充白色
          </button>
        </div>
      </div>

      <div className="pt-3 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          <p>成品尺寸: <span className="font-medium">{sizeCm}</span> x <span className="font-medium">{sizeCm}</span> cm</p>
        </div>
      </div>
    </div>
  );
}
