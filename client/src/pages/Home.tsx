import React from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Pagination } from 'swiper/modules';

// Import Icon - Đã sửa lại tên Github chuẩn
import { 
  ArrowRight, 
  Layout, 
  Box, 
  BarChart3, 
  ShieldCheck, 
  Zap, 
  Compass,
  ChevronRight
} from 'lucide-react';
import { Logo } from '../components/Logo';


// Import CSS Swiper - Thêm dòng ignore để dập tắt vạch đỏ TypeScript
// @ts-ignore
import 'swiper/css';
// @ts-ignore
import 'swiper/css/effect-fade';
// @ts-ignore
import 'swiper/css/pagination';

// Reusable Navbar
const Navbar: React.FC = () => (
  <nav className="navbar">
    <div className="nav-logo">
      <Logo size={28} />
    </div>
    
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
      
      {/* Hero Section with Slider */}
      <section className="hero-slider">
        <Swiper
          modules={[Autoplay, EffectFade, Pagination]}
          effect="fade"
          autoplay={{ delay: 5000 }}
          pagination={{ clickable: true }}
          loop
          className="mySwiper"
          style={{ width: '100%', height: '100%' }}
        >
          <SwiperSlide>
            <div className="hero-slide-bg">
              <img src="/images/luxury_bedroom_1775672761947.png" alt="Luxury Bedroom" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div className="hero-overlay">
              <div className="home-eyebrow">✦ &nbsp; AI-Powered 3D Home Designer</div>
              <h1 className="home-title">Thiết kế căn hộ<br /><span>trong tầm tay</span></h1>
              <p className="home-sub">Kết hợp sức mạnh AI để tạo nên không gian sống tối ưu và hiện đại nhất.</p>
              <div className="home-cta">
                <Link to="/designer" className="btn btn-primary pulse-glow" style={{ padding: '14px 32px', fontSize: 16 }}>
                  Bắt đầu thiết kế ngay <ArrowRight size={18} style={{ marginLeft: 8 }} />
                </Link>
              </div>
            </div>
          </SwiperSlide>

          <SwiperSlide>
            <div className="hero-slide-bg">
              <img src="/images/modern_studio_1775672721228.png" alt="Modern Studio" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div className="hero-overlay">
              <div className="home-eyebrow">✦ &nbsp; High Fidelity PBR Rendering</div>
              <h1 className="home-title">Vật liệu 3D<br /><span>Chân thực</span></h1>
              <p className="home-sub">Mô phỏng chính xác ánh sáng và chất liệu gỗ, đá, vải theo chuẩn Coohom.</p>
              <div className="home-cta">
                <Link to="/register" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: 16 }}>
                  Khám phá thư viện
                </Link>
              </div>
            </div>
          </SwiperSlide>

          <SwiperSlide>
            <div className="hero-slide-bg">
              <img src="/images/minimalist_office_1775672743990.png" alt="Minimalist Office" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div className="hero-overlay">
              <div className="home-eyebrow">✦ &nbsp; Smart Layout AI</div>
              <h1 className="home-title">Tự động hóa<br /><span>Bố cục</span></h1>
              <p className="home-sub">AI gợi ý vị trí đặt nội thất tối ưu diện tích và chuẩn phong thủy.</p>
              <div className="home-cta">
                <Link to="/designer" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: 16 }}>
                  Dùng thử AI Assistant
                </Link>
              </div>
            </div>
          </SwiperSlide>
        </Swiper>
      </section>

      <main className="home-content">
        <div id="features" className="home-features" style={{ marginTop: -80, position: 'relative', zIndex: 10 }}>
          {FEATURES.map((f, i) => (
            <div key={i} className="feat-card">
              <div className="feat-icon" style={{ background: f.color }}>{f.icon}</div>
              <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>{f.title}</div>
              <div style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>

        {/* Floating Mockup (Revised style) */}
        <div className="home-mockup" style={{ marginTop: 40, marginBottom: 60 }}>
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
             <img 
               src="/images/luxury_bedroom_1775672761947.png" 
               alt="Editor Preview" 
               style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
             />
             <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(255,255,255,0.95) 0%, transparent 70%)' }} />
             <div style={{ position: 'absolute', top: 40, left: 40, maxWidth: 300, textAlign: 'left' }}>
                <div className="badge badge-purple" style={{ marginBottom: 12 }}>Cloud Workspace</div>
                <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 10, color: '#0f172a' }}>Giao diện Trắng Sáng</h3>
                <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6 }}>
                  Giao diện tập trung vào trải nghiệm người dùng, giúp bạn không bị xao nhãng khi sáng tạo.
                </p>
             </div>
          </div>
        </div>

        {/* Trust Tokens */}
        <div style={{ fontSize: 13, color: 'var(--text-3)', display: 'flex', gap: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 100 }}>
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

        {/* Templates Carousel */}
        <section id="templates" style={{ padding: '80px 40px', background: 'var(--bg-1)', borderTop: '1px solid var(--border)' }}>
          <div style={{ textAlign: 'center', marginBottom: 50 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: 'var(--text-1)' }}>Mẫu Thiết Kế Sẵn</h2>
            <p style={{ color: 'var(--text-2)', fontSize: 16 }}>Tuyển tập những kiệt tác nội thất để bạn tham khảo hoặc bắt đầu lập tức.</p>
          </div>
          
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={30}
            slidesPerView={1}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            autoplay={{ delay: 3000 }}
            pagination={{ clickable: true }}
            loop
            style={{ width: '100%', paddingBottom: 60 }}
          >
            {[
              { id: 1, img: '/images/media__1775672137778.png', name: 'Scandinavian Living' },
              { id: 2, img: '/images/media__1775672237949.png', name: 'Modern Minimalist' },
              { id: 3, img: '/images/media__1775672354502.png', name: 'Urban Kitchen' },
              { id: 4, img: '/images/media__1775672393167.png', name: 'Luxury Master Bedroom' },
              { id: 5, img: '/images/media__1775676221989.png', name: 'Classic Bath' },
              { id: 6, img: '/images/media__1775676259486.png', name: 'Cozy Workspace' },
              { id: 7, img: '/images/media__1775676483727.png', name: 'Industrial Loft' },
              { id: 8, img: '/images/media__1775677148594.png', name: 'Zen Garden Room' },
            ].map(tpl => (
              <SwiperSlide key={tpl.id}>
                <div style={{ borderRadius: 16, overflow: 'hidden', boxShadow: 'var(--shadow-md)', background: '#fff' }}>
                  <div style={{ height: 240, position: 'relative' }}>
                    <img src={tpl.img} alt={tpl.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ padding: 20 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{tpl.name}</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="badge badge-teal">Premium</span>
                      <Link to="/designer" style={{ color: 'var(--purple)', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                        Dùng mẫu <ChevronRight size={16} />
                      </Link>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </section>

        {/* Pricing Section */}
        <section id="pricing" style={{ padding: '100px 40px', background: 'var(--bg-0)' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: 'var(--text-1)' }}>Bảng Giá Linh Hoạt</h2>
            <p style={{ color: 'var(--text-2)', fontSize: 16 }}>Chọn gói phù hợp với nhu cầu thiết kế của bạn.</p>
          </div>
          
          <div style={{ display: 'flex', gap: 30, justifyContent: 'center', flexWrap: 'wrap', maxWidth: 1000, margin: '0 auto' }}>
            <div style={{ flex: '1 1 300px', padding: 40, border: '1px solid var(--border)', borderRadius: 24, background: 'var(--bg-surface)' }}>
              <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 10 }}>Cơ Bản</h3>
              <div style={{ fontSize: 40, fontWeight: 800, marginBottom: 20, color: 'var(--text-1)' }}>Miễn phí</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 30px 0', fontSize: 15, color: 'var(--text-2)' }}>
                <li style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}><ShieldCheck size={18} className="text-teal" /> Xem thư viện cơ bản</li>
                <li style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}><ShieldCheck size={18} className="text-teal" /> 3 thiết kế lưu trữ gốc</li>
                <li style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}><ShieldCheck size={18} className="text-teal" /> Export 2D độ phân giải thấp</li>
              </ul>
              <Link to="/register" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}>Bắt đầu ngay</Link>
            </div>

            <div style={{ flex: '1 1 300px', padding: 40, borderRadius: 24, background: 'linear-gradient(135deg, var(--bg-surface) 0%, #f3e8ff 100%)', border: '1px solid var(--border-purple)', position: 'relative', transform: 'scale(1.05)', boxShadow: 'var(--shadow-xl)' }}>
              <div style={{ position: 'absolute', top: -15, left: '50%', transform: 'translateX(-50%)', background: 'var(--purple-dark)', color: 'white', padding: '4px 16px', borderRadius: 20, fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>PHỔ BIẾN</div>
              <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 10, color: 'var(--purple)' }}>Chuyên Nghiệp</h3>
              <div style={{ fontSize: 40, fontWeight: 800, marginBottom: 20, color: 'var(--text-1)' }}>$29<span style={{ fontSize: 16, color: 'var(--text-3)' }}>/tháng</span></div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 30px 0', fontSize: 15, color: 'var(--text-1)' }}>
                <li style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}><ShieldCheck size={18} className="text-purple" /> Không giới hạn dự án</li>
                <li style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}><ShieldCheck size={18} className="text-purple" /> Truy cập 10,000+ mô hình 3D thực</li>
                <li style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}><ShieldCheck size={18} className="text-purple" /> Export hình ảnh 4K PBR</li>
                <li style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}><Zap size={18} className="text-amber" /> Sử dụng AI Assistant Gemeni</li>
              </ul>
              <Link to="/register" className="btn btn-primary pulse-glow" style={{ width: '100%', justifyContent: 'center' }}>Nâng cấp ngay</Link>
            </div>
          </div>
        </section>
      </main>

      <footer style={{ padding: '60px 40px', background: 'var(--bg-2)', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 40, marginBottom: 30 }}>
          <div className="nav-logo"><Logo size={24} /></div>
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

