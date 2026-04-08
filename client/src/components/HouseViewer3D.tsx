import React, { useRef, useMemo, Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import {
  Box, Environment, ContactShadows,
  MeshReflectorMaterial, Html, useGLTF, TransformControls, OrbitControls,
  useProgress
} from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';import { useDesignStore } from '../store/designStore';
import type { Wall, FurnitureItem } from '../store/designStore';
import { computeSnapping } from '../utils/snappingLogic';
import * as THREE from 'three';

// ─── Loading Overlay ──────────────────────────────────────────
const LoaderOverlay: React.FC = () => {
  const { active, progress, item, loaded, total } = useProgress();
  const [visible, setVisible] = useState(active);

  useEffect(() => {
    if (active) setVisible(true);
    else {
      const timer = setTimeout(() => setVisible(false), 800);
      return () => clearTimeout(timer);
    }
  }, [active]);

  if (!visible) return null;

  return (
    <div className="loader-overlay" style={{ 
      position: 'absolute', inset: 0, zIndex: 1000,
      background: '#06060f', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      transition: 'opacity 0.5s ease'
    }}>
      <div className="db-logo-mark" style={{ marginBottom: 20, width: 64, height: 64, fontSize: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-surface-2)', borderRadius: 16 }}>🏠</div>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 4 }}>Kiến trúc sư AI đang chuẩn bị...</h3>
      <p style={{ fontSize: 13, color: 'var(--text-4)', marginBottom: 24 }}>{progress.toFixed(0)}% kiến tạo</p>
      
      <div className="loader-bar-wrap" style={{ width: 240, height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
        <div className="loader-bar" style={{ height: '100%', background: 'linear-gradient(90deg, var(--purple), var(--teal))', width: `${progress}%`, transition: 'width 0.3s' }} />
      </div>

      <div style={{ marginTop: 24, fontSize: 10, color: 'var(--text-4)', display: 'flex', gap: 16, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
         <span>{loaded} / {total} Tài nguyên</span>
         <span>|</span>
         <span style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
           {item || 'Pre-warming Shaders'}
         </span>
      </div>
    </div>
  );
};

// ─── Constants ───
const TEXTURE_PRESETS = {
  wood: { label: 'Gỗ Sồi', color: '#c8a97e', roughness: 0.75, metalness: 0 },
  tile: { label: 'Gạch men', color: '#e8e8e0', roughness: 0.35, metalness: 0.05 },
  concrete: { label: 'Bê tông', color: '#8a8a8a', roughness: 0.95, metalness: 0 },
  marble: { label: 'Đá Marble', color: '#f0ece4', roughness: 0.15, metalness: 0.1 },
};

// ─── Procedural Furniture ───
const SofaMesh: React.FC<{ color: string }> = ({ color }) => (
  <group>
    <mesh position={[0, 0.22, 0]} castShadow>
      <boxGeometry args={[2, 0.22, 0.85]} />
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
    <mesh position={[0, 0.58, -0.36]} castShadow>
      <boxGeometry args={[2, 0.52, 0.18]} />
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
    <mesh position={[-0.92, 0.38, 0]} castShadow>
      <boxGeometry args={[0.18, 0.38, 0.85]} />
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
    <mesh position={[0.92, 0.38, 0]} castShadow>
      <boxGeometry args={[0.18, 0.38, 0.85]} />
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
    {[[-0.8, -0.35], [-0.8, 0.35], [0.8, -0.35], [0.8, 0.35]].map(([x, z], i) => (
      <mesh key={i} position={[x, 0.05, z]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.12]} />
        <meshStandardMaterial color="#3d2b1f" roughness={0.5} />
      </mesh>
    ))}
  </group>
);

const BedMesh: React.FC<{ color: string }> = ({ color }) => (
  <group>
    <mesh position={[0, 0.18, 0]} castShadow>
      <boxGeometry args={[1.65, 0.22, 2.05]} />
      <meshStandardMaterial color="#4a3728" roughness={0.7} />
    </mesh>
    <mesh position={[0, 0.35, 0.05]} castShadow>
      <boxGeometry args={[1.55, 0.18, 1.85]} />
      <meshStandardMaterial color="#f0ece8" roughness={0.9} />
    </mesh>
    <mesh position={[0, 0.65, -0.95]} castShadow>
      <boxGeometry args={[1.65, 0.7, 0.12]} />
      <meshStandardMaterial color="#4a3728" roughness={0.6} />
    </mesh>
  </group>
);

const FURNITURE_MESHES: Record<string, React.FC<{ color: string }>> = {
  sofa: SofaMesh,
  bed: BedMesh,
};

function GenericBox({ color, type }: { color: string; type: string }) {
  const dims: Record<string, [number, number, number]> = {
    wardrobe: [1.2, 2.1, 0.6],
    'coffee-table': [1.2, 0.45, 0.7],
    shower: [0.9, 2.2, 0.9],
    toilet: [0.45, 0.8, 0.65],
    desk: [1.2, 0.75, 0.6],
    door: [0.8, 2.1, 0.08],
    window: [1.2, 1.4, 0.06],
  };
  const d = dims[type] || [1, 1, 1];
  return (
    <mesh castShadow position={[0, d[1] / 2, 0]}>
      <boxGeometry args={d} />
      <meshStandardMaterial color={color} roughness={0.6} metalness={0.1} />
    </mesh>
  );
}

// ─── Floor ───
const ReflectiveFloor: React.FC = () => {
  const { sceneMaterial } = useDesignStore();
  const preset = TEXTURE_PRESETS[sceneMaterial.floor as keyof typeof TEXTURE_PRESETS] || TEXTURE_PRESETS.wood;

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[3, -0.01, 3]} receiveShadow>
      <planeGeometry args={[30, 30]} />
      <MeshReflectorMaterial
        blur={[300, 50]}
        resolution={512}
        mixBlur={0.8}
        mixStrength={0.6}
        roughness={preset.roughness}
        depthScale={1.2}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color={preset.color}
        metalness={preset.metalness}
        mirror={0.4}
        polygonOffset={true}
        polygonOffsetFactor={1}
      />
    </mesh>
  );
};

// ─── Wall 3D ───
const Wall3D: React.FC<{ wall: Wall; selected: boolean; onSelect: () => void }> = ({ wall, selected, onSelect }) => {
  const { position, dimensions, rotationY } = useMemo(() => {
    const { start, end, thickness, height } = wall;
    const dx = end.x - start.x;
    const dz = end.y - start.y;
    const length = Math.sqrt(dx * dx + dz * dz);
    return {
      position: [(start.x + end.x) / 2, height / 2, (start.y + end.y) / 2] as [number, number, number],
      dimensions: [length, height, thickness] as [number, number, number],
      rotationY: -Math.atan2(dz, dx),
    };
  }, [wall]);

  const { sceneMaterial } = useDesignStore();
  const wallColor = wall.color || sceneMaterial.wallPaint || '#c7d2fe';

  return (
    <Box
      position={position}
      args={dimensions}
      rotation-y={rotationY}
      castShadow
      receiveShadow
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
    >
      <meshStandardMaterial
        color={wallColor}
        roughness={0.75}
        metalness={0.0}
        emissive={selected ? new THREE.Color(wallColor) : new THREE.Color('#000')}
        emissiveIntensity={selected ? 0.2 : 0}
      />
    </Box>
  );
};

// ─── Furniture 3D ───
const GLBModel: React.FC<{ url: string }> = ({ url }) => {
  const { scene } = useGLTF(url);
  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    clone.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    return clone;
  }, [scene]);
  return <primitive object={clonedScene} />;
};

const Furniture3D: React.FC<{
  item: FurnitureItem;
  selected: boolean;
  onSelect: () => void;
  setOrbitEnabled: (v: boolean) => void;
}> = ({ item, selected, onSelect, setOrbitEnabled }) => {
  const MeshComponent = FURNITURE_MESHES[item.type];
  const { updateFurniturePosition, updateFurnitureRotation, walls } = useDesignStore();
  const groupRef = useRef<THREE.Group>(null);

  const content = (
    <group
      ref={groupRef}
      position={item.position}
      rotation={item.rotation}
      scale={item.scale}
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
    >
      {item.assetUrl ? (
        <Suspense fallback={null}>
          <GLBModel url={item.assetUrl} />
        </Suspense>
      ) : MeshComponent ? (
        <MeshComponent color={item.color} />
      ) : (
        <GenericBox color={item.color} type={item.type} />
      )}
      {selected && (
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.6, 0.72, 32]} />
          <meshBasicMaterial color={'#a855f7'} transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  );

  if (selected) {
    return (
      <TransformControls
        mode="translate"
        object={groupRef.current || undefined}
        onMouseUp={() => {
          setOrbitEnabled(true);
          if (groupRef.current) {
            const p = groupRef.current.position;
            const snap = computeSnapping([p.x, p.y, p.z], walls);
            if (snap.snapped) {
              updateFurniturePosition(item.id, snap.position as [number, number, number]);
              updateFurnitureRotation(item.id, snap.rotation as [number, number, number]);
            } else {
              updateFurniturePosition(item.id, [p.x, p.y, p.z]);
            }
          }
        }}
        onMouseDown={() => setOrbitEnabled(false)}
      >
        {content}
      </TransformControls>
    );
  }
  return content;
};

// ─── Scene ───
const Scene: React.FC = () => {
  const { walls, furniture, selectedWallId, selectedFurnitureId, selectWall, selectFurniture } = useDesignStore();
  const [orbitEnabled, setOrbitEnabled] = useState(true);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[10, 20, 10]} intensity={1.5} castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
      />
      <Environment preset="apartment" />
      <ContactShadows position={[0, -0.01, 0]} opacity={0.6} scale={30} blur={2} />

      <Suspense fallback={null}>
        <ReflectiveFloor />
      </Suspense>

      {walls.map(wall => (
        <Wall3D
          key={wall.id}
          wall={wall}
          selected={selectedWallId === wall.id}
          onSelect={() => selectWall(selectedWallId === wall.id ? null : wall.id)}
        />
      ))}

      {furniture.map(item => (
        <Furniture3D
          key={item.id}
          item={item}
          selected={selectedFurnitureId === item.id}
          onSelect={() => selectFurniture(selectedFurnitureId === item.id ? null : item.id)}
          setOrbitEnabled={setOrbitEnabled}
        />
      ))}

      <OrbitControls
        makeDefault
        enabled={orbitEnabled}
        enableDamping
        dampingFactor={0.08}
        minDistance={3}
        maxDistance={50}
        maxPolarAngle={Math.PI / 2.1}
      />

      <EffectComposer multisampling={8}>
        <Bloom luminanceThreshold={1} intensity={0.5} />
      </EffectComposer>
    </>
  );
};

export const HouseViewer3D: React.FC = () => {
  const { walls, furniture, selectWall, selectFurniture } = useDesignStore();

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: '#050510' }}>
      <Canvas
        shadows
        camera={{ position: [10, 10, 10], fov: 45 }}
        onPointerMissed={() => { selectWall(null); selectFurniture(null); }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
      >
        <color attach="background" args={['#06060f']} />
        <fog attach="fog" args={['#06060f', 15, 60]} />
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>

      <LoaderOverlay />

      {/* HUD Panel */}
      <div style={{
        position: 'absolute', bottom: 20, left: 20,
        display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none', zIndex: 10
      }}>
        <div style={{
          padding: '6px 14px', borderRadius: 10,
          background: 'rgba(4,4,13,0.85)', backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.08)',
          fontSize: 12, fontWeight: 600, color: 'white'
        }}>
          {walls.length} Tường • {furniture.length} Vật dụng
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-4)', paddingLeft: 4 }}>
          Chuột trái: Xoay • Cuộn: Thu phóng • Chuột phải: Di chuyển
        </div>
      </div>
      
      <TextureSwitcher />
    </div>
  );
};

const TextureSwitcher: React.FC = () => {
  const { sceneMaterial, setSceneMaterial } = useDesignStore();
  const floors = Object.entries(TEXTURE_PRESETS);

  return (
    <div style={{
      position: 'absolute', top: 20, right: 20,
      background: 'rgba(4,4,13,0.9)', backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16,
      padding: '12px', width: 140, zIndex: 10
    }}>
      <div style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 10 }}>
        Nền nhà
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
        {floors.map(([key, preset]) => (
          <button key={key} onClick={() => setSceneMaterial({ floor: key as any })}
            style={{
              width: '100%', height: 36, borderRadius: 8,
              background: preset.color, border: `2px solid ${sceneMaterial.floor === key ? 'white' : 'transparent'}`,
              cursor: 'pointer', transition: 'all 0.2s', position: 'relative'
            }}
          >
            {sceneMaterial.floor === key && (
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black', fontSize: 14 }}>
                ✓
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
