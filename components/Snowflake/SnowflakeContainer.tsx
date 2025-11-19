import React, { useState, useRef } from 'react';
import SnowflakeCanvas from './SnowflakeCanvas';
import SnowflakeLabels from './SnowflakeLabels';
import SnowflakeTooltip from './SnowflakeTooltip';
import { SnowflakeDataMap, SnowflakeMode, DimensionKey, ORDERED_KEYS } from '../../types';
import { getSnowflakeColor } from '../../utils/math';

interface Props {
  data: SnowflakeDataMap;
  mode: SnowflakeMode;
  highlightKey: DimensionKey | null;
}

const CANVAS_SIZE = 400;

const SnowflakeContainer: React.FC<Props> = ({ data, mode, highlightKey }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Interaction for Tooltip positioning
  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleClickSlice = (key: DimensionKey) => {
     alert(`Section Clicked: ${key.toUpperCase()} (Index: ${ORDERED_KEYS.indexOf(key)})`);
  };

  // Prepare tooltip data
  const hoveredKey = hoveredIndex !== null ? ORDERED_KEYS[hoveredIndex] : null;
  const tooltipData = hoveredKey ? data[hoveredKey] : null;

  const totalScore = Object.values(data).reduce((acc, c) => acc + c.score, 0);
  const color = getSnowflakeColor(totalScore, 35);

  return (
    <div 
        ref={containerRef}
        className="relative flex h-[450px] w-[450px] items-center justify-center"
        onMouseMove={handleMouseMove}
    >
      <SnowflakeCanvas
        width={CANVAS_SIZE}
        height={CANVAS_SIZE}
        data={data}
        mode={mode}
        highlightKey={highlightKey}
        hoveredIndex={hoveredIndex}
        setHoveredIndex={setHoveredIndex}
        onClickSlice={handleClickSlice}
      />
      
      <SnowflakeLabels radius={CANVAS_SIZE / 2 - 50} center={CANVAS_SIZE / 2} />

      {mode === SnowflakeMode.COMPANY && tooltipData && (
        <SnowflakeTooltip
          data={tooltipData}
          x={mousePos.x}
          y={mousePos.y}
          visible={hoveredIndex !== null}
          color={color}
        />
      )}
    </div>
  );
};

export default SnowflakeContainer;
