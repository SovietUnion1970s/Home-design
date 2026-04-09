import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getOAuthUrl, useAuthStore } from '../store/authStore';
import { Logo } from '../components/Logo';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      navigate('/dashboard');
    }
  };

  const handleGoogle = () => { window.location.href = getOAuthUrl('google'); };

  return (
    <div className="auth-page">
      <div className="auth-side-image" style={{ backgroundImage: `url('/images/luxury_bedroom_1775672761947.png')`, backgroundSize: 'cover' }}>
        <div className="auth-side-overlay">
          <Link to="/" className="btn btn-ghost" style={{ position: 'absolute', top: 40, left: 40, background: 'rgba(255,255,255,0.9)' }}>
            <ArrowLeft size={16} /> Quay lại trang chủ
          </Link>
          <div style={{ maxWidth: 400 }}>
            <div style={{ marginBottom: 20 }}><Logo size={48} lightTheme={false} /></div>
            <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16, lineHeight: 1.2, color: '#0f172a' }}>
              Kiến tạo không gian <br /> <span style={{ color: 'var(--purple-dark)' }}>sống thông minh.</span>
            </h2>
            <p style={{ color: '#334155', lineHeight: 1.6, fontSize: 16, fontWeight: 500 }}>
              Tham gia cùng +10,000 kiến trúc sư và đối tác.
            </p>
          </div>
        </div>
      </div>

      <div className="auth-container">
        <div className="auth-form-card">
          <div style={{ marginBottom: 32, textAlign: 'center' }}>
             <Logo size={40} showText={false} lightTheme={true} />
             <h1 style={{ fontSize: 26, fontWeight: 800, marginTop: 16, marginBottom: 8, color: 'var(--text-1)' }}>Đăng nhập</h1>
             <p style={{ fontSize: 14, color: 'var(--text-3)' }}>Truy cập không gian làm việc của bạn.</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {error && <div style={{ color: '#ef4444', fontSize: 13, background: '#fef2f2', padding: 10, borderRadius: 8, textAlign: 'center' }}>{error}</div>}
            
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: 'var(--text-2)' }}>Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                placeholder="name@company.com"
                style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--border-light)', background: 'var(--bg-1)', color: 'var(--text-1)', fontSize: 14, outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: 'var(--text-2)' }}>Mật khẩu</label>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                placeholder="••••••••"
                style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--border-light)', background: 'var(--bg-1)', color: 'var(--text-1)', fontSize: 14, outline: 'none' }}
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={isLoading}
              style={{ width: '100%', height: 48, fontSize: 16, marginTop: 8 }}
            >
              {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border-light)' }} />
            <div style={{ padding: '0 12px', fontSize: 13, color: 'var(--text-3)' }}>Hoặc</div>
            <div style={{ flex: 1, height: 1, background: 'var(--border-light)' }} />
          </div>

          <button 
            type="button"
            className="btn btn-ghost" 
            onClick={handleGoogle} 
            style={{ width: '100%', height: 48, fontSize: 15, display: 'flex', gap: 12, justifyContent: 'center', border: '1px solid var(--border-light)', color: 'var(--text-1)' }}
          >
            <img src="https://www.svgrepo.com/show/355037/google.svg" alt="Google" style={{ width: 20 }} /> 
            Đăng nhập với Google
          </button>

          <div style={{ textAlign: 'center', marginTop: 32, fontSize: 14, color: 'var(--text-3)' }}>
            Chưa có tài khoản? <Link to="/register" style={{ color: 'var(--purple-dark)', fontWeight: 600 }}>Tạo mới ngay</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
