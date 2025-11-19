import React from 'react';
import { ORDERED_KEYS, DimensionKey } from '../../types';
import { polarToCartesian } from '../../utils/math';

interface Props {
  radius: number;
  center: number;
}

const SnowflakeLabels: React.FC<Props> = ({ radius, center }) => {
  return (
    <div className="pointer-events-none absolute inset-0 h-full w-full">
      {ORDERED_KEYS.map((key, i) => {
        const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
        // Push labels out slightly further than the grid
        const pos = polarToCartesian(center, center, radius + 30, angle);
        
        return (
          <div
            key={key}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center"
            style={{ left: pos.x, top: pos.y }}
          >
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400 drop-shadow-md">
              {key}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default SnowflakeLabels;
