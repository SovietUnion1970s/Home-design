import React, { useState, useRef, useCallback, useEffect, Component } from 'react';
import type { ErrorInfo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Home as HomeIcon, 
  Layers, 
  Library, 
  Save, 
  Download, 
  MousePointer2, 
  PlusSquare, 
  DoorOpen, 
  Eye, 
  Box as CubeIcon, 
  Trash2, 
  Settings2,
  ChevronLeft,
  Search,
  Maximize,
  Sparkles,
  Info
} from 'lucide-react';
import { WallEditor2D } from '../components/WallEditor2D';
import { HouseViewer3D } from '../components/HouseViewer3D';
import AIPanel from '../components/AIPanel';
import { useDesignStore } from '../store/designStore';
import { useAuthStore } from '../store/authStore';
import type { FurnitureItem } from '../store/designStore';

// ─── Error Boundary ───────────────────────────────────────────
class ErrorBoundary extends Component<{ children: React.ReactNode; fallback: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('Mô hình 3D gặp lỗi:', error, info); }
  render() { return this.state.hasError ? this.props.fallback : this.props.children; }
}

// ─── Furniture Catalogue ─────────────────────────────────────
const FURNITURE_CATALOGUE = [
  {
    category: 'Phòng khách',
    items: [
      { type: 'sofa', label: 'Ghế Sofa', dim: '200×90cm', color: '#7c3aed' },
      { type: 'chair', label: 'Ghế Đơn', dim: '60×60cm', color: '#6d28d9' },
      { type: 'tv-unit', label: 'Kệ TV', dim: '180×45cm', color: '#5b21b6' },
      { type: 'coffee-table', label: 'Bàn Trà', dim: '120×60cm', color: '#4c1d95' },
    ]
  },
  {
    category: 'Phòng ngủ',
    items: [
      { type: 'bed', label: 'Giường Đôi', dim: '160×200cm', color: '#0d9488' },
      { type: 'wardrobe', label: 'Tủ Quần Áo', dim: '120×60cm', color: '#0f766e' },
      { type: 'desk', label: 'Bàn Làm Việc', dim: '120×60cm', color: '#115e59' },
    ]
  },
  {
    category: 'Vệ sinh & Cửa',
    items: [
      { type: 'shower', label: 'Vòi Sen', dim: '90×90cm', color: '#1d4ed8' },
      { type: 'door', label: 'Cửa Ra Vào', dim: '80×210cm', color: '#92400e' },
      { type: 'window', label: 'Cửa Sổ', dim: '120×140cm', color: '#78350f' },
    ]
  },
];

type ActiveTool = 'select' | 'wall' | 'door';
type ViewMode = '2D' | '3D';
type SidebarTab = 'layers' | 'library';

// ─── Furniture Thumbnail ─────────────────────────────────────
const FurnitureSVG: React.FC<{ type: string; color: string }> = ({ type, color }) => {
  const shapes: Record<string, React.ReactNode> = {
    sofa: <><rect x="2" y="10" width="28" height="16" rx="3" fill={color} opacity={0.7}/><rect x="0" y="14" width="5" height="12" rx="2" fill={color}/><rect x="27" y="14" width="5" height="12" rx="2" fill={color}/><rect x="2" y="10" width="28" height="5" rx="2" fill={color} opacity={0.9}/></>,
    bed: <><rect x="2" y="4" width="28" height="24" rx="2" fill={color} opacity={0.5}/><rect x="2" y="4" width="28" height="9" rx="2" fill={color} opacity={0.85}/><rect x="4" y="8" width="11" height="5" rx="2" fill="white" opacity={0.25}/><rect x="17" y="8" width="11" height="5" rx="2" fill="white" opacity={0.25}/></>,
    chair: <><rect x="6" y="10" width="20" height="16" rx="3" fill={color} opacity={0.7}/><rect x="4" y="8" width="24" height="4" rx="2" fill={color}/></>,
    default: <rect x="4" y="6" width="24" height="20" rx="4" fill={color} opacity={0.55}/>,
  };
  return (
    <svg viewBox="0 0 32 32" style={{ width: '100%', height: '100%' }}>
      {shapes[type] || shapes.default}
    </svg>
  );
};

// ─── Property Panel ───────────────────────────────────────────
const PropertyPanel: React.FC = () => {
  const {
    walls, selectedWallId, selectedFurnitureId, furniture,
    updateWall, removeWall, removeFurniture, getAnalytics,
    selectWall, selectFurniture, sceneMaterial, setSceneMaterial
  } = useDesignStore();

  const analytics = getAnalytics();
  const selectedWall = walls.find(w => w.id === selectedWallId);
  const selectedFur = furniture.find(f => f.id === selectedFurnitureId);

  if (selectedWall) {
    const length = Math.sqrt(
      (selectedWall.end.x - selectedWall.start.x) ** 2 +
      (selectedWall.end.y - selectedWall.start.y) ** 2
    ).toFixed(2);
    return (
      <div className="ds-panel-body">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Info size={14} className="text-purple" /> Thuộc tính Tường
          </div>
          <button className="btn btn-ghost btn-icon" onClick={() => selectWall(null)}><Trash2 size={14} /></button>
        </div>
        <div className="prop-row">
          <div className="prop-label">Chiều dài</div>
          <div className="prop-value" style={{ color: 'var(--purple)' }}>{length} m</div>
        </div>
        <div className="prop-row">
          <div className="prop-label">Chiều cao (m)</div>
          <input className="prop-input" type="number" step="0.1" defaultValue={selectedWall.height}
            onBlur={e => updateWall(selectedWall.id, { height: Number(e.target.value) })} />
        </div>
        <div className="prop-row">
          <div className="prop-label">Màu tường</div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 4 }}>
            {['#c7d2fe', '#a5f3fc', '#ffffff', '#fde68a', '#fca5a5', '#bbf7d0', '#e9d5ff'].map(c => (
              <div key={c} onClick={() => updateWall(selectedWall.id, { color: c })}
                style={{
                  width: 22, height: 22, borderRadius: 5, background: c, cursor: 'pointer',
                  border: `2px solid ${selectedWall.color === c ? 'white' : 'transparent'}`,
                  boxShadow: selectedWall.color === c ? `0 0 8px ${c}88` : 'none',
                }} />
            ))}
          </div>
        </div>
        <div className="prop-divider" />
        <button className="btn btn-danger" style={{ width: '100%', fontSize: 12 }}
          onClick={() => { removeWall(selectedWall.id); selectWall(null); }}>
          Xóa tường
        </button>
      </div>
    );
  }

  if (selectedFur) {
    return (
      <div className="ds-panel-body">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
            <CubeIcon size={14} className="text-purple" /> {selectedFur.label}
          </div>
          <button className="btn btn-ghost btn-icon" onClick={() => selectFurniture(null)}><Trash2 size={14} /></button>
        </div>
        <div className="prop-row">
          <div className="prop-label">Vị trí X</div>
          <input className="prop-input" type="number" step="0.1" defaultValue={selectedFur.position[0].toFixed(2)}
            onBlur={e => useDesignStore.getState().updateFurniturePosition(selectedFur.id, [Number(e.target.value), selectedFur.position[1], selectedFur.position[2]])} />
        </div>
        <div className="prop-row">
          <div className="prop-label">Vị trí Z</div>
          <input className="prop-input" defaultValue={selectedFur.position[2].toFixed(2)}
            onBlur={e => {
              const { updateFurniture } = useDesignStore.getState();
              updateFurniture(selectedFur.id, { position: [selectedFur.position[0], selectedFur.position[1], Number(e.target.value)] });
            }} />
        </div>
        <div style={{ height: 1, background: 'var(--border)', margin: '14px 0' }} />
        <button className="btn btn-danger" style={{ width: '100%', fontSize: 12 }}
          onClick={() => { removeFurniture(selectedFur.id); selectFurniture(null); }}>
          🗑 Xóa vật dụng
        </button>
      </div>
    );
  }

  // Default: Analytics + Materials
  return (
    <div className="ds-panel-body">
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 12 }}>
        📊 Smart Analytics
      </div>

      {analytics.totalWallLength === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--text-4)', fontSize: 12, padding: '16px 0' }}>
          Vẽ tường để xem thống kê
        </div>
      ) : (
        <>
          <div className="analytics-stat-row">
            <div className="analytics-stat">
              <div className="analytics-stat-value" style={{ color: 'var(--purple)' }}>{analytics.totalWallLength}</div>
              <div className="analytics-stat-label">Tổng dài (m)</div>
            </div>
            <div className="analytics-stat">
              <div className="analytics-stat-value" style={{ color: 'var(--teal)' }}>{analytics.totalArea}</div>
              <div className="analytics-stat-label">Diện tích (m²)</div>
            </div>
          </div>
          <div className="analytics-material">
            <span className="analytics-material-icon">🧱</span>
            <div className="analytics-material-info">
              <div className="analytics-material-label">Gạch Ước Tính</div>
              <div className="analytics-material-val">{analytics.estimatedBricks.toLocaleString()} viên</div>
            </div>
          </div>
          <div className="analytics-material" style={{ borderColor: 'rgba(168,85,247,0.2)', background: 'rgba(168,85,247,0.05)' }}>
            <span className="analytics-material-icon">🎨</span>
            <div className="analytics-material-info">
              <div className="analytics-material-label" style={{ color: '#a5b4fc' }}>Sơn Tường</div>
              <div className="analytics-material-val" style={{ color: '#c4b5fd' }}>{analytics.estimatedPaintVolume} Lít</div>
            </div>
          </div>
          <div className="analytics-material">
            <span className="analytics-material-icon">💰</span>
            <div className="analytics-material-info">
              <div className="analytics-material-label">Chi Phí Ước Tính</div>
              <div className="analytics-material-val" style={{ color: 'var(--amber)' }}>
                ~{(analytics.estimatedBricks * 2500).toLocaleString('vi')}₫
              </div>
            </div>
          </div>
        </>
      )}

      <div style={{ height: 1, background: 'var(--border)', margin: '14px 0' }} />

      {/* Wall paint picker */}
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 10 }}>
        🎨 Màu sơn tường
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {['#c7d2fe', '#a5f3fc', '#fde68a', '#bbf7d0', '#ffffff', '#e2e8f0', '#fecaca', '#ddd6fe'].map(c => (
          <div key={c} onClick={() => setSceneMaterial({ wallPaint: c })}
            style={{
              width: 24, height: 24, borderRadius: 5, background: c, cursor: 'pointer',
              border: `2px solid ${sceneMaterial.wallPaint === c ? 'white' : 'transparent'}`,
              boxShadow: sceneMaterial.wallPaint === c ? `0 0 10px ${c}66` : 'none',
              transition: 'all 0.15s',
            }} />
        ))}
      </div>

      <div style={{ height: 1, background: 'var(--border)', margin: '14px 0' }} />
      <div style={{ fontSize: 10, color: 'var(--text-4)', lineHeight: 1.6 }}>
        Click vào tường hoặc vật dụng để chỉnh sửa thuộc tính chi tiết.
      </div>
    </div>
  );
};

// ─── Ruler H ─────────────────────────────────────────────────
const RulerH: React.FC = () => (
  <div className="ds-ruler-h" style={{ position: 'relative', overflow: 'hidden' }}>
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      {Array.from({ length: 25 }, (_, i) => (
        <g key={i}>
          <line x1={i * 100} y1={12} x2={i * 100} y2={20} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
          <text x={i * 100 + 2} y={10} fontSize={7} fill="rgba(255,255,255,0.25)">{i}m</text>
        </g>
      ))}
    </svg>
  </div>
);

// ─── MAIN DESIGNER PAGE ───────────────────────────────────────
const DesignerPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('2D');
  const [activeTool, setActiveTool] = useState<ActiveTool>('wall');
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('library');
  const [showAI, setShowAI] = useState(false);
  const navigate = useNavigate();

  const {
    walls, furniture, selectedWallId, selectedFurnitureId,
    projectName, setProjectName, isSaving, saveProjectToServer,
    clearAll, addFurniture, selectWall, selectFurniture,
    undo, redo, canUndo, canRedo,
  } = useDesignStore();

  const { user, logout } = useAuthStore();

  const handleLogout = () => { logout(); navigate('/login'); };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input field
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        const state = useDesignStore.getState();
        if (state.selectedFurnitureId) {
          state.removeFurniture(state.selectedFurnitureId);
          state.selectFurniture(null);
        } else if (state.selectedWallId) {
          state.removeWall(state.selectedWallId);
          state.selectWall(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleAddFurniture = useCallback((type: string, label: string, color: string) => {
    const item: FurnitureItem = {
      id: Math.random().toString(36).slice(2),
      type, label,
      position: [Math.random() * 4, 0, Math.random() * 4],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      color,
    };
    addFurniture(item);
    selectFurniture(item.id);
    if (viewMode !== '3D') setViewMode('3D');
  }, [addFurniture, selectFurniture, viewMode]);

  return (
    <div className="ds-layout">
      {/* ── TOP HEADER ──────────────────────────────────────── */}
      <header className="ds-header">
        <Link to="/dashboard" className="btn btn-ghost btn-icon" style={{ fontSize: 16, flexShrink: 0 }}>←</Link>
        <div className="ds-header-sep" />
        <div className="db-logo-mark" style={{ width: 24, height: 24, fontSize: 12, flexShrink: 0 }}>🏠</div>
        <input
          className="ds-name-input"
          value={projectName}
          onChange={e => setProjectName(e.target.value)}
          spellCheck={false}
        />
        <div className="ds-header-sep" />
        <div className="badge badge-purple" style={{ flexShrink: 0 }}>
          {walls.length} tường · {furniture.length} vật dụng
        </div>

        <div style={{ flex: 1 }} />

        {/* AI toggle */}
        <button
          className={`btn ${showAI ? 'btn-teal' : 'btn-ghost'}`}
          onClick={() => setShowAI(v => !v)}
          style={{ fontSize: 13 }}
        >
          🤖 AI
        </button>

        {isSaving && (
          <div style={{ fontSize: 11, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 5 }}>
            <span className="spin">↻</span> Đang lưu...
          </div>
        )}
        <button className="btn btn-danger btn-icon" onClick={clearAll} title="Xóa tất cả" style={{ fontSize: 14, flexShrink: 0 }}>🗑</button>
        <button className="btn btn-primary" onClick={saveProjectToServer} disabled={isSaving} style={{ fontSize: 13, flexShrink: 0 }}>
          💾 Lưu
        </button>
        <button className="btn btn-ghost" style={{ fontSize: 13, flexShrink: 0 }}>📤 Xuất</button>

        {/* User menu */}
        <div title={`${user?.email} (${user?.role}) - Click để đăng xuất`} onClick={handleLogout}
          style={{
            width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, var(--purple-dark), var(--teal))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, cursor: 'pointer',
          }}
        >
          {user?.email?.[0]?.toUpperCase() || 'U'}
        </div>
      </header>

      {/* ── BODY ─────────────────────────────────────────────── */}
      <div className="ds-body">
        {/* ── LEFT SIDEBAR ──────────────────────────────────── */}
        <aside className="ds-sidebar">
          <div className="ds-sidebar-tabs">
            <div className={`ds-sidebar-tab ${sidebarTab === 'layers' ? 'active' : ''}`}
              onClick={() => setSidebarTab('layers')}>Layers</div>
            <div className={`ds-sidebar-tab ${sidebarTab === 'library' ? 'active' : ''}`}
              onClick={() => setSidebarTab('library')}>Thư viện</div>
          </div>
          <div className="ds-sidebar-body">
            {sidebarTab === 'layers' ? (
              <>
                <div className="ds-section">
                  <div className="ds-section-title">Tường ({walls.length})</div>
                  {walls.length === 0 && <div style={{ fontSize: 11, color: 'var(--text-4)', padding: '8px', textAlign: 'center' }}>Chưa có tường</div>}
                  {walls.map((w, i) => {
                    const len = Math.sqrt((w.end.x - w.start.x) ** 2 + (w.end.y - w.start.y) ** 2).toFixed(1);
                    return (
                      <div key={w.id}
                        className={`ds-wall-item ${selectedWallId === w.id ? 'selected' : ''}`}
                        onClick={() => selectWall(w.id)}
                      >
                        <div className="ds-wall-dot" style={{ background: w.color || 'rgba(168,85,247,0.15)' }}>▬</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 11, fontWeight: 500 }}>Tường {i + 1}</div>
                          <div style={{ fontSize: 9, color: 'var(--text-3)' }}>{len}m · h{w.height}m</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="ds-section">
                  <div className="ds-section-title">Vật dụng ({furniture.length})</div>
                  {furniture.map(f => (
                    <div key={f.id}
                      className={`ds-wall-item ${selectedFurnitureId === f.id ? 'selected' : ''}`}
                      onClick={() => selectFurniture(f.id)}
                    >
                      <div className="ds-wall-dot" style={{ fontSize: 12 }}>●</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                {FURNITURE_CATALOGUE.map(cat => (
                  <div key={cat.category} className="ds-section">
                    <div className="ds-section-title">{cat.category}</div>
                    {cat.items.map(item => (
                      <div
                        key={item.type}
                        className="fur-item"
                        draggable
                        onClick={() => handleAddFurniture(item.type, item.label, item.color)}
                        title={`Thêm ${item.label} vào 3D`}
                      >
                        <div className="fur-thumb">
                          <FurnitureSVG type={item.type} color={item.color} />
                        </div>
                        <div className="fur-info">
                          <div className="fur-name">{item.label}</div>
                          <div className="fur-dim">{item.dim}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </>
            )}
          </div>
        </aside>

        {/* ── CANVAS AREA ──────────────────────────────────── */}
        <div className="ds-canvas-area">
          {/* Contextual Toolbar */}
          <div className="ds-toolbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <button className={`tool-btn ${activeTool === 'select' ? 'active' : ''}`}
                onClick={() => setActiveTool('select')}>
                <span className="tool-btn-icon">↖</span> Select
              </button>
              <div className="ds-toolbar-sep" />
              <button className={`tool-btn ${activeTool === 'wall' ? 'active' : ''}`}
                onClick={() => setActiveTool('wall')}>
                <span className="tool-btn-icon">🧱</span> Vẽ Tường
              </button>
              <button className={`tool-btn ${activeTool === 'door' ? 'active' : ''}`}
                onClick={() => setActiveTool('door')}>
                <span className="tool-btn-icon">🚪</span> Thêm Cửa
              </button>
              <div className="ds-toolbar-sep" />
              {/* UNDO/REDO — now functional! */}
              <button
                className="tool-btn"
                onClick={undo}
                disabled={!canUndo()}
                style={{ opacity: canUndo() ? 1 : 0.3 }}
                title="Hoàn tác (Ctrl+Z)"
              >↩ Undo</button>
              <button
                className="tool-btn"
                onClick={redo}
                disabled={!canRedo()}
                style={{ opacity: canRedo() ? 1 : 0.3 }}
                title="Làm lại (Ctrl+Y)"
              >↪ Redo</button>
            </div>
            <div style={{ flex: 1 }} />
            <div className="view-toggle">
              <button className={`view-btn ${viewMode === '2D' ? 'active' : ''}`} onClick={() => setViewMode('2D')}>
                ✏️ 2D
              </button>
              <button className={`view-btn ${viewMode === '3D' ? 'active' : ''}`} onClick={() => setViewMode('3D')}>
                🎮 3D
              </button>
            </div>
          </div>

          {/* Canvas with rulers */}
          <div className="ds-canvas-body">
            <div style={{ width: 20, flexShrink: 0, background: 'rgba(4,4,13,0.9)', borderRight: '1px solid var(--border)' }}>
              <svg style={{ width: '100%', height: '100%', marginTop: 20 }}>
                {Array.from({ length: 20 }, (_, i) => (
                  <g key={i}>
                    <line x1={14} y1={i * 100} x2={20} y2={i * 100} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
                    <text x={1} y={i * 100 + 3} fontSize={7} fill="rgba(255,255,255,0.2)" writingMode="tb">{i}</text>
                  </g>
                ))}
              </svg>
            </div>
            <div className="ds-ruler-h-wrap">
              <RulerH />
              <div className="ds-canvas-main">
                <ErrorBoundary fallback={<div className="ds-empty"><div className="ds-empty-icon">⚠️</div><div className="ds-empty-text">Đồ họa 3D tải thất bại.</div><button className="btn btn-primary" onClick={() => window.location.reload()} style={{marginTop: 10}}>Tải lại</button></div>}>
                  {viewMode === '2D' ? <WallEditor2D /> : <HouseViewer3D />}
                </ErrorBoundary>
                {viewMode === '2D' && walls.length === 0 && (
                  <div className="ds-empty">
                    <div className="ds-empty-icon float">🖊️</div>
                    <div className="ds-empty-text">Nhấp để bắt đầu vẽ tường</div>
                    <div className="ds-empty-sub">Click 1 lần để đặt điểm đầu · Click lần 2 để hoàn thành</div>
                  </div>
                )}
                {/* AI Panel overlay */}
                {showAI && <AIPanel />}
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT PROPERTY PANEL ─────────────────────────── */}
        <div className="ds-right-panel">
          <div className="ds-panel-header">
            {selectedWallId ? '⚡ Thuộc Tính Tường' : selectedFurnitureId ? '✨ Thuộc Tính Vật Dụng' : '📊 Thống kê & Phân tích'}
          </div>
          <PropertyPanel />
        </div>
      </div>
    </div>
  );
};

export default DesignerPage;
