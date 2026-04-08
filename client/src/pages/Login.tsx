import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  LogIn, 
  Mail, 
  Lock, 
  ArrowLeft,
  Loader2
} from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, user, clearError } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await login(email, password);
    if (ok) navigate('/dashboard');
  };

  return (
    <div className="auth-page">
      {/* Left Side: Visual/Branding */}
      <div className="auth-side-image" style={{ backgroundImage: `url('/modern_studio_3d_render_1775626129515.png')`, backgroundSize: 'cover' }}>
        <div className="auth-side-overlay">
          <Link to="/" className="btn btn-ghost" style={{ position: 'absolute', top: 40, left: 40 }}>
            <ArrowLeft size={16} style={{ marginRight: 8 }} /> Quay lại trang chủ
          </Link>
          <div style={{ maxWidth: 400 }}>
            <div className="db-logo-mark" style={{ width: 44, height: 44, fontSize: 20, marginBottom: 20 }}>🏠</div>
            <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 16, lineHeight: 1.2 }}>
              Kiến tạo không gian sống <br /><span>từ mọi góc nhìn.</span>
            </h2>
            <p style={{ color: 'var(--text-2)', lineHeight: 1.6 }}>
              Tham gia cùng +10,000 kiến trúc sư và chủ nhà đang sử dụng HomeDesign AI để hiện thực hóa bản vẽ 3D.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="auth-container">
        <div className="auth-form-card">
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Chào mừng trở lại</h1>
            <p style={{ fontSize: 14, color: 'var(--text-3)' }}>Đăng nhập để tiếp tục các dự án còn dang dở.</p>
          </div>

          {/* Social Auth Buttons */}
          <button className="social-btn">
            <img src="https://www.svgrepo.com/show/355037/google.svg" alt="Google" style={{ width: 18 }} />
            Tiếp tục với Google
          </button>
          <button className="social-btn">
            <img src="https://www.svgrepo.com/show/303114/facebook-3.svg" alt="FB" style={{ width: 18 }} />
            Tiếp tục với Facebook
          </button>

          <div className="social-divider">Hoặc dùng Email</div>

          {/* Error Message */}
          {error && (
            <div className="badge badge-rose" style={{ width: '100%', padding: '10px 14px', borderRadius: 10, marginBottom: 20, justifyContent: 'flex-start' }}>
              ⚠️ {error}
              <button onClick={clearError} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>×</button>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="prop-row" style={{ marginBottom: 16 }}>
              <label className="prop-label">ĐỊA CHỈ EMAIL</label>
              <div style={{ position: 'relative' }}>
                <Mail size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                <input
                  className="input"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  style={{ paddingLeft: 38, width: '100%' }}
                />
              </div>
            </div>

            <div className="prop-row" style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <label className="prop-label">MẬT KHẨU</label>
                 <Link to="/" style={{ fontSize: 11, color: 'var(--purple)' }}>Quên mật khẩu?</Link>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                <input
                  className="input"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  style={{ paddingLeft: 38, width: '100%' }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
              style={{ width: '100%', height: 44, fontSize: 15 }}
            >
              {isLoading ? <Loader2 className="spin" size={18} /> : (
                <>
                  <LogIn size={18} style={{ marginRight: 8 }} /> Đăng nhập
                </>
              )}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'var(--text-3)' }}>
            Chưa có tài khoản?{' '}
            <Link to="/register" style={{ color: 'var(--purple)', fontWeight: 600 }}>
              Đăng ký ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

