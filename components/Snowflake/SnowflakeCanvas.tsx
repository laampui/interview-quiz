import React, { useRef, useEffect, useMemo } from 'react';
import {
  SnowflakeDataMap,
  SnowflakeMode,
  ORDERED_KEYS,
  MAX_SCORE,
  COLOR_RED,
  COLOR_GREEN,
  DimensionKey,
} from '../../types';
import {
  polarToCartesian,
  calculateControlPoints,
  getSnowflakeColor,
} from '../../utils/math';

interface Props {
  data: SnowflakeDataMap;
  mode: SnowflakeMode;
  width: number;
  height: number;
  highlightKey?: DimensionKey | null;
  hoveredIndex: number | null;
  setHoveredIndex: (index: number | null) => void;
  onClickSlice?: (key: DimensionKey) => void;
}

const SnowflakeCanvas: React.FC<Props> = ({
  data,
  mode,
  width,
  height,
  highlightKey,
  hoveredIndex,
  setHoveredIndex,
  onClickSlice,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Calculate total score for color
  const totalScore = useMemo(() => {
    return Object.values(data).reduce((acc, curr) => acc + curr.score, 0);
  }, [data]);

  const maxTotal = MAX_SCORE * 5;
  const mainColor = getSnowflakeColor(totalScore, maxTotal);

  const centerX = width / 2;
  const centerY = height / 2;
  const maxRadius = (Math.min(width, height) / 2) - 50; // Padding for labels
  const sliceAngle = (Math.PI * 2) / 5;
  const startAngle = -Math.PI / 2;

  // --- Draw Function ---
  const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, width, height);

    // 1. Draw Background Rings (7 levels)
    for (let i = 1; i <= 7; i++) {
      const r = (maxRadius / MAX_SCORE) * i;
      ctx.beginPath();
      ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
      // Alternating colors
      ctx.fillStyle = i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.06)';
      ctx.fill();
      
      // Last ring stroke
      if (i === 7) {
         ctx.strokeStyle = 'rgba(255,255,255,0.1)';
         ctx.lineWidth = 1;
         ctx.stroke();
      }
    }

    // 2. Draw Axes
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = startAngle + i * sliceAngle;
      const end = polarToCartesian(centerX, centerY, maxRadius, angle);
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(end.x, end.y);
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Helper: Get points for the blob
    const points = ORDERED_KEYS.map((key, i) => {
      const val = data[key].score;
      // Min radius avoids collapsing to center completely for aesthetics
      const r = (val / MAX_SCORE) * maxRadius;
      const angle = startAngle + i * sliceAngle;
      return polarToCartesian(centerX, centerY, Math.max(r, 2), angle); // min radius 2
    });

    // Helper: Build Path
    const createSnowflakePath = (scale: number = 1) => {
        const path = new Path2D();
        const len = points.length;
        
        // If scaling, we scale radius from center
        const scaledPoints = points.map((p, i) => {
             if (scale === 1) return p;
             const angle = startAngle + i * sliceAngle;
             const val = data[ORDERED_KEYS[i]].score;
             const r = (val / MAX_SCORE) * maxRadius * scale;
             return polarToCartesian(centerX, centerY, Math.max(r, 2), angle);
        });

        // Start at last point to close loop smoothly
        const startP = scaledPoints[0];
        path.moveTo(startP.x, startP.y);

        for (let i = 0; i < len; i++) {
            const current = scaledPoints[i];
            const next = scaledPoints[(i + 1) % len];
            
            // Calculate controls
            const { cp1, cp2 } = calculateControlPoints(
                current, 
                next, 
                {x: centerX, y: centerY}, 
                0.35 // Tension factor
            );
            path.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, next.x, next.y);
        }
        path.closePath();
        return path;
    };

    // 3. Render Modes
    
    if (mode === SnowflakeMode.TOC && highlightKey) {
        // --- TOC MODE ---
        
        // Draw base with low opacity
        ctx.save();
        ctx.globalAlpha = 0.2;
        const BasePath = createSnowflakePath(1);
        ctx.fillStyle = mainColor;
        ctx.fill(BasePath);
        ctx.restore();

        // Draw Highlighted Section
        // This is tricky with a continuous blob.
        // To "Pop" one section, we can clip a larger version of the blob 
        // to the pie slice of the active key.
        
        const highlightIndex = ORDERED_KEYS.indexOf(highlightKey);
        if (highlightIndex !== -1) {
            ctx.save();
            
            // Create Clip Path (Pie Slice)
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            // The slice spans from angle - slice/2 to angle + slice/2?
            // No, axis is center of data point. 
            // So the "Region" for FUTURE (index 1) is between axis 0 and axis 2?
            // Actually, standard snowflake usually implies the area around the axis.
            // Let's clip from (index - 0.5) * sliceAngle to (index + 0.5) * sliceAngle
            
            const hAngle = startAngle + highlightIndex * sliceAngle;
            const wedgeStart = hAngle - sliceAngle / 2;
            const wedgeEnd = hAngle + sliceAngle / 2;
            
            // Arc for clipping
            ctx.arc(centerX, centerY, maxRadius * 1.5, wedgeStart, wedgeEnd);
            ctx.lineTo(centerX, centerY);
            ctx.clip();

            // Draw Scaled Blob
            const popPath = createSnowflakePath(1.05);
            
            // Shadow
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = 20;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;

            ctx.fillStyle = mainColor;
            ctx.fill(popPath);
            
            // Border for highlight
            ctx.lineWidth = 3;
            ctx.strokeStyle = 'rgba(255,255,255,0.8)';
            ctx.stroke(popPath);

            ctx.restore();
        }

    } else {
        // --- COMPANY MODE ---
        const path = createSnowflakePath(1);
        
        // Fill
        ctx.fillStyle = mainColor;
        ctx.globalAlpha = 0.8;
        ctx.fill(path);
        ctx.globalAlpha = 1.0;

        // Stroke
        ctx.lineWidth = 2;
        ctx.strokeStyle = mainColor;
        ctx.stroke(path);
        
        // Highlight Hovered Slice
        if (hoveredIndex !== null && hoveredIndex >= 0) {
            ctx.save();
            
            const hAngle = startAngle + hoveredIndex * sliceAngle;
            const wedgeStart = hAngle - sliceAngle / 2;
            const wedgeEnd = hAngle + sliceAngle / 2;

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, maxRadius * 1.2, wedgeStart, wedgeEnd);
            ctx.closePath();
            ctx.clip(); // Clip drawing to this wedge

            // Draw a lighter overlay on the existing path
            ctx.fillStyle = 'rgba(255,255,255,0.2)';
            ctx.fill(path);
            
            ctx.restore();
        }
    }
    
    // 4. Draw Points (Small circles at vertices)
    points.forEach((p, i) => {
         ctx.beginPath();
         ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
         ctx.fillStyle = '#fff';
         ctx.fill();
         // If TOC active and not this index, fade it
         if (mode === SnowflakeMode.TOC && highlightKey && ORDERED_KEYS[i] !== highlightKey) {
             ctx.fillStyle = 'rgba(255,255,255,0.2)';
             ctx.fill();
         }
    });
  };

  // Interaction Handlers
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle retina display
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    draw(ctx);
  }, [data, mode, highlightKey, hoveredIndex, width, height, mainColor]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (mode === SnowflakeMode.TOC) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Distance check (don't hover if too far outside)
    const dx = x - centerX;
    const dy = y - centerY;
    const dist = Math.sqrt(dx*dx + dy*dy);
    
    if (dist > maxRadius + 20) {
        setHoveredIndex(null);
        return;
    }

    // Angle calculation matching math utils
    // Axis 0 is -90 deg (top).
    // getAngleIndex handles offset
    let angle = Math.atan2(dy, dx); // -PI to PI
    // Rotate so that index 0 is centered at 0 rads for easier calc? No, stick to geometry.
    // Angle of Slice 0 is -PI/2.
    // We want the boundary to be +/- PI/5 (36 deg) around -PI/2.
    
    // Normalize angle to 0 - 2PI starting from -PI/2 - (slice/2)
    const offset = startAngle - (sliceAngle / 2); 
    let normalizedAngle = angle - offset;
    while (normalizedAngle < 0) normalizedAngle += Math.PI * 2;
    
    const index = Math.floor(normalizedAngle / sliceAngle) % 5;
    setHoveredIndex(index);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  const handleClick = () => {
     if (mode === SnowflakeMode.COMPANY && hoveredIndex !== null && onClickSlice) {
         onClickSlice(ORDERED_KEYS[hoveredIndex]);
     }
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      className={`cursor-pointer transition-all duration-300 ${mode === SnowflakeMode.TOC ? 'cursor-default' : ''}`}
    />
  );
};

export default SnowflakeCanvas;
