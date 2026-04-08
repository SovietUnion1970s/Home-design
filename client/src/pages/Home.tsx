import React from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Pagination } from 'swiper/modules';

import {
  ArrowRight,
  Layout,
  Box,
  BarChart3,
  ShieldCheck,
  Zap,
  Compass
} from 'lucide-react';
import { Github } from '../components/icons';

// @ts-ignore
import 'swiper/css';
// @ts-ignore
import 'swiper/css/effect-fade';
// @ts-ignore
import 'swiper/css/pagination';

// Reusable Navbar - Đã fix z-index cực cao để không bị đè
const Navbar: React.FC = () => (
  <nav className="navbar" style={{ zIndex: 9999, position: 'fixed' }}>
    <Link to="/" className="nav-logo">
      <div className="db-logo-mark">🏠</div>
      <span>HomeDesign AI</span>
    </Link>

    <div className="nav-menu">
      <a href="#features" className="nav-link">Tính năng</a>
      <a href="#templates" className="nav-link">Mẫu thiết kế</a>
      <a href="#pricing" className="nav-link">Bảng giá</a>
    </div>

    <div className="nav-actions">
      <Link to="/login" className="btn btn-ghost">Đăng nhập</Link>
      <Link to="/register" className="btn btn-primary">Bắt đầu miễn phí</Link>
    </div>
  </nav>
);

const FEATURES = [
  {
    icon: <Layout className="w-6 h-6" />,
    color: 'rgba(168,85,247,0.15)',
    title: 'Mặt bằng 2D Chuẩn',
    desc: 'Phác thảo tường với độ chính xác cao. Hệ thống tỷ lệ 1:1 chuyên nghiệp.'
  },
  {
    icon: <Box className="w-6 h-6" />,
    color: 'rgba(45,212,191,0.12)',
    title: 'Phối cảnh 3D Real-time',
    desc: 'Chuyển đổi tức thì từ 2D sang 3D với vật liệu PBR chân thực.'
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    color: 'rgba(245,158,11,0.12)',
    title: 'Dự toán Thông minh',
    desc: 'Tự động tính toán khối lượng gạch, sơn và diện tích thi công.'
  },
];

const Home: React.FC = () => {
  return (
    <div className="home-wrap">
      <Navbar />

      {/* Hero Section */}
      <section className="hero-slider" style={{ zIndex: 1, position: 'relative' }}>
        <Swiper
          modules={[Autoplay, EffectFade, Pagination]}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true, zIndex: 50 }}
          loop
          className="mySwiper"
        >
          {/* Slide 1 */}
          <SwiperSlide>
            <div
              className="hero-slide-bg"
              style={{ backgroundImage: `url('https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=1920&auto=format&fit=crop')` }}
            />
            <div className="hero-overlay">
              <div className="home-eyebrow">✦ &nbsp; AI-Powered 3D Home Designer</div>
              {/* Fix lỗi đè chữ bằng line-height */}
              <h1 className="home-title" style={{ lineHeight: '1.25', paddingBottom: '10px' }}>
                Thiết kế căn hộ<br /><span>trong tầm tay</span>
              </h1>
              <p className="home-sub">Kết hợp sức mạnh AI để tạo nên không gian sống tối ưu và hiện đại nhất.</p>
              {/* Fix lỗi nút bấm bằng z-index */}
              <div className="home-cta" style={{ position: 'relative', zIndex: 50 }}>
                <Link to="/designer" className="btn btn-primary pulse-glow" style={{ padding: '14px 32px', fontSize: 16 }}>
                  Bắt đầu thiết kế ngay <ArrowRight size={18} style={{ marginLeft: 8 }} />
                </Link>
              </div>
            </div>
          </SwiperSlide>

          {/* Slide 2 */}
          <SwiperSlide>
            <div
              className="hero-slide-bg"
              style={{ backgroundImage: `url('https://images.unsplash.com/photo-1618220179428-22790b46a0eb?q=80&w=1920&auto=format&fit=crop')` }}
            />
            <div className="hero-overlay">
              <div className="home-eyebrow">✦ &nbsp; High Fidelity PBR Rendering</div>
              <h1 className="home-title" style={{ lineHeight: '1.25', paddingBottom: '10px' }}>
                Vật liệu 3D<br /><span>Chân thực</span>
              </h1>
              <p className="home-sub">Mô phỏng chính xác ánh sáng và chất liệu gỗ, đá, vải theo chuẩn Coohom.</p>
              <div className="home-cta" style={{ position: 'relative', zIndex: 50 }}>
                <Link to="/register" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: 16 }}>
                  Khám phá thư viện
                </Link>
              </div>
            </div>
          </SwiperSlide>

          {/* Slide 3 */}
          <SwiperSlide>
            <div
              className="hero-slide-bg"
              style={{ backgroundImage: `url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1920&auto=format&fit=crop')` }}
            />
            <div className="hero-overlay">
              <div className="home-eyebrow">✦ &nbsp; Smart Layout AI</div>
              <h1 className="home-title" style={{ lineHeight: '1.25', paddingBottom: '10px' }}>
                Tự động hóa<br /><span>Bố cục</span>
              </h1>
              <p className="home-sub">AI gợi ý vị trí đặt nội thất tối ưu diện tích và chuẩn phong thủy.</p>
              <div className="home-cta" style={{ position: 'relative', zIndex: 50 }}>
                <Link to="/designer" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: 16 }}>
                  Dùng thử AI Assistant
                </Link>
              </div>
            </div>
          </SwiperSlide>
        </Swiper>
      </section>

      {/* Main Page Content */}
      <main className="home-content">
        <div id="features" className="home-features" style={{ marginTop: 0 }}>
          {FEATURES.map((f, i) => (
            <div key={i} className="feat-card">
              <div className="feat-icon" style={{ background: f.color }}>{f.icon}</div>
              <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>{f.title}</div>
              <div style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>

        {/* Floating Mockup */}
        <div className="home-mockup" style={{ marginTop: 80, marginBottom: 100 }}>
          <div className="home-mockup-bar">
            <div className="home-mockup-dot" style={{ background: '#ef4444' }} />
            <div className="home-mockup-dot" style={{ background: '#f59e0b' }} />
            <div className="home-mockup-dot" style={{ background: '#10b981' }} />
            <div style={{ flex: 1 }} />
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', fontWeight: 500 }}>
              HOMEDESIGN.AI — CLOUD EDITOR
            </div>
            <div style={{ flex: 1 }} />
          </div>
          <div className="home-mockup-inner" style={{ height: 480, position: 'relative' }}>
            {/* Đã thay link ảnh lỗi bằng link ảnh mockup thực tế */}
            <img
              src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=800&auto=format&fit=crop"
              alt="Editor Preview"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(4,4,13,0.9) 0%, transparent 70%)' }} />
            <div style={{ position: 'absolute', top: 40, left: 40, maxWidth: 300, textAlign: 'left', zIndex: 10 }}>
              <div className="badge badge-purple" style={{ marginBottom: 12 }}>Live Editor</div>
              <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 10, lineHeight: 1.3 }}>Interface chuẩn Minimalist</h3>
              <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.5 }}>
                Giao diện tập trung vào trải nghiệm người dùng, giúp bạn không bị xao nhãng khi sáng tạo.
              </p>
            </div>
          </div>
        </div>

        {/* Trust Tokens */}
        <div style={{ fontSize: 13, color: 'var(--text-3)', display: 'flex', gap: 32, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Zap size={14} className="text-purple" /> Không cần cài đặt
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <ShieldCheck size={14} className="text-teal" /> Bảo mật đám mây
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Compass size={14} className="text-amber" /> Chuẩn Phong Thủy AI
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ padding: '60px 40px', background: 'var(--bg-1)', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 40, marginBottom: 30 }}>
          <Link to="/" className="nav-logo">🏠 HomeDesign AI</Link>
          <div style={{ display: 'flex', gap: 20, color: 'var(--text-2)', fontSize: 14 }}>
            <span>Privacy</span>
            <span>Terms</span>
            <span>Contact</span>
          </div>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-4)' }}>© 2026 HomeDesign. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;