import React, { useState, useRef } from 'react';
import { useDesignStore } from '../store/designStore';
import type { Point2D } from '../store/designStore';

const PIXELS_PER_METER = 100;

export const WallEditor2D: React.FC = () => {
  const { walls, addWall } = useDesignStore();
  const [drawingWallStart, setDrawingWallStart] = useState<Point2D | null>(null);
  const [currentMousePos, setCurrentMousePos] = useState<Point2D | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const getPosFromEvent = (e: React.MouseEvent | React.PointerEvent): Point2D => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    return { x, y };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return; // Only left click
    const pos = getPosFromEvent(e);
    
    // If not drawing, start drawing
    if (!drawingWallStart) {
      setDrawingWallStart(pos);
      setCurrentMousePos(pos);
      // capture pointer to track outside if needed
      (e.target as Element).setPointerCapture(e.pointerId);
    } else {
      // Finish Drawing
      const p1InMeters = { x: drawingWallStart.x / PIXELS_PER_METER, y: drawingWallStart.y / PIXELS_PER_METER };
      const p2InMeters = { x: pos.x / PIXELS_PER_METER, y: pos.y / PIXELS_PER_METER };
      
      // Prevent zero-length walls
      if (p1InMeters.x !== p2InMeters.x || p1InMeters.y !== p2InMeters.y) {
        addWall({
          id: Math.random().toString(36).substring(7),
          start: p1InMeters,
          end: p2InMeters,
          thickness: 0.2, // standard wall thickness in meters
          height: 2.7,    // standard ceiling height in meters
        });
      }
      
      setDrawingWallStart(null);
      setCurrentMousePos(null);
      (e.target as Element).releasePointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (drawingWallStart) {
      setCurrentMousePos(getPosFromEvent(e));
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', background: '#07071a', position: 'relative', overflow: 'hidden', cursor: 'crosshair' }}>
      {/* Grid Pattern */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        <defs>
          <pattern id="grid" width={PIXELS_PER_METER} height={PIXELS_PER_METER} patternUnits="userSpaceOnUse">
            <path d={`M ${PIXELS_PER_METER} 0 L 0 0 0 ${PIXELS_PER_METER}`} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
          </pattern>
          <pattern id="grid-major" width={PIXELS_PER_METER * 5} height={PIXELS_PER_METER * 5} patternUnits="userSpaceOnUse">
            <path d={`M ${PIXELS_PER_METER * 5} 0 L 0 0 0 ${PIXELS_PER_METER * 5}`} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        <rect width="100%" height="100%" fill="url(#grid-major)" />
      </svg>
      
      <svg 
        ref={svgRef}
        style={{ position: 'relative', width: '100%', height: '100%', touchAction: 'none' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
      >
        {/* Render already drawn walls */}
        {walls.map(wall => (
          <g key={wall.id}>
            <line
              x1={wall.start.x * PIXELS_PER_METER}
              y1={wall.start.y * PIXELS_PER_METER}
              x2={wall.end.x * PIXELS_PER_METER}
              y2={wall.end.y * PIXELS_PER_METER}
              stroke="#c7d2fe"
              strokeWidth={wall.thickness * PIXELS_PER_METER}
              strokeLinecap="round"
              filter="url(#glow)"
            />
          </g>
        ))}

        {/* Render wall currently being drawn */}
        {drawingWallStart && currentMousePos && (
          <line
            x1={drawingWallStart.x}
            y1={drawingWallStart.y}
            x2={currentMousePos.x}
            y2={currentMousePos.y}
            stroke="rgba(99,102,241,0.6)"
            strokeWidth={0.2 * PIXELS_PER_METER}
            strokeDasharray="8,6"
            strokeLinecap="round"
            opacity={0.8}
          />
        )}
        
        {/* Points indicator for active draw */}
        {drawingWallStart && (
          <circle cx={drawingWallStart.x} cy={drawingWallStart.y} r="6" fill="#6366f1" opacity={0.9} />
        )}
        {currentMousePos && drawingWallStart && (
           <circle cx={currentMousePos.x} cy={currentMousePos.y} r="6" fill="#8b5cf6" opacity={0.9} />
        )}
      </svg>
    </div>
  );
};
