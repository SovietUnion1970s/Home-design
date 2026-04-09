import React, { useState, useRef, useCallback } from 'react';
import { useDesignStore } from '../store/designStore';
import type { Point2D, Wall } from '../store/designStore';

const PPM = 100; // pixels per meter
const SNAP  = 0.5; // snap grid in meters
const SNAP_PX = SNAP * PPM;

function snapToGrid(v: number): number {
  return Math.round(v / SNAP_PX) * SNAP_PX;
}

function dist(a: Point2D, b: Point2D): number {
  return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
}

function midpoint(a: Point2D, b: Point2D): Point2D {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

// Detect if points form a closed polygon — fills rooms
function getClosedRooms(walls: Wall[]): Point2D[][] {
  // Simple: collect all endpoints, check equality
  // For a proper room finder we'd need graph traversal
  // Here we return the bounding box color fill as a visual hint
  return [];
}

type ActiveTool = 'select' | 'wall' | 'door' | 'window';

interface Props {
  activeTool?: ActiveTool;
}

export const WallEditor2D: React.FC<Props> = ({ activeTool = 'wall' }) => {
  const { walls, furniture, addWall, selectWall, selectFurniture, selectedWallId, selectedFurnitureId, updateFurniturePosition } = useDesignStore();
  const [drawStart, setDrawStart] = useState<Point2D | null>(null);
  const [dragItem, setDragItem]   = useState<string | null>(null);
  const [mousePos,  setMousePos]  = useState<Point2D | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef<{ mx: number; my: number; px: number; py: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const getPos = useCallback((e: React.PointerEvent): Point2D => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    return {
      x: snapToGrid(e.clientX - rect.left - pan.x),
      y: snapToGrid(e.clientY - rect.top  - pan.y),
    };
  }, [pan]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      // Middle mouse / Alt+drag → pan
      setIsPanning(true);
      panStart.current = { mx: e.clientX, my: e.clientY, px: pan.x, py: pan.y };
      return;
    }
    if (e.button !== 0) return;

    if (activeTool === 'select') {
      // Deselect
      selectWall(null);
      selectFurniture(null);
      return;
    }

    if (activeTool === 'wall' || activeTool === 'door' || activeTool === 'window') {
      const pos = getPos(e);
      if (!drawStart) {
        setDrawStart(pos);
        setMousePos(pos);
        (e.target as Element).setPointerCapture(e.pointerId);
      } else {
        // Finish wall
        const pxm1 = { x: drawStart.x / PPM, y: drawStart.y / PPM };
        const pxm2 = { x: pos.x / PPM, y: pos.y / PPM };
        if (dist(pxm1, pxm2) > 0.1) {
          const thickness = activeTool === 'wall' ? 0.2 :
                            activeTool === 'door' ? 0.08 : 0.05;
          addWall({
            id: Math.random().toString(36).slice(2),
            start: pxm1,
            end:   pxm2,
            thickness,
            height: activeTool === 'window' ? 1.2 : 2.7,
            color: activeTool === 'door'   ? '#d97706' :
                   activeTool === 'window' ? '#0ea5e9' : undefined,
          });
        }
        setDrawStart(null);
        setMousePos(null);
        (e.target as Element).releasePointerCapture(e.pointerId);
      }
    }
  }, [activeTool, drawStart, getPos, addWall, pan, selectWall, selectFurniture]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (isPanning && panStart.current) {
      setPan({
        x: panStart.current.px + (e.clientX - panStart.current.mx),
        y: panStart.current.py + (e.clientY - panStart.current.my),
      });
      return;
    }
    if (dragItem) {
      const pos = getPos(e);
      const f = furniture.find(x => x.id === dragItem);
      if (f) updateFurniturePosition(f.id, [pos.x / PPM, f.position[1], pos.y / PPM]);
      return;
    }
    if (drawStart) setMousePos(getPos(e));
  }, [isPanning, drawStart, getPos, dragItem, furniture, updateFurniturePosition]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (isPanning) { setIsPanning(false); panStart.current = null; }
    if (dragItem) {
      setDragItem(null);
      (e.target as Element).releasePointerCapture(e.pointerId);
    }
  }, [isPanning, dragItem]);

  // Cursor style
  const cursor = activeTool === 'select' ? 'default' :
                 activeTool === 'wall'   ? 'crosshair' :
                 activeTool === 'door'   ? 'cell' : 'copy';

  const previewColor = activeTool === 'door' ? '#d97706' :
                       activeTool === 'window' ? '#0ea5e9' : 'rgba(79,70,229,0.7)';

  const strokeW = activeTool === 'door' ? 0.08 * PPM :
                  activeTool === 'window' ? 0.05 * PPM : 0.2 * PPM;

  return (
    <div style={{ width: '100%', height: '100%', background: '#f7f8fa', position: 'relative', overflow: 'hidden', cursor }}>
      
      {/* Tool hint */}
      <div style={{
        position: 'absolute', top: 8, left: 8, zIndex: 10,
        background: 'rgba(255,255,255,0.92)', border: '1px solid var(--border)',
        borderRadius: 'var(--r-sm)', padding: '4px 10px', fontSize: 11, fontWeight: 600, color: 'var(--text-3)',
        backdropFilter: 'blur(8px)', boxShadow: 'var(--shadow-xs)'
      }}>
        {activeTool === 'wall'   ? '🧱 Click điểm đầu → Click điểm cuối để vẽ tường' :
         activeTool === 'door'   ? '🚪 Click điểm đầu → Click điểm cuối để đặt cửa' :
         activeTool === 'window' ? '🪟 Click điểm đầu → Click điểm cuối để đặt cửa sổ' :
         '↖ Nhấp vào tường để chọn'}
      </div>

      {/* Snapped grid info */}
      {mousePos && drawStart && (
        <div style={{
          position: 'absolute', bottom: 12, right: 12, zIndex: 10, fontFamily: 'monospace',
          background: 'rgba(255,255,255,0.92)', border: '1px solid var(--border)',
          borderRadius: 'var(--r-sm)', padding: '4px 10px', fontSize: 11, color: 'var(--text-2)',
          backdropFilter: 'blur(8px)', boxShadow: 'var(--shadow-xs)', display: 'flex', gap: 12
        }}>
          <span>L: {(dist(
            { x: drawStart.x / PPM, y: drawStart.y / PPM },
            { x: mousePos.x / PPM,  y: mousePos.y / PPM }
          )).toFixed(2)} m</span>
          <span>X: {(mousePos.x / PPM).toFixed(1)}</span>
          <span>Y: {(mousePos.y / PPM).toFixed(1)}</span>
        </div>
      )}

      <svg
        ref={svgRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', touchAction: 'none' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <defs>
          <pattern id="grid-minor" width={SNAP_PX} height={SNAP_PX} patternUnits="userSpaceOnUse"
            x={pan.x % SNAP_PX} y={pan.y % SNAP_PX}>
            <path d={`M ${SNAP_PX} 0 L 0 0 0 ${SNAP_PX}`} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="0.5"/>
          </pattern>
          <pattern id="grid-major" width={PPM} height={PPM} patternUnits="userSpaceOnUse"
            x={pan.x % PPM} y={pan.y % PPM}>
            <path d={`M ${PPM} 0 L 0 0 0 ${PPM}`} fill="none" stroke="rgba(0,0,0,0.12)" strokeWidth="1"/>
          </pattern>
          <marker id="arrow" markerWidth="8" markerHeight="8" refX="4" refY="2" orient="auto">
            <path d="M 0 0 L 4 2 L 0 4 z" fill="#64748b"/>
          </marker>
        </defs>

        {/* Grid */}
        <rect width="100%" height="100%" fill="url(#grid-minor)"/>
        <rect width="100%" height="100%" fill="url(#grid-major)"/>

        {/* Origin cross */}
        <g transform={`translate(${pan.x},${pan.y})`}>
          <line x1="-8" y1="0" x2="8" y2="0" stroke="rgba(0,0,0,0.2)" strokeWidth="1"/>
          <line x1="0" y1="-8" x2="0" y2="8" stroke="rgba(0,0,0,0.2)" strokeWidth="1"/>
        </g>

        {/* Drawn walls */}
        <g transform={`translate(${pan.x},${pan.y})`}>
          {walls.map(wall => {
            const x1 = wall.start.x * PPM;
            const y1 = wall.start.y * PPM;
            const x2 = wall.end.x * PPM;
            const y2 = wall.end.y * PPM;
            const isSelected = selectedWallId === wall.id;
            const sw = wall.thickness * PPM;
            const mid = midpoint({ x: x1, y: y1 }, { x: x2, y: y2 });
            const len = dist({ x: x1, y: y1 }, { x: x2, y: y2 });
            const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
            const wallColor = wall.color || '#334155';
            const strokeColor = isSelected ? '#4f46e5' : wallColor;

            return (
              <g key={wall.id} onClick={(e) => { e.stopPropagation(); selectWall(wall.id); }} style={{ cursor: 'pointer' }}>
                {/* Wall body */}
                <line
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={isSelected ? '#4f46e5' : wallColor}
                  strokeWidth={sw}
                  strokeLinecap="round"
                  opacity={isSelected ? 1 : 0.85}
                />
                {/* Selection outline */}
                {isSelected && (
                  <line x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke="#818cf8" strokeWidth={sw + 4} strokeLinecap="round" opacity={0.2}/>
                )}
                {/* Endpoints */}
                <circle cx={x1} cy={y1} r={4} fill={wallColor} stroke="white" strokeWidth={1.5}/>
                <circle cx={x2} cy={y2} r={4} fill={wallColor} stroke="white" strokeWidth={1.5}/>
                {/* Dimension label */}
                <g transform={`translate(${mid.x},${mid.y}) rotate(${angle > 90 || angle < -90 ? angle + 180 : angle})`}>
                  <rect x={-24} y={-18} width={48} height={15} rx={3} fill="white" fillOpacity={0.9} stroke={strokeColor} strokeWidth={0.5}/>
                  <text textAnchor="middle" y={-7} fontSize={9.5} fontWeight="600" fill={strokeColor} fontFamily="Inter,sans-serif">
                    {(len / PPM).toFixed(2)} m
                  </text>
                </g>
              </g>
            );
          })}

          {/* Furniture footprints */}
          {furniture.map(f => (
            <g key={f.id} style={{ cursor: 'move' }} 
               onPointerDown={(e) => {
                 e.stopPropagation();
                 selectFurniture(f.id);
                 if (activeTool === 'select') {
                   setDragItem(f.id);
                   (e.target as Element).setPointerCapture(e.pointerId);
                 }
               }}>
              <rect
                x={f.position[0] * PPM - 25} y={f.position[2] * PPM - 20}
                width={50} height={40} rx={4}
                fill={selectedFurnitureId === f.id ? '#4f46e5' : f.color}
                fillOpacity={selectedFurnitureId === f.id ? 0.35 : 0.2}
                stroke={selectedFurnitureId === f.id ? '#4f46e5' : f.color}
                strokeWidth={1.5}
              />
              <text
                x={f.position[0] * PPM} y={f.position[2] * PPM + 4}
                textAnchor="middle" fontSize={8} fontWeight="600"
                fill={selectedFurnitureId === f.id ? '#4f46e5' : '#334155'}
                fontFamily="Inter,sans-serif"
              >
                {f.label.slice(0, 8)}
              </text>
            </g>
          ))}

          {/* Preview wall while drawing */}
          {drawStart && mousePos && (
            <>
              <line
                x1={drawStart.x} y1={drawStart.y}
                x2={mousePos.x}  y2={mousePos.y}
                stroke={previewColor} strokeWidth={strokeW}
                strokeDasharray={activeTool === 'wall' ? 'none' : '8,5'}
                strokeLinecap="round" opacity={0.75}
              />
              {/* Live dimension */}
              {(() => {
                const mid2 = midpoint(drawStart, mousePos);
                const len2 = dist(
                  { x: drawStart.x / PPM, y: drawStart.y / PPM },
                  { x: mousePos.x / PPM,  y: mousePos.y / PPM }
                );
                const a2 = Math.atan2(mousePos.y - drawStart.y, mousePos.x - drawStart.x) * 180 / Math.PI;
                return (
                  <g transform={`translate(${mid2.x},${mid2.y}) rotate(${a2 > 90 || a2 < -90 ? a2 + 180 : a2})`}>
                    <rect x={-26} y={-21} width={52} height={16} rx={3} fill="white" stroke={previewColor} strokeWidth={1}/>
                    <text textAnchor="middle" y={-9} fontSize={10} fontWeight="700" fill={previewColor} fontFamily="Inter,sans-serif">
                      {len2.toFixed(2)} m
                    </text>
                  </g>
                );
              })()}
              <circle cx={drawStart.x} cy={drawStart.y} r={5} fill={previewColor} stroke="white" strokeWidth={1.5}/>
              <circle cx={mousePos.x}  cy={mousePos.y}  r={5} fill={previewColor} stroke="white" strokeWidth={1.5} opacity={0.7}/>
            </>
          )}
        </g>
      </svg>
    </div>
  );
};
