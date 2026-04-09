import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Home, Layout, Box, Sparkles, LogOut, Plus, Clock, Grid3X3, 
  ChevronRight, CheckCircle2, TrendingUp, FileText, Star, Trash2
} from 'lucide-react';
import { useDesignStore } from '../store/designStore';
import { useAuthStore } from '../store/authStore';
import samplesData from '../data/samples.json';
import toast from 'react-hot-toast';
import AIPanel from '../components/AIPanel';
import { Logo } from '../components/Logo';
import { UserProfileMenu } from '../components/UserProfileMenu';

type Role = 'HOMEOWNER' | 'CONTRACTOR' | 'VENDOR' | 'ADMIN';

const NAV_ITEMS = [
  { id: 'overview', icon: <Home size={18} />, label: 'Tổng quan' },
  { id: 'projects', icon: <Layout size={18} />, label: 'Dự án của tôi' },
  { id: 'templates', icon: <Box size={18} />, label: 'Thư viện mẫu' },
  { id: 'ai', icon: <Sparkles size={18} />, label: 'AI Designer' },
];

const FloorPlanPreview: React.FC<{ walls: any[] }> = ({ walls }) => {
  if (!walls || walls.length === 0) return <div style={{ fontSize: 10, color: 'var(--text-4)' }}>No walls</div>;
  const strokeColor = '#a855f7';
  return (
    <svg viewBox="0 0 10 10" style={{ position: 'absolute', inset: 10, width: 'calc(100% - 20px)', height: 'calc(100% - 20px)' }}>
      {walls.map((w, i) => (
        <line key={i} x1={w.start.x} y1={w.start.y} x2={w.end.x} y2={w.end.y} stroke={strokeColor} strokeWidth="0.2" strokeLinecap="round" opacity={0.6} />
      ))}
    </svg>
  );
};

const RoleWidgets: React.FC<{ role: Role; projectCount: number }> = ({ role, projectCount }) => {
  const widgets = role === 'CONTRACTOR' ? [
    { label: 'Dự án chờ báo giá', value: '5', icon: <FileText size={20} />, color: 'var(--amber)' },
    { label: 'Đang thi công', value: '3', icon: <Plus size={20} />, color: 'var(--teal)' },
    { label: 'Doanh thu tháng', value: '45M₫', icon: <TrendingUp size={20} />, color: 'var(--emerald)' },
    { label: 'Đánh giá TB', value: '4.8', icon: <Star size={20} />, color: 'var(--purple)' },
  ] : [
    { label: 'Dự án của tôi', value: projectCount.toString(), icon: <Layout size={20} />, color: 'var(--purple)' },
    { label: 'Phong cách', value: 'Hiện đại', icon: <CheckCircle2 size={20} />, color: 'var(--teal)' },
    { label: 'Ngân sách ước tính', value: '~150M₫', icon: <TrendingUp size={20} />, color: 'var(--amber)' },
    { label: 'Gợi ý từ AI', value: '18', icon: <Sparkles size={20} />, color: 'var(--emerald)' },
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
  const { clearAll, loadProjectFromServer, loadTemplate, deleteProjectFromServer } = useDesignStore();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const fetchProjects = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/projects`);
      if (data.success) setProjects(data.projects);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, [token, API_URL]);

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Bạn có chắc chắn muốn xóa dự án này?')) return;
    const ok = await deleteProjectFromServer(id);
    if (ok) {
      setProjects(projects.filter(p => p.id !== id));
      toast.success('Đã xóa dự án thành công!', { style: { background: '#10b981', color: '#fff' } });
    }
  };

  const renderContent = () => {
    if (activeTab === 'overview') {
      return (
        <div className="fade-in">
          <div id="db-ai-banner" className="ai-banner" style={{ marginBottom: 30 }}>
            <div className="ai-banner-content">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span className="badge badge-purple">Mới</span>
                <span className="badge badge-teal"><Sparkles size={10} style={{ marginRight: 4 }} /> AI-Powered</span>
              </div>
              <h2 className="ai-banner-title">Kiến trúc sư AI đã sẵn sàng</h2>
              <p className="ai-banner-sub">Tự động tối ưu hóa diện tích mặt bằng và gợi ý vật liệu PBR 4K chỉ với một nút bấm.</p>
              <button onClick={() => setActiveTab('ai')} className="btn btn-teal" style={{ marginTop: 16 }}>
                Dùng thử AI Designer <ChevronRight size={14} style={{ marginLeft: 6 }} />
              </button>
            </div>
            <div className="ai-banner-emoji" style={{ opacity: 0.2 }}>🪄</div>
          </div>

          <section style={{ marginBottom: 40 }}>
            <div className="section-row"><div className="section-title">Tổng quan hoạt động</div></div>
            <RoleWidgets role={user?.role as Role} projectCount={projects.length} />
          </section>

          <section style={{ marginBottom: 40 }}>
            <div className="section-row">
              <div className="section-title">Gợi ý mẫu nhà</div>
              <button onClick={() => setActiveTab('templates')} className="btn btn-ghost" style={{ fontSize: 12 }}>Xem tất cả <ChevronRight size={12} /></button>
            </div>
            <div className="project-grid">
               {samplesData.samples.slice(0, 3).map(sample => (
                 <div key={sample.id} className="proj-card template-card" onClick={() => { loadTemplate(sample.designData as any); navigate('/designer'); }}>
                    <div className="proj-card-thumb" style={{ background: 'var(--bg-surface-2)' }}>
                       <img src={sample.thumbnail} alt={sample.name} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} />
                       <div className="badge badge-purple" style={{ position: 'absolute', top: 12, left: 12 }}>Template</div>
                    </div>
                    <div className="proj-card-body">
                       <div className="proj-card-name" style={{ fontSize: 13 }}>{sample.name}</div>
                    </div>
                 </div>
               ))}
            </div>
          </section>
        </div>
      );
    }

    if (activeTab === 'projects') {
      return (
        <div className="fade-in" style={{ minHeight: 400 }}>
          <div className="section-row" style={{ marginBottom: 24 }}>
            <div className="section-title">Dự án của bạn ({projects.length})</div>
          </div>
          {isLoading ? (
            <div className="loading-state" style={{ padding: '60px 0' }}><span className="spin" style={{ display: 'inline-block', fontSize: 28, color: 'var(--purple)' }}>↻</span></div>
          ) : projects.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: 40, marginBottom: 16 }}>📐</div>
              <h3 style={{ fontWeight: 600, marginBottom: 8 }}>Chưa có dự án nào</h3>
              <button onClick={() => { clearAll(); navigate('/designer'); }} className="btn btn-primary">Tạo dự án mới</button>
            </div>
          ) : (
            <div className="project-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
              {projects.map(p => (
                <div key={p.id} className="proj-card pointer" onClick={() => { loadProjectFromServer(p.id); navigate('/designer'); }}>
                  <div className="proj-card-thumb">
                    <div className="proj-thumb-grid" />
                    <FloorPlanPreview walls={p.designData?.walls || []} />
                    <div className="badge badge-teal" style={{ position: 'absolute', top: 12, right: 12 }}>Dự án</div>
                  </div>
                  <div className="proj-card-body" style={{ position: 'relative' }}>
                    <div className="proj-card-name">{p.name || 'Dự án không tên'}</div>
                    <div className="proj-card-date">
                      <Clock size={10} style={{ marginRight: 4 }} />
                      {new Date(p.updatedAt).toLocaleDateString('vi-VN')}
                    </div>
                    <button 
                      onClick={(e) => handleDeleteProject(p.id, e)} 
                      className="btn btn-ghost" 
                      style={{ position: 'absolute', right: 8, bottom: 8, padding: 8, color: '#fb7185' }}
                      title="Xoá dự án"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (activeTab === 'templates') {
      return (
        <div className="fade-in" style={{ minHeight: 400 }}>
          <div className="section-row" style={{ marginBottom: 24 }}>
            <div className="section-title">Thư viện mẫu thiết kế</div>
          </div>
          <div className="project-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {samplesData.samples.map(sample => (
              <div key={sample.id} className="proj-card template-card" onClick={() => { loadTemplate(sample.designData as any); navigate('/designer'); }}>
                <div className="proj-card-thumb" style={{ background: 'var(--bg-surface-2)', height: 200 }}>
                  <img src={sample.thumbnail} alt={sample.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }} />
                  <div className="badge" style={{ position: 'absolute', top: 12, left: 12, background: sample.thumbColor, color: '#fff' }}>Template</div>
                </div>
                <div className="proj-card-body" style={{ padding: 20 }}>
                  <div className="proj-card-name" style={{ fontSize: 16, marginBottom: 8 }}>{sample.name}</div>
                  <p style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.5, marginBottom: 12 }}>{sample.description}</p>
                  <div style={{ fontSize: 11, color: 'var(--teal)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Grid3X3 size={12} /> {sample.designData.walls.length} Tường • {sample.designData.furniture.length} Nội thất
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (activeTab === 'ai') {
      return (
        <div className="fade-in" style={{ minHeight: 'calc(100vh - 120px)' }}>
          <div className="section-row" style={{ marginBottom: 24 }}>
            <div className="section-title">AI Designer Chatbot</div>
          </div>
          <div style={{ flex: 1, background: 'var(--bg-1)', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
            <AIPanel />
          </div>
        </div>
      );
    }
  };

  return (
    <div className="db-layout">
      <nav className="db-nav">
        <div className="db-nav-logo">
          <Logo size={24} />
        </div>

        <div className="db-nav-body">
          <div className="db-nav-label">Công cụ</div>
          {NAV_ITEMS.map(item => (
            <div 
              key={item.id} 
              className={`db-nav-item ${activeTab === item.id ? 'active' : ''}`} 
              onClick={() => setActiveTab(item.id)}
            >
              <span className="db-nav-icon">{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>

        <div className="db-nav-footer" style={{ display: 'flex', justifyContent: 'center' }}>
          <UserProfileMenu />
        </div>
      </nav>

      {/* ─── Main Content ─── */}
      <div className="db-main" style={{ display: 'flex', flexDirection: 'column' }}>
        <header className="db-header">
          <div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>Chào buổi sáng, {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.email.split('@')[0]} 👋</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>Hãy kiến tạo ngôi nhà mơ ước của bạn.</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link to="/designer" onClick={() => clearAll()} className="btn btn-primary" style={{ height: 40 }}>
              <Plus size={18} style={{ marginRight: 8 }} /> Tạo dự án mới
            </Link>
          </div>
        </header>

        <div className="db-body" style={{ flex: 1 }}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
