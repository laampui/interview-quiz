import React from 'react';
import { DimensionData } from '../../types';

interface SnowflakeTooltipProps {
  data: DimensionData;
  x: number;
  y: number;
  visible: boolean;
  color: string;
}

const SnowflakeTooltip: React.FC<SnowflakeTooltipProps> = ({
  data,
  x,
  y,
  visible,
  color,
}) => {
  if (!visible) return null;

  return (
    <div
      className="pointer-events-none absolute z-50 w-64 rounded-lg bg-gray-900 p-4 shadow-xl ring-1 ring-gray-700 transition-opacity duration-200"
      style={{
        left: x,
        top: y,
        transform: 'translate(-50%, -110%)', // Position above cursor
        opacity: visible ? 1 : 0,
      }}
    >
      <div className="mb-2 flex items-center justify-between border-b border-gray-700 pb-2">
        <span className="text-sm font-bold uppercase tracking-wider text-gray-300">
          {data.key}
        </span>
        <span className="font-mono text-lg font-bold" style={{ color }}>
          {data.score}/7
        </span>
      </div>
      
      <p className="mb-3 text-xs leading-relaxed text-gray-400">
        {data.description}
      </p>

      {/* Mini visualization of the 6 checks */}
      <div className="flex justify-between gap-1">
        {data.section.map((pass, idx) => (
          <div
            key={idx}
            className={`h-1.5 flex-1 rounded-full ${
              pass ? 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.6)]' : 'bg-gray-700'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default SnowflakeTooltip;
