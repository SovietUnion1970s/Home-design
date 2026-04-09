import React, { useRef, useMemo, Suspense, useState, useEffect, Component } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import {
  Box, Environment, ContactShadows, Grid,
  MeshReflectorMaterial, useGLTF, TransformControls, OrbitControls,
  useProgress, PointerLockControls, KeyboardControls, useKeyboardControls
} from '@react-three/drei';
import { EffectComposer, Bloom, Outline } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { useDesignStore } from '../store/designStore';
import type { Wall, FurnitureItem } from '../store/designStore';
import { computeSnapping } from '../utils/snappingLogic';
import * as THREE from 'three';
import { Move, RotateCcw, Copy, Trash2 } from 'lucide-react';

// ─── Loading Overlay ──────────────────────────────────────────
const LoaderOverlay: React.FC = () => {
  const { active, progress } = useProgress();
  const [visible, setVisible] = useState(active);
  useEffect(() => {
    if (active) setVisible(true);
    else { const t = setTimeout(() => setVisible(false), 600); return () => clearTimeout(t); }
  }, [active]);
  if (!visible) return null;
  return (
    <div className="loader-overlay" style={{ position: 'absolute', inset: 0, zIndex: 1000, background: 'rgba(247,248,250,0.9)', backdropFilter: 'blur(12px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-2)' }}>Đang tải mô hình 3D...</div>
      <div className="loader-bar-wrap" style={{ width: 200 }}>
        <div className="loader-bar" style={{ width: `${progress}%` }}/>
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-4)' }}>{progress.toFixed(0)}%</div>
    </div>
  );
};

// ─── Floor Textures ───────────────────────────────────────────
const FLOOR_PRESETS = {
  wood:     { color: '#c8a97e', roughness: 0.72, metalness: 0 },
  tile:     { color: '#e8e8e0', roughness: 0.3,  metalness: 0.05 },
  concrete: { color: '#9ca3af', roughness: 0.92, metalness: 0 },
  marble:   { color: '#f0ece4', roughness: 0.12, metalness: 0.08 },
};

// ─── Model Error Boundary ─────────────────────────────────────
class ModelErrorBoundary extends Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(err: any) { console.warn('Model load failed', err); }
  render() { return this.state.hasError ? this.props.fallback : this.props.children; }
}

// ─── GLB Loader ───────────────────────────────────────────────
const GLBModel: React.FC<{ url: string }> = ({ url }) => {
  const { scene } = useGLTF(url);
  const cloned = useMemo(() => {
    const c = scene.clone();
    c.traverse((ch: any) => {
      if (ch.isMesh) { ch.castShadow = true; ch.receiveShadow = true; }
    });
    return c;
  }, [scene]);
  return <primitive object={cloned}/>;
};

// ─── Generic Fallback Box ─────────────────────────────────────
function GenericBox({ color, type }: { color: string; type: string }) {
  const dims: Record<string, [number, number, number]> = {
    sofa: [2, 0.8, 0.9], chair: [0.6, 0.8, 0.6], bed: [1.6, 0.6, 2],
    wardrobe: [1.2, 2.1, 0.6], 'coffee-table': [1.2, 0.45, 0.7],
    desk: [1.2, 0.75, 0.6], plant: [0.4, 1.2, 0.4],
    door: [0.9, 2.2, 0.08], window: [1.2, 1.4, 0.06], default: [1, 1, 1],
  };
  const d = dims[type] || dims.default;
  return (
    <mesh castShadow position={[0, d[1]/2, 0]}>
      <boxGeometry args={d}/>
      <meshStandardMaterial color={color} roughness={0.6} metalness={0.05}/>
    </mesh>
  );
}

// ─── Floor ───────────────────────────────────────────────────
const SceneFloor: React.FC = () => {
  const { sceneMaterial } = useDesignStore();
  const preset = FLOOR_PRESETS[sceneMaterial.floor as keyof typeof FLOOR_PRESETS] || FLOOR_PRESETS.wood;
  return (
    <mesh rotation={[-Math.PI/2, 0, 0]} position={[5, -0.005, 5]} receiveShadow>
      <planeGeometry args={[40, 40]}/>
      <MeshReflectorMaterial
        blur={[256, 32]} resolution={512} mixBlur={0.7} mixStrength={0.5}
        roughness={preset.roughness} depthScale={1.1}
        minDepthThreshold={0.4} maxDepthThreshold={1.4}
        color={preset.color} metalness={preset.metalness}
        mirror={0.3} polygonOffset polygonOffsetFactor={1}
      />
    </mesh>
  );
};

// ─── Wall 3D ─────────────────────────────────────────────────
const Wall3D: React.FC<{ wall: Wall; selected: boolean; onSelect: () => void }> = ({ wall, selected, onSelect }) => {
  const { position, dimensions, rotationY } = useMemo(() => {
    const { start, end, thickness, height } = wall;
    const dx = end.x - start.x; const dz = end.y - start.y;
    const length = Math.sqrt(dx*dx + dz*dz);
    return {
      position: [(start.x + end.x)/2, height/2, (start.y + end.y)/2] as [number, number, number],
      dimensions: [length, height, thickness] as [number, number, number],
      rotationY: -Math.atan2(dz, dx),
    };
  }, [wall]);

  const { sceneMaterial } = useDesignStore();
  const wallColor = wall.color || sceneMaterial.wallPaint || '#e2e8f0';

  return (
    <Box position={position} args={dimensions} rotation-y={rotationY} castShadow receiveShadow
      onClick={(e) => { e.stopPropagation(); onSelect(); }}>
      <meshStandardMaterial
        color={wallColor} roughness={0.8} metalness={0}
        emissive={selected ? new THREE.Color(wallColor) : new THREE.Color(0,0,0)}
        emissiveIntensity={selected ? 0.15 : 0}
      />
    </Box>
  );
};

// ─── Furniture 3D with Outline support ───────────────────────
const Furniture3D: React.FC<{
  item: FurnitureItem;
  selected: boolean;
  onSelect: () => void;
  setOrbitEnabled: (v: boolean) => void;
  transformMode: 'translate' | 'rotate';
  meshRef: React.RefObject<THREE.Group | null>;
}> = ({ item, selected, onSelect, setOrbitEnabled, transformMode, meshRef }) => {
  const { updateFurniturePosition, updateFurnitureRotation, walls } = useDesignStore();

  const content = (
    <group ref={meshRef} position={item.position} rotation={item.rotation} scale={item.scale}
      onClick={(e) => { e.stopPropagation(); onSelect(); }}>
      {item.assetUrl ? (
        <ModelErrorBoundary fallback={<GenericBox color={item.color} type={item.type}/>}>
          <Suspense fallback={<GenericBox color="#aaa" type={item.type}/>}>
            <GLBModel url={item.assetUrl}/>
          </Suspense>
        </ModelErrorBoundary>
      ) : (
        <GenericBox color={item.color} type={item.type}/>
      )}
    </group>
  );

  if (selected && meshRef.current) {
    return (
      <TransformControls
        mode={transformMode}
        translationSnap={0.5}
        rotationSnap={Math.PI / 12}
        object={meshRef.current}
        onMouseDown={() => setOrbitEnabled(false)}
        onMouseUp={() => {
          setOrbitEnabled(true);
          if (meshRef.current) {
            const p = meshRef.current.position;
            const r = meshRef.current.rotation;
            if (transformMode === 'translate') {
              // Floor clamp
              const clamped: [number, number, number] = [p.x, Math.max(0, p.y), p.z];
              const snap = computeSnapping(clamped, walls);
              if (snap.snapped) {
                updateFurniturePosition(item.id, snap.position as [number, number, number]);
                updateFurnitureRotation(item.id, snap.rotation as [number, number, number]);
              } else {
                updateFurniturePosition(item.id, clamped);
              }
            } else {
              updateFurnitureRotation(item.id, [r.x, r.y, r.z]);
            }
          }
        }}
      >
        {content}
      </TransformControls>
    );
  }
  return content;
};

// ─── FPS Controls ─────────────────────────────────────────────
const FPSControls: React.FC = () => {
  const { camera } = useThree();
  const [, get] = useKeyboardControls();
  const dir = new THREE.Vector3();
  const fwd = new THREE.Vector3();
  const side = new THREE.Vector3();
  useFrame((_, delta) => {
    const { forward, backward, left, right } = get();
    fwd.set(0, 0, Number(backward) - Number(forward));
    side.set(Number(left) - Number(right), 0, 0);
    dir.subVectors(fwd, side).normalize().multiplyScalar(5 * delta);
    camera.translateX(dir.x);
    camera.translateZ(dir.z);
    camera.position.y = 1.7;
  });
  return <PointerLockControls/>;
};

// ─── Scene ───────────────────────────────────────────────────
const Scene: React.FC<{
  transformMode: 'translate' | 'rotate';
  viewMode: 'design' | 'walk';
  meshRefs: React.MutableRefObject<Map<string, React.RefObject<THREE.Group | null>>>;
}> = ({ transformMode, viewMode, meshRefs }) => {
  const { walls, furniture, selectedWallId, selectedFurnitureId, selectWall, selectFurniture } = useDesignStore();
  const [orbitEnabled, setOrbitEnabled] = useState(true);

  // Ensure each item has a stable ref
  furniture.forEach(item => {
    if (!meshRefs.current.has(item.id)) {
      meshRefs.current.set(item.id, React.createRef<THREE.Group>());
    }
  });

  // Collect selected mesh for Outline
  const selectedMeshes: THREE.Group[] = [];
  if (selectedFurnitureId) {
    const ref = meshRefs.current.get(selectedFurnitureId);
    if (ref?.current) selectedMeshes.push(ref.current);
  }

  return (
    <>
      <ambientLight intensity={0.55}/>
      <directionalLight position={[12, 20, 12]} intensity={1.6} castShadow
        shadow-mapSize={[2048, 2048]} shadow-bias={-0.0001}/>
      <directionalLight position={[-8, 10, -8]} intensity={0.4}/>
      <Environment preset="apartment"/>
      <ContactShadows position={[0, -0.01, 0]} opacity={0.45} scale={40} blur={2.5}/>

      <Suspense fallback={null}>
        <SceneFloor/>
      </Suspense>

      {/* Grid overlay */}
      <Grid
        position={[5, 0, 5]}
        args={[40, 40]}
        cellSize={0.5}
        cellThickness={0.5}
        cellColor="#94a3b8"
        sectionSize={2}
        sectionThickness={1}
        sectionColor="#64748b"
        fadeDistance={25}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid
      />

      {walls.map(wall => (
        <Wall3D key={wall.id} wall={wall} selected={selectedWallId === wall.id}
          onSelect={() => selectWall(selectedWallId === wall.id ? null : wall.id)}/>
      ))}

      {furniture.map(item => {
        const ref = meshRefs.current.get(item.id) || React.createRef<THREE.Group | null>();
        return (
          <Furniture3D
            key={item.id} item={item}
            selected={selectedFurnitureId === item.id}
            onSelect={() => selectFurniture(selectedFurnitureId === item.id ? null : item.id)}
            setOrbitEnabled={setOrbitEnabled}
            transformMode={transformMode}
            meshRef={ref as React.RefObject<THREE.Group | null>}
          />
        );
      })}

      {viewMode === 'design' ? (
        <OrbitControls makeDefault enabled={orbitEnabled} enableDamping
          dampingFactor={0.07} minDistance={2} maxDistance={60}
          maxPolarAngle={Math.PI / 2.05}/>
      ) : (
        <FPSControls/>
      )}

      <EffectComposer multisampling={4}>
        <Bloom luminanceThreshold={1.2} intensity={0.4} levels={5}/>
        <Outline
          selection={selectedMeshes}
          blendFunction={BlendFunction.SCREEN}
          edgeStrength={4}
          width={500}
          visibleEdgeColor={0x4f46e5}
          hiddenEdgeColor={0x200060}
        />
      </EffectComposer>
    </>
  );
};

// ─── Context Menu (HTML overlay) ─────────────────────────────
const ObjectContextMenu: React.FC<{
  itemId: string;
  transformMode: 'translate' | 'rotate';
  setTransformMode: (m: 'translate' | 'rotate') => void;
}> = ({ itemId, transformMode, setTransformMode }) => {
  const { removeFurniture, selectFurniture, furniture, addFurniture } = useDesignStore();
  const item = furniture.find(f => f.id === itemId);
  if (!item) return null;

  const handleDuplicate = () => {
    const newItem: FurnitureItem = {
      ...item,
      id: Math.random().toString(36).slice(2),
      position: [item.position[0] + 1, item.position[1], item.position[2] + 1],
    };
    addFurniture(newItem);
    selectFurniture(newItem.id);
  };

  return (
    <div style={{
      position: 'absolute', bottom: 72, left: '50%', transform: 'translateX(-50%)',
      display: 'flex', gap: 4, zIndex: 50,
      background: 'rgba(255,255,255,0.94)', backdropFilter: 'blur(16px)',
      border: '1px solid var(--border)', borderRadius: 'var(--r-lg)',
      padding: '5px 6px', boxShadow: 'var(--shadow-md)',
      animation: 'fadeUp 0.15s ease',
    }}>
      <button
        onClick={() => setTransformMode('translate')}
        className={`btn btn-sm ${transformMode === 'translate' ? 'btn-primary' : 'btn-ghost'}`}
        title="Di chuyển (G)"
      >
        <Move size={14}/> Di chuyển
      </button>
      <button
        onClick={() => setTransformMode('rotate')}
        className={`btn btn-sm ${transformMode === 'rotate' ? 'btn-primary' : 'btn-ghost'}`}
        title="Xoay (R)"
      >
        <RotateCcw size={14}/> Xoay
      </button>
      <div style={{ width: 1, background: 'var(--border)', margin: '0 2px' }}/>
      <button onClick={handleDuplicate} className="btn btn-sm btn-ghost" title="Nhân bản">
        <Copy size={14}/> Nhân bản
      </button>
      <button
        onClick={() => { removeFurniture(itemId); selectFurniture(null); }}
        className="btn btn-sm btn-danger" title="Xóa"
      >
        <Trash2 size={14}/> Xóa
      </button>
    </div>
  );
};

// ─── Texture Switcher ─────────────────────────────────────────
const TextureSwitcher: React.FC = () => {
  const { sceneMaterial, setSceneMaterial } = useDesignStore();
  const floors = Object.entries(FLOOR_PRESETS);
  const labels: Record<string, string> = { wood: 'Gỗ Sồi', tile: 'Gạch Men', concrete: 'Bê Tông', marble: 'Đá Marble' };
  return (
    <div style={{
      position: 'absolute', top: 60, right: 12, zIndex: 20,
      background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(16px)',
      border: '1px solid var(--border)', borderRadius: 'var(--r-lg)',
      padding: '10px 12px', width: 142, boxShadow: 'var(--shadow-md)',
    }}>
      <div style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Sàn nhà</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        {floors.map(([key, p]) => (
          <button key={key} onClick={() => setSceneMaterial({ floor: key as any })} style={{
            borderRadius: 'var(--r-sm)', height: 40, background: p.color, cursor: 'pointer',
            border: `2px solid ${sceneMaterial.floor === key ? '#4f46e5' : 'transparent'}`,
            boxShadow: sceneMaterial.floor === key ? '0 0 0 1px #4f46e5' : 'none',
            transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 9, fontWeight: 700, color: 'rgba(0,0,0,0.5)',
          }}>
            {labels[key]}
          </button>
        ))}
      </div>
    </div>
  );
};

// ─── HouseViewer3D (main export) ─────────────────────────────
export const HouseViewer3D: React.FC = () => {
  const { walls, furniture, selectWall, selectFurniture, selectedFurnitureId } = useDesignStore();
  const [transformMode, setTransformMode] = useState<'translate' | 'rotate'>('translate');
  const [viewMode, setViewMode] = useState<'design' | 'walk'>('design');
  const meshRefs = useRef<Map<string, React.RefObject<THREE.Group | null>>>(new Map());

  useEffect(() => {
    return () => { selectWall(null); selectFurniture(null); };
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: '#f0f2f5' }}>
      <KeyboardControls map={[
        { name: 'forward',  keys: ['ArrowUp',    'KeyW'] },
        { name: 'backward', keys: ['ArrowDown',  'KeyS'] },
        { name: 'left',     keys: ['ArrowLeft',  'KeyA'] },
        { name: 'right',    keys: ['ArrowRight', 'KeyD'] },
      ]}>
        <Canvas key="main-canvas" shadows
          camera={{ position: [12, 10, 12], fov: 42 }}
          onPointerMissed={() => { selectWall(null); selectFurniture(null); }}
          gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
        >
          <color attach="background" args={['#f0f2f5']}/>
          <Suspense fallback={null}>
            <Scene
              transformMode={transformMode}
              viewMode={viewMode}
              meshRefs={meshRefs}
            />
          </Suspense>
        </Canvas>
      </KeyboardControls>

      <LoaderOverlay/>

      {/* Context menu for selected furniture */}
      {selectedFurnitureId && viewMode === 'design' && (
        <ObjectContextMenu
          itemId={selectedFurnitureId}
          transformMode={transformMode}
          setTransformMode={setTransformMode}
        />
      )}

      {/* HUD bottom-left */}
      <div style={{ position: 'absolute', bottom: 16, left: 16, display: 'flex', flexDirection: 'column', gap: 6, zIndex: 20, pointerEvents: 'none' }}>
        <div style={{
          padding: '5px 12px', borderRadius: 'var(--r-md)',
          background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)',
          border: '1px solid var(--border)', fontSize: 12, fontWeight: 600, color: 'var(--text-2)',
          boxShadow: 'var(--shadow-xs)',
        }}>
          {walls.length} Tường • {furniture.length} Vật dụng
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-4)', paddingLeft: 2 }}>
          {viewMode === 'design'
            ? 'Chuột trái: Xoay • Cuộn: Zoom • Chuột phải: Di chuyển'
            : 'Click để khóa chuột • WASD: Di chuyển'}
        </div>
      </div>

      {/* View mode toggle */}
      <div style={{ position: 'absolute', bottom: 16, right: 160, display: 'flex', gap: 4, zIndex: 20,
        background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)',
        border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '4px 5px', boxShadow: 'var(--shadow-xs)'
      }}>
        {[{ id: 'design', label: '🎨 Thiết kế' }, { id: 'walk', label: '🚶 Tham quan' }].map(m => (
          <button key={m.id} onClick={() => setViewMode(m.id as any)}
            className={`tool-btn ${viewMode === m.id ? 'active' : ''}`}
            style={{ fontSize: 12, padding: '5px 10px' }}>
            {m.label}
          </button>
        ))}
      </div>

      <TextureSwitcher/>
    </div>
  );
};
