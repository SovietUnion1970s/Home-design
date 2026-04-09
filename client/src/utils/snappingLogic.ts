import type { Wall } from '../store/designStore';

const SNAP_DISTANCE = 0.4; // Hút trong khoảng 40cm

function distanceToSegment(p: {x: number, y: number}, v: {x: number, y: number}, w: {x: number, y: number}) {
  const l2 = (w.x - v.x) ** 2 + (w.y - v.y) ** 2;
  if (l2 === 0) return { dist: Math.sqrt((p.x - v.x) ** 2 + (p.y - v.y) ** 2), projX: v.x, projY: v.y, t: 0 };
  
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  
  const projX = v.x + t * (w.x - v.x);
  const projY = v.y + t * (w.y - v.y);
  
  const dist = Math.sqrt((p.x - projX) ** 2 + (p.y - projY) ** 2);
  
  return { dist, projX, projY, t };
}

export function computeSnapping(position: [number, number, number], walls: Wall[]) {
  const px = position[0];
  const pz = position[2];
  
  let closestWall: Wall | null = null;
  let minDistance = Infinity;
  let BestProjX = px;
  let BestProjZ = pz;
  
  for (const wall of walls) {
    const { dist, projX, projY } = distanceToSegment(
      { x: px, y: pz },
      { x: wall.start.x, y: wall.start.y },
      { x: wall.end.x, y: wall.end.y }
    );
    
    if (dist < minDistance && dist < SNAP_DISTANCE) {
      minDistance = dist;
      closestWall = wall;
      BestProjX = projX;
      BestProjZ = projY; // Note: 2D Y is 3D Z
    }
  }

  if (closestWall) {
    const dx = closestWall.end.x - closestWall.start.x;
    const dz = closestWall.end.y - closestWall.start.y;
    const wallAngle = -Math.atan2(dz, dx);
    const snapNormalAngle = wallAngle + Math.PI / 2;
    
    return {
      snapped: true,
      position: [BestProjX, position[1], BestProjZ] as [number, number, number],
      rotation: [0, snapNormalAngle, 0] as [number, number, number],
      wallId: closestWall.id
    };
  }

  return { snapped: false };
}
