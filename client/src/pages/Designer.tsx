import React, { useState, useEffect, Component } from 'react';
import type { ErrorInfo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronLeft, MousePointer2, Square, DoorOpen, AppWindow,
  Undo2, Redo2, Layers, Library, Settings2, Trash2,
  Box, SlidersHorizontal, Save, Upload, Bot, Info,
  LayoutGrid
} from 'lucide-react';
import { WallEditor2D } from '../components/WallEditor2D';
import { HouseViewer3D } from '../components/HouseViewer3D';
import AIPanel from '../components/AIPanel';
import SketchfabBrowser from '../components/SketchfabBrowser';
import { useDesignStore } from '../store/designStore';
import { useAuthStore } from '../store/authStore';
import { Logo } from '../components/Logo';
import { UserProfileMenu } from '../components/UserProfileMenu';

// ─── Error Boundary ───────────────────────────────────────────
class ErrorBoundary extends Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(e: Error, info: ErrorInfo) { console.error('3D Error:', e, info); }
  render() { return this.state.hasError ? this.props.fallback : this.props.children; }
}

type ActiveTool  = 'select' | 'wall' | 'door' | 'window';
type ViewMode    = '2D' | '3D';
type SidebarTab  = 'library' | 'templates' | 'layers' | 'ai';

// ─── Property Panel ───────────────────────────────────────────
const PropertyPanel: React.FC = () => {
  const {
    walls, selectedWallId, selectedFurnitureId, furniture,
    updateWall, removeWall, removeFurniture, getAnalytics,
    selectWall, selectFurniture, sceneMaterial, setSceneMaterial,
    updateFurniturePosition,
  } = useDesignStore();

  const analytics  = getAnalytics();
  const selectedWall = walls.find(w => w.id === selectedWallId);
  const selectedFur  = furniture.find(f => f.id === selectedFurnitureId);

  // Wall properties
  if (selectedWall) {
    const len = Math.sqrt(
      (selectedWall.end.x - selectedWall.start.x) ** 2 +
      (selectedWall.end.y - selectedWall.start.y) ** 2
    ).toFixed(2);
    return (
      <div className="ds-panel-body">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Square size={14} strokeWidth={1.5} style={{ color: 'var(--purple)' }}/> Thuộc tính Tường
          </div>
          <button className="btn btn-icon btn-ghost" onClick={() => selectWall(null)} title="Bỏ chọn">
            <Info size={14} strokeWidth={1.5}/>
          </button>
        </div>

        <div className="prop-row">
          <div className="prop-label">Chiều dài</div>
          <div className="prop-value" style={{ color: 'var(--purple)', fontSize: 18, fontWeight: 800 }}>{len} m</div>
        </div>

        <div className="prop-row">
          <div className="prop-label">Chiều cao (m)</div>
          <input className="prop-input" type="number" step="0.1" min="1.8" max="6"
            defaultValue={selectedWall.height}
            onBlur={e => updateWall(selectedWall.id, { height: Number(e.target.value) })}/>
        </div>

        <div className="prop-row">
          <div className="prop-label">Độ dày (m)</div>
          <input className="prop-input" type="number" step="0.05" min="0.05" max="0.5"
            defaultValue={selectedWall.thickness}
            onBlur={e => updateWall(selectedWall.id, { thickness: Number(e.target.value) })}/>
        </div>

        <div className="prop-row">
          <div className="prop-label">Màu tường</div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 4 }}>
            {['#f1f5f9','#e0e7ff','#dbeafe','#dcfce7','#fef3c7','#ffe4e6','#f5f5f4','#1e293b'].map(c => (
              <div key={c} onClick={() => updateWall(selectedWall.id, { color: c })} title={c}
                style={{
                  width: 26, height: 26, borderRadius: 6, background: c, cursor: 'pointer',
                  border: `2px solid ${selectedWall.color === c ? 'var(--purple)' : 'var(--border-2)'}`,
                  boxShadow: selectedWall.color === c ? 'var(--shadow-purple)' : 'none',
                  transition: 'all 0.15s',
                }}/>
            ))}
          </div>
        </div>

        <div className="prop-divider"/>
        <button className="btn btn-danger" style={{ width: '100%', fontSize: 12, justifyContent: 'center' }}
          onClick={() => { removeWall(selectedWall.id); selectWall(null); }}>
          <Trash2 size={14} strokeWidth={1.5}/> Xóa tường này
        </button>
      </div>
    );
  }

  // Furniture properties
  if (selectedFur) {
    return (
      <div className="ds-panel-body">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Box size={14} strokeWidth={1.5} style={{ color: 'var(--purple)' }}/> {selectedFur.label}
          </div>
        </div>

        <div className="prop-row">
          <div className="prop-label">Loại</div>
          <div className="prop-value">{selectedFur.type}</div>
        </div>

        <div className="prop-row">
          <div className="prop-label">Vị trí X (m)</div>
          <input className="prop-input" type="number" step="0.5"
            defaultValue={selectedFur.position[0].toFixed(2)}
            onBlur={e => updateFurniturePosition(selectedFur.id, [Number(e.target.value), selectedFur.position[1], selectedFur.position[2]])}/>
        </div>
        <div className="prop-row">
          <div className="prop-label">Vị trí Z (m)</div>
          <input className="prop-input" type="number" step="0.5"
            defaultValue={selectedFur.position[2].toFixed(2)}
            onBlur={e => updateFurniturePosition(selectedFur.id, [selectedFur.position[0], selectedFur.position[1], Number(e.target.value)])}/>
        </div>

        {selectedFur.assetUrl && (
          <div className="prop-row">
            <div className="prop-label">Model URL</div>
            <div style={{ fontSize: 10, color: 'var(--text-4)', wordBreak: 'break-all', lineHeight: 1.4 }}>
              {selectedFur.assetUrl.split('/').pop()}
            </div>
          </div>
        )}

        <div className="prop-divider"/>
        <button className="btn btn-danger" style={{ width: '100%', fontSize: 12, justifyContent: 'center' }}
          onClick={() => { removeFurniture(selectedFur.id); selectFurniture(null); }}>
          <Trash2 size={14} strokeWidth={1.5}/> Xóa vật dụng
        </button>
      </div>
    );
  }

  // Default analytics
  return (
    <div className="ds-panel-body">
      <div className="ds-section-title" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
        <SlidersHorizontal size={12} strokeWidth={1.5}/> Phân tích không gian
      </div>

      {analytics.totalWallLength > 0 ? (
        <>
          <div className="analytics-stat-row">
            <div className="analytics-stat">
              <div className="analytics-stat-value" style={{ color: 'var(--purple)' }}>{analytics.totalWallLength}</div>
              <div className="analytics-stat-label">Tổng dài tường (m)</div>
            </div>
            <div className="analytics-stat">
              <div className="analytics-stat-value" style={{ color: 'var(--teal)' }}>{analytics.totalArea}</div>
              <div className="analytics-stat-label">Diện tích (m²)</div>
            </div>
          </div>
          <div className="analytics-material">
            <span className="analytics-material-icon">🧱</span>
            <div className="analytics-material-info">
              <div className="analytics-material-label">Gạch xây ước tính</div>
              <div className="analytics-material-val">{analytics.estimatedBricks.toLocaleString('vi')} viên</div>
            </div>
          </div>
          <div className="analytics-material" style={{ borderColor: 'rgba(79,70,229,0.15)', background: 'rgba(79,70,229,0.04)' }}>
            <span className="analytics-material-icon">🎨</span>
            <div className="analytics-material-info">
              <div className="analytics-material-label" style={{ color: 'var(--purple)' }}>Sơn tường</div>
              <div className="analytics-material-val" style={{ color: 'var(--purple)' }}>{analytics.estimatedPaintVolume} Lít</div>
            </div>
          </div>
          <div className="analytics-material" style={{ borderColor: '#fde68a', background: '#fffbeb' }}>
            <span className="analytics-material-icon">💰</span>
            <div className="analytics-material-info">
              <div className="analytics-material-label" style={{ color: 'var(--amber)' }}>Chi phí ước tính</div>
              <div className="analytics-material-val" style={{ color: 'var(--amber)' }}>~{(analytics.estimatedBricks * 2500).toLocaleString('vi')} ₫</div>
            </div>
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-4)', fontSize: 13 }}>
          Vẽ tường để xem thống kê
        </div>
      )}

      <div className="prop-divider"/>

      <div className="ds-section-title" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <Settings2 size={12} strokeWidth={1.5}/> Màu Sơn Tường
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {['#f1f5f9','#e0e7ff','#dbeafe','#dcfce7','#fef9c3','#ffe4e6','#f5f5f4','#1e293b'].map(c => (
          <div key={c} onClick={() => setSceneMaterial({ wallPaint: c })} title={c}
            style={{
              width: 28, height: 28, borderRadius: 7, background: c, cursor: 'pointer',
              border: `2px solid ${sceneMaterial.wallPaint === c ? 'var(--purple)' : 'var(--border-2)'}`,
              boxShadow: sceneMaterial.wallPaint === c ? 'var(--shadow-purple)' : 'none',
              transition: 'all 0.15s',
            }}/>
        ))}
      </div>

      <div style={{ marginTop: 16, fontSize: 11, color: 'var(--text-4)', lineHeight: 1.6 }}>
        Click vào tường hoặc vật dụng để xem thuộc tính chi tiết.
      </div>
    </div>
  );
};

// ─── Layers Panel ─────────────────────────────────────────────
const LayersPanel: React.FC = () => {
  const { walls, furniture, selectedWallId, selectedFurnitureId, selectWall, selectFurniture, removeFurniture, removeWall } = useDesignStore();
  return (
    <div className="ds-panel-body" style={{ padding: '12px' }}>
      <div className="ds-section">
        <div className="ds-section-title">Tường ({walls.length})</div>
        {walls.length === 0 ? (
          <div style={{ fontSize: 11, color: 'var(--text-4)', padding: '8px 4px' }}>Chưa có tường nào</div>
        ) : (
          walls.map((w, i) => {
            const len = Math.sqrt((w.end.x - w.start.x)**2 + (w.end.y - w.start.y)**2).toFixed(1);
            return (
              <div key={w.id} className={`ds-wall-item ${selectedWallId === w.id ? 'selected' : ''}`}
                onClick={() => selectWall(w.id)}>
                <Square size={14} strokeWidth={1.5} style={{ color: w.color || 'var(--slate)', flexShrink:0 }}/>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>Tường {i + 1}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-4)' }}>{len}m · h{w.height}m</div>
                </div>
                <button className="btn btn-icon" style={{ padding: 4, opacity: 0.5 }}
                  onClick={(e) => { e.stopPropagation(); removeWall(w.id); }}>
                  <Trash2 size={12} strokeWidth={1.5}/>
                </button>
              </div>
            );
          })
        )}
      </div>

      <div className="ds-section">
        <div className="ds-section-title">Nội thất ({furniture.length})</div>
        {furniture.map(f => (
          <div key={f.id} className={`ds-wall-item ${selectedFurnitureId === f.id ? 'selected' : ''}`}
            onClick={() => selectFurniture(f.id)}>
            <Box size={14} strokeWidth={1.5} style={{ color: f.color, flexShrink: 0 }}/>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.label}</div>
              <div style={{ fontSize: 10, color: 'var(--text-4)' }}>{f.type}</div>
            </div>
            <button className="btn btn-icon" style={{ padding: 4, opacity: 0.5 }}
              onClick={(e) => { e.stopPropagation(); removeFurniture(f.id); }}>
              <Trash2 size={12} strokeWidth={1.5}/>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── MAIN DESIGNER PAGE ───────────────────────────────────────
const DesignerPage: React.FC = () => {
  const [viewMode, setViewMode]   = useState<ViewMode>('2D');
  const [activeTool, setActiveTool] = useState<ActiveTool>('wall');
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('library');
  const [showAI, setShowAI]       = useState(false);

  const {
    walls, furniture, selectedWallId, selectedFurnitureId,
    projectName, setProjectName, isSaving, saveProjectToServer,
    clearAll, loadRoomTemplate,
    undo, redo, canUndo, canRedo,
  } = useDesignStore();


  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      if (e.ctrlKey && e.key === 'z') { e.preventDefault(); undo(); }
      if (e.ctrlKey && e.key === 'y') { e.preventDefault(); redo(); }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const s = useDesignStore.getState();
        if (s.selectedFurnitureId) { s.removeFurniture(s.selectedFurnitureId); s.selectFurniture(null); }
        else if (s.selectedWallId) { s.removeWall(s.selectedWallId); s.selectWall(null); }
      }
      // Tool shortcuts
      if (!e.ctrlKey) {
        if (e.key === 'v' || e.key === 'Escape') setActiveTool('select');
        if (e.key === 'w') { setActiveTool('wall'); setViewMode('2D'); }
        if (e.key === 'd') { setActiveTool('door'); setViewMode('2D'); }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo]);

  const TOOLS = [
    { id: 'select', icon: <MousePointer2 size={16} strokeWidth={1.5}/>, label: 'Chọn', key: 'V', only2D: false },
    { id: 'wall',   icon: <Square       size={16} strokeWidth={1.5}/>, label: 'Vẽ Tường', key: 'W', only2D: true },
    { id: 'door',   icon: <DoorOpen     size={16} strokeWidth={1.5}/>, label: 'Cửa ra vào', key: 'D', only2D: true },
    { id: 'window', icon: <AppWindow    size={16} strokeWidth={1.5}/>, label: 'Cửa sổ', key: '', only2D: true },
  ];

  return (
    <div className="ds-layout">
      {/* ── HEADER ──────────────────────────────────────────── */}
      <header className="ds-header">
        <Link to="/dashboard" className="btn btn-ghost btn-icon" title="Về Dashboard">
          <ChevronLeft size={18} strokeWidth={1.5}/>
        </Link>
        <div className="ds-header-sep"/>
        <Logo size={18} showText={false}/>
        <input
          className="ds-name-input"
          value={projectName}
          onChange={e => setProjectName(e.target.value)}
          spellCheck={false}
          placeholder="Tên dự án..."
        />
        <div className="ds-header-sep"/>
        <div className="badge badge-slate" style={{ fontSize: 11 }}>
          {walls.length} tường · {furniture.length} vật dụng
        </div>

        <div style={{ flex: 1 }}/>

        {/* AI toggle */}
        <button className={`btn btn-sm ${showAI ? 'btn-teal' : 'btn-ghost'}`}
          onClick={() => setShowAI(v => !v)} title="AI Design Assistant">
          <Bot size={16} strokeWidth={1.5}/> AI
        </button>

        {isSaving && (
          <div style={{ fontSize: 11, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 5 }}>
            <span className="spin" style={{ fontSize: 14 }}>↻</span> Đang lưu...
          </div>
        )}

        <button className="btn btn-ghost btn-sm" onClick={clearAll} title="Xóa tất cả">
          <Trash2 size={15} strokeWidth={1.5}/>
        </button>

        <button className="btn btn-primary btn-sm" onClick={saveProjectToServer} disabled={isSaving}>
          <Save size={15} strokeWidth={1.5}/> Lưu
        </button>

        <button className="btn btn-ghost btn-sm" title="Xuất file">
          <Upload size={15} strokeWidth={1.5}/>
        </button>

        <UserProfileMenu/>
      </header>

      {/* ── BODY ─────────────────────────────────────────────── */}
      <div className="ds-body">

        {/* ── LEFT SIDEBAR ─────────────────────────────────── */}
        <aside className="ds-sidebar">
          <div className="ds-sidebar-tabs">
            <div className={`ds-sidebar-tab ${sidebarTab === 'library' ? 'active' : ''}`}
              onClick={() => setSidebarTab('library')} title="Thư viện model">
              <Library size={12} strokeWidth={1.5} style={{ marginRight: 4 }}/> Models
            </div>
            <div className={`ds-sidebar-tab ${sidebarTab === 'templates' ? 'active' : ''}`}
              onClick={() => setSidebarTab('templates')} title="Mẫu phòng">
              <LayoutGrid size={12} strokeWidth={1.5} style={{ marginRight: 4 }}/> Templates
            </div>
            <div className={`ds-sidebar-tab ${sidebarTab === 'layers' ? 'active' : ''}`}
              onClick={() => setSidebarTab('layers')} title="Các lớp thiết kế">
              <Layers size={12} strokeWidth={1.5} style={{ marginRight: 4 }}/> Layers
            </div>
          </div>

          {sidebarTab === 'library' ? (
            <SketchfabBrowser onAdd={() => { if (viewMode !== '3D') setViewMode('3D'); }}/>
          ) : sidebarTab === 'templates' ? (
            <div className="ds-panel-body" style={{ padding: '12px' }}>
              <div className="ds-section-title">Mẫu phòng thiết kế sẵn</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
                <button className="btn btn-ghost" style={{ justifyContent: 'flex-start', padding: '12px 16px' }}
                  onClick={() => confirm('Xóa trắng bản vẽ và tải Mẫu Phòng Ngủ?') && loadRoomTemplate('bedroom')}>
                  🛏️ Phòng Ngủ Hiện Đại
                </button>
                <button className="btn btn-ghost" style={{ justifyContent: 'flex-start', padding: '12px 16px' }}
                  onClick={() => confirm('Xóa trắng bản vẽ và tải Mẫu Phòng Khách?') && loadRoomTemplate('living')}>
                  🛋️ Phòng Khách Tối Giản
                </button>
              </div>
            </div>
          ) : (
            <LayersPanel/>
          )}
        </aside>

        {/* ── CANVAS AREA ──────────────────────────────────── */}
        <div className="ds-canvas-area">

          {/* Floating Toolbar */}
          <div className="ds-toolbar">
            {TOOLS.map(t => (
              <button
                key={t.id}
                className={`tool-btn ${activeTool === t.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveTool(t.id as ActiveTool);
                  if (t.only2D && viewMode === '3D') setViewMode('2D');
                }}
                title={`${t.label}${t.key ? ` (${t.key})` : ''}`}
              >
                <span className="tool-btn-icon">{t.icon}</span>
                {t.label}
              </button>
            ))}

            <div className="ds-toolbar-sep"/>

            <button className="tool-btn" onClick={undo} disabled={!canUndo()} title="Hoàn tác (Ctrl+Z)">
              <Undo2 size={15} strokeWidth={1.5}/>
            </button>
            <button className="tool-btn" onClick={redo} disabled={!canRedo()} title="Làm lại (Ctrl+Y)">
              <Redo2 size={15} strokeWidth={1.5}/>
            </button>

            <div className="ds-toolbar-sep"/>

            <div className="view-toggle">
              <button className={`view-btn ${viewMode === '2D' ? 'active' : ''}`} onClick={() => setViewMode('2D')}>
                <LayoutGrid size={13} strokeWidth={1.5} style={{ marginRight: 4 }}/> 2D
              </button>
              <button className={`view-btn ${viewMode === '3D' ? 'active' : ''}`} onClick={() => setViewMode('3D')}>
                <Box size={13} strokeWidth={1.5} style={{ marginRight: 4 }}/> 3D
              </button>
            </div>
          </div>

          {/* Canvas main */}
          <div className="ds-canvas-body">
            <div className="ds-canvas-main">
              <ErrorBoundary fallback={
                <div className="ds-empty">
                  <div className="ds-empty-icon">⚠️</div>
                  <div className="ds-empty-text">Lỗi đồ họa 3D</div>
                  <button className="btn btn-primary" onClick={() => window.location.reload()} style={{ marginTop: 12, pointerEvents: 'all' }}>
                    Tải lại trang
                  </button>
                </div>
              }>
                {viewMode === '2D'
                  ? <WallEditor2D activeTool={activeTool}/>
                  : <HouseViewer3D/>
                }
              </ErrorBoundary>

              {viewMode === '2D' && walls.length === 0 && activeTool === 'wall' && (
                <div className="ds-empty" style={{ pointerEvents: 'none' }}>
                  <div className="ds-empty-icon float">🏗️</div>
                  <div className="ds-empty-text">Click để đặt điểm đầu tường</div>
                  <div className="ds-empty-sub">Click lần 2 để hoàn thành · Lưới snap 0.5m</div>
                </div>
              )}

              {/* AI Panel overlay */}
              {showAI && <AIPanel/>}
            </div>
          </div>
        </div>

        {/* ── RIGHT PROPERTY PANEL ─────────────────────────── */}
        <div className="ds-right-panel">
          <div className="ds-panel-header">
            {selectedWallId
              ? <><Square size={13} strokeWidth={1.5} style={{ marginRight: 6, color: 'var(--purple)' }}/>Thuộc Tính Tường</>
              : selectedFurnitureId
              ? <><Box size={13} strokeWidth={1.5} style={{ marginRight: 6, color: 'var(--purple)' }}/>Thuộc Tính Vật Dụng</>
              : <><SlidersHorizontal size={13} strokeWidth={1.5} style={{ marginRight: 6 }}/>Thống kê & Phân tích</>
            }
          </div>
          <PropertyPanel/>
        </div>
      </div>
    </div>
  );
};

export default DesignerPage;
