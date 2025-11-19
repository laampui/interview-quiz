import { Point, COLOR_RED, COLOR_GREEN, MAX_SCORE } from '../types';

// Convert polar coordinates to cartesian
export const polarToCartesian = (
  centerX: number,
  centerY: number,
  radius: number,
  angleInRadians: number
): Point => {
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
};

// Linear interpolation
export const lerp = (start: number, end: number, t: number) => {
  return start * (1 - t) + end * t;
};

// HSL Color Interpolation between Red and Green based on score ratio
export const getSnowflakeColor = (totalScore: number, maxPossibleScore: number): string => {
  // Normalized 0 to 1
  const t = Math.min(Math.max(totalScore / maxPossibleScore, 0), 1);
  
  // Red is approx HSL(0, 100%, 58%)
  // Green is approx HSL(125, 100%, 45%)
  
  // Simple linear interpolation on Hue for smooth transition
  // Start Hue: 0 (Red) -> End Hue: 130 (Green)
  const hue = lerp(0, 130, t);
  const saturation = 100;
  // Lightness slightly adjusts
  const lightness = lerp(58, 45, t); 

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

// Calculate bezier control points for smooth "organic" curves
// Returns control points for the curve segment between current point and next point
export const calculateControlPoints = (
  p1: Point, // Current point
  p2: Point, // Next point
  center: Point,
  tension: number = 0.5
) => {
  // Ideally, for a snowflake chart that looks round, the tangent at a vertex 
  // is perpendicular to the radius at that vertex.
  
  // Vector from center to p1
  const r1 = Math.sqrt(Math.pow(p1.x - center.x, 2) + Math.pow(p1.y - center.y, 2));
  const angle1 = Math.atan2(p1.y - center.y, p1.x - center.x);
  
  // Vector from center to p2
  const r2 = Math.sqrt(Math.pow(p2.x - center.x, 2) + Math.pow(p2.y - center.y, 2));
  const angle2 = Math.atan2(p2.y - center.y, p2.x - center.x);

  // Tangent angle is radius angle + 90 degrees (PI/2)
  const tanAngle1 = angle1 + Math.PI / 2;
  const tanAngle2 = angle2 - Math.PI / 2; // Approaching from the other side

  // Distance between points (chord length) used to scale the control handle
  const dist = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  const controlDist = dist * tension;

  const cp1 = {
    x: p1.x + Math.cos(tanAngle1) * controlDist,
    y: p1.y + Math.sin(tanAngle1) * controlDist
  };

  const cp2 = {
    x: p2.x + Math.cos(tanAngle2) * controlDist,
    y: p2.y + Math.sin(tanAngle2) * controlDist
  };

  return { cp1, cp2 };
};

// Helper to detect which slice is hovered
export const getAngleIndex = (
  x: number,
  y: number,
  centerX: number,
  centerY: number,
  totalSlices: number,
  offsetRadians: number
): number => {
  let angle = Math.atan2(y - centerY, x - centerX) - offsetRadians;
  
  // Normalize to 0 - 2PI
  while (angle < 0) angle += Math.PI * 2;
  while (angle >= Math.PI * 2) angle -= Math.PI * 2;

  const sliceAngle = (Math.PI * 2) / totalSlices;
  // Add half slice to center the detection around the axis or edge?
  // Usually Snowflake slices are centered ON the axis.
  // Let's assume index 0 is centered at -PI/2 (top).
  // The region for index 0 spans from -PI/2 - slice/2 to -PI/2 + slice/2.
  
  // Let's shift angle logic so that index 0's axis is in the middle of the detection zone.
  // Current geometry: Axis 0 is at -90deg.
  // We want index 0 to be returned when mouse is roughly -90deg.
  // Zone 0: [-126deg, -54deg]
  
  const adjustedAngle = (angle + sliceAngle / 2) % (Math.PI * 2);
  return Math.floor(adjustedAngle / sliceAngle);
};
