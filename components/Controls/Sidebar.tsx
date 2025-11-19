import React from 'react';
import {
  SnowflakeDataMap,
  DimensionKey,
  ORDERED_KEYS,
  MAX_SCORE,
  SnowflakeMode,
} from '../../types';

interface Props {
  data: SnowflakeDataMap;
  onUpdateScore: (key: DimensionKey, val: number) => void;
  highlightKey: DimensionKey | null;
  onSelectHighlight: (key: DimensionKey) => void;
  onReset: () => void;
  mode: SnowflakeMode;
}

const Sidebar: React.FC<Props> = ({
  data,
  onUpdateScore,
  highlightKey,
  onSelectHighlight,
  onReset,
  mode,
}) => {
  return (
    <div className="flex w-full flex-col gap-6 rounded-xl border border-gray-800 bg-gray-900 p-6 shadow-2xl lg:w-80">
      <div>
        <h2 className="mb-1 text-xl font-bold text-white">Configuration</h2>
        <p className="text-sm text-gray-400">Adjust scores & visualize</p>
      </div>

      {/* Inputs */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between border-b border-gray-800 pb-2 text-xs font-semibold uppercase text-gray-500">
          <span>Dimension</span>
          <span>Score (0-7)</span>
        </div>
        {ORDERED_KEYS.map((key) => (
          <div key={key} className="flex items-center justify-between">
            <label className="text-sm font-medium capitalize text-gray-300">
              {key}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max={MAX_SCORE}
                step="1"
                value={data[key].score}
                onChange={(e) => onUpdateScore(key, parseInt(e.target.value))}
                className="h-2 w-24 cursor-pointer appearance-none rounded-lg bg-gray-700 accent-blue-500"
              />
              <span className="w-4 text-right font-mono text-sm text-white">
                {data[key].score}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Highlight Selection (TOC Mode) */}
      <div className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold uppercase text-gray-500">
          Focus Area (TOC Mode)
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {ORDERED_KEYS.map((key) => (
            <button
              key={key}
              onClick={() => onSelectHighlight(key)}
              className={`rounded px-3 py-2 text-xs font-medium uppercase transition-all ${
                mode === SnowflakeMode.TOC && highlightKey === key
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      {/* Reset */}
      <div className="mt-auto pt-4">
        <button
          onClick={onReset}
          className="w-full rounded-lg bg-red-500/10 py-3 text-sm font-bold text-red-400 transition-colors hover:bg-red-500 hover:text-white"
        >
          Reset Data
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
