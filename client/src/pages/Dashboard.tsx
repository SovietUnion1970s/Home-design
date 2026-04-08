import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Home, 
  Layout, 
  Box, 
  Sparkles, 
  LogOut, 
  Plus, 
  Clock, 
  Grid3X3, 
  ChevronRight,
  Monitor,
  CheckCircle2,
  TrendingUp,
  FileText,
  Star
} from 'lucide-react';
import { useDesignStore } from '../store/designStore';
import { useAuthStore } from '../store/authStore';
import samplesData from '../data/samples.json';

type Role = 'HOMEOWNER' | 'CONTRACTOR' | 'VENDOR' | 'ADMIN';

const NAV_ITEMS = [
  { icon: <Home size={18} />, label: 'Tổng quan', active: true, path: '/dashboard' },
  { icon: <Layout size={18} />, label: 'Dự án của tôi', active: false, path: '/dashboard' },
  { icon: <Box size={18} />, label: 'Thư viện mẫu', active: false, path: '/dashboard' },
  { icon: <Sparkles size={18} />, label: 'AI Designer', active: false, path: '/dashboard' },
];

const FloorPlanPreview: React.FC<{ walls: any[] }> = ({ walls }) => {
  if (!walls || walls.length === 0) return <div style={{ fontSize: 10, color: 'var(--text-4)' }}>No walls</div>;
  const strokeColor = '#a855f7';
  return (
    <svg viewBox="0 0 10 10" style={{ position: 'absolute', inset: 10, width: 'calc(100% - 20px)', height: 'calc(100% - 20px)' }}>
      {walls.map((w, i) => (
        <line key={i} x1={w.start.x} y1={w.start.y} x2={w.end.x} y2={w.end.y}
          stroke={strokeColor} strokeWidth="0.2" strokeLinecap="round" opacity={0.6} />
      ))}
    </svg>
  );
};

/* ─── Role-specific widgets ─── */
const RoleWidgets: React.FC<{ role: Role; projectCount: number }> = ({ role, projectCount }) => {
  const widgets = role === 'CONTRACTOR' ? [
    { label: 'Dự án chờ báo giá', value: '5', icon: <FileText size={20} />, color: 'var(--amber)' },
    { label: 'Đang thi công', value: '3', icon: <Plus size={20} />, color: 'var(--teal)' },
    { label: 'Doanh thu tháng', value: '45M₫', icon: <TrendingUp size={20} />, color: 'var(--emerald)' },
    { label: 'Đánh giá TB', value: '4.8', icon: <Star size={20} />, color: 'var(--purple)' },
  ] : [
    { label: 'Dự án của tôi', value: projectCount.toString(), icon: <Layout size={20} />, color: 'var(--purple)' },
    { label: 'Phong cách', value: 'Hàn Quốc', icon: <CheckCircle2 size={20} />, color: 'var(--teal)' },
    { label: 'Ngân sách ước tính', value: '~2.4M₫', icon: <TrendingUp size={20} />, color: 'var(--amber)' },
    { label: 'Gợi ý từ AI', value: '12', icon: <Sparkles size={20} />, color: 'var(--emerald)' },
  ];

  return (
    <div className="widget-grid">
      {widgets.map(w => (
        <div key={w.label} className="widget">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span style={{ color: w.color }}>{w.icon}</span>
            <span className="widget-title" style={{ margin: 0 }}>{w.label}</span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: w.color }}>{w.value}</div>
        </div>
      ))}
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { user, logout, token } = useAuthStore();
  const { clearAll, loadProjectFromServer, loadTemplate } = useDesignStore();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    const fetchProjects = async () => {
      if (!token) return;
      try {
        const { data } = await axios.get(`${API_URL}/projects`);
        if (data.success) {
          setProjects(data.projects);
        }
      } catch (err) {
        console.error('Failed to fetch projects:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, [token, API_URL]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleOpenProject = async (id: string) => {
    await loadProjectFromServer(id);
    navigate('/designer');
  };

  const handleLoadTemplate = (template: any) => {
    loadTemplate(template);
    navigate('/designer');
  };

  return (
    <div className="db-layout">
      {/* ─── Left Nav ─── */}
      <nav className="db-nav">
        <div className="db-nav-logo">
          <div className="db-logo-mark">🏠</div>
          <span style={{
            background: 'linear-gradient(135deg, #fff, rgba(255,255,255,0.4))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>
            AI Designer
          </span>
        </div>

        <div className="db-nav-body">
          <div className="db-nav-label">Chính</div>
          {NAV_ITEMS.map(item => (
            <div key={item.label} className={`db-nav-item ${item.active ? 'active' : ''}`}>
              <span className="db-nav-icon">{item.icon}</span>
              {item.label}
            </div>
          ))}
          <div className="db-nav-label" style={{ marginTop: 24 }}>Tài khoản</div>
          <div className="db-nav-item" onClick={handleLogout} style={{ cursor: 'pointer', color: '#fb7185' }}>
            <span className="db-nav-icon"><LogOut size={18} /></span>
            Đăng xuất
          </div>
        </div>

        <div className="db-nav-footer">
          <div className="db-user-card">
            <div className="db-avatar" style={{ background: 'linear-gradient(135deg, var(--purple), var(--teal))' }}>
              {user?.email[0].toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email.split('@')[0]}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{user?.role}</div>
            </div>
          </div>
        </div>
      </nav>

      {/* ─── Main Content ─── */}
      <div className="db-main">
        <header className="db-header">
          <div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>Chào buổi sáng, {user?.email.split('@')[0]} 👋</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>Hãy kiến tạo ngôi nhà mơ ước của bạn.</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link to="/designer" onClick={() => clearAll()} className="btn btn-primary" style={{ height: 40 }}>
              <Plus size={18} style={{ marginRight: 8 }} /> Tạo dự án mới
            </Link>
          </div>
        </header>

        <div className="db-body">
          {/* AI Feature Highlight */}
          <div className="ai-banner">
            <div className="ai-banner-content">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span className="badge badge-purple">Mới</span>
                <span className="badge badge-teal"><Sparkles size={10} style={{ marginRight: 4 }} /> AI-Powered</span>
              </div>
              <h2 className="ai-banner-title">Kiến trúc sư AI đã sẵn sàng</h2>
              <p className="ai-banner-sub">
                Tự động tối ưu hóa diện tích mặt bằng và gợi ý vật liệu PBR 4K chỉ với một nút bấm.
              </p>
              <Link to="/designer" className="btn btn-teal" style={{ marginTop: 16 }}>
                Dùng thử AI Designer <ChevronRight size={14} style={{ marginLeft: 6 }} />
              </Link>
            </div>
            <div className="ai-banner-emoji" style={{ opacity: 0.2 }}>🪄</div>
          </div>

          {/* Stats Overview */}
          <section style={{ marginBottom: 40 }}>
            <div className="section-row"><div className="section-title">Tổng quan hoạt động</div></div>
            <RoleWidgets role={user?.role as Role} projectCount={projects.length} />
          </section>

          {/* House Templates Section */}
          <section style={{ marginBottom: 40 }}>
            <div className="section-row">
              <div className="section-title">Gợi ý mẫu nhà</div>
              <Link to="/designer" className="btn btn-ghost" style={{ fontSize: 12 }}>Xem tất cả <ChevronRight size={12} /></Link>
            </div>
            <div className="project-grid">
               {samplesData.samples.map(sample => (
                 <div key={sample.id} className="proj-card template-card" onClick={() => handleLoadTemplate(sample)}>
                    <div className="proj-card-thumb" style={{ background: 'var(--bg-surface-2)' }}>
                       <img src={sample.thumbnail} alt={sample.name} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} />
                       <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(4,4,13,0.8), transparent)' }} />
                       <div className="badge badge-purple" style={{ position: 'absolute', top: 12, left: 12 }}>Template</div>
                    </div>
                    <div className="proj-card-body">
                       <div className="proj-card-name" style={{ fontSize: 13 }}>{sample.name}</div>
                       <div style={{ fontSize: 11, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Grid3X3 size={10} /> {sample.designData.walls.length} Tường • {sample.designData.furniture.length} Nội thất
                       </div>
                    </div>
                 </div>
               ))}
            </div>
          </section>

          {/* User Projects Section */}
          <section>
            <div className="section-row">
              <div className="section-title">Dự án của bạn</div>
              <div className="badge badge-purple">{projects.length} dự án</div>
            </div>

            {isLoading ? (
              <div className="loading-state" style={{ padding: '60px 0' }}>
                <span className="spin" style={{ display: 'inline-block', fontSize: 28, color: 'var(--purple)' }}>↻</span>
                <div style={{ marginTop: 12, color: 'var(--text-3)' }}>Đang đồng bộ dữ liệu...</div>
              </div>
            ) : projects.length === 0 ? (
              <div className="empty-state">
                <div style={{ fontSize: 40, marginBottom: 16 }}>📐</div>
                <h3 style={{ fontWeight: 600, marginBottom: 8 }}>Chưa có dự án nào</h3>
                <p style={{ fontSize: 13, color: 'var(--text-4)', marginBottom: 24, maxWidth: 300, margin: '0 auto 24px' }}>
                  Bắt đầu thiết kế hoặc chọn một mẫu nhà có sẵn để khởi động ý tưởng của bạn.
                </p>
                <Link to="/designer" onClick={() => clearAll()} className="btn btn-primary">Tạo dự án mới</Link>
              </div>
            ) : (
              <div className="project-grid">
                {projects.map(p => (
                  <div key={p.id} className="proj-card pointer" onClick={() => handleOpenProject(p.id)}>
                    <div className="proj-card-thumb">
                      <div className="proj-thumb-grid" />
                      <FloorPlanPreview walls={p.designData?.walls || []} />
                      <div className="badge badge-teal" style={{ position: 'absolute', top: 12, right: 12 }}>Dự án</div>
                    </div>
                    <div className="proj-card-body">
                      <div className="proj-card-name">{p.name || 'Dự án không tên'}</div>
                      <div className="proj-card-date">
                        <Clock size={10} style={{ marginRight: 4 }} />
                        {new Date(p.updatedAt).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

