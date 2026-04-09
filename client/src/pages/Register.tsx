import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowLeft } from 'lucide-react';
import { getOAuthUrl, useAuthStore } from '../store/authStore';
import { Logo } from '../components/Logo';

const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await register(email, password, name);
    if (success) {
      navigate('/dashboard');
    }
  };
  return (
    <div className="auth-page">
      {/* Left Decoration */}
      <div className="auth-side-image" style={{ backgroundImage: `url('/images/minimalist_office_1775672743990.png')`, backgroundSize: 'cover' }}>
        <div className="auth-side-overlay">
          <Link to="/" className="btn btn-ghost" style={{ position: 'absolute', top: 40, left: 40, background: 'rgba(255,255,255,0.9)' }}>
            <ArrowLeft size={16} /> Quay lại
          </Link>
          <div style={{ maxWidth: 420 }}>
            <div style={{ marginBottom: 20, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>
               <Logo size={48} lightTheme={false} />
            </div>
            <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16, lineHeight: 1.2, color: '#0f172a' }}>
              Khởi đầu hành trình <br /><span style={{ color: 'var(--purple-dark)' }}>kết tạo không gian.</span>
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 32 }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#334155', fontSize: 15, fontWeight: 500 }}>
                  <CheckCircle2 size={18} className="text-teal" /> Miễn phí sử dụng trình kéo thả 3D
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#334155', fontSize: 15, fontWeight: 500 }}>
                  <CheckCircle2 size={18} className="text-teal" /> Hệ thống tính dự toán gạch sơn tự động
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Form */}
      <div className="auth-container">
        <div className="auth-form-card">
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8, color: 'var(--text-1)' }}>Tạo tài khoản mới</h1>
            <p style={{ fontSize: 14, color: 'var(--text-3)' }}>Bắt đầu thiết kế ngôi nhà mơ ước của bạn ngay.</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {error && <div style={{ color: '#ef4444', fontSize: 13, background: '#fef2f2', padding: 10, borderRadius: 8, textAlign: 'center' }}>{error}</div>}
            
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: 'var(--text-2)' }}>Họ và tên</label>
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
                placeholder="Nguyễn Văn A"
                style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: '1px solid var(--border-light)', background: 'var(--bg-1)', color: 'var(--text-1)', fontSize: 14, outline: 'none' }}
              />
            </div>

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
              {isLoading ? 'Đang xử lý...' : 'Tạo tài khoản'}
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
            onClick={() => window.location.href = getOAuthUrl('google')} 
            style={{ width: '100%', height: 48, fontSize: 15, display: 'flex', gap: 12, justifyContent: 'center', border: '1px solid var(--border-light)', color: 'var(--text-1)' }}
          >
            <img src="https://www.svgrepo.com/show/355037/google.svg" alt="Google" style={{ width: 20 }} />
            Đăng ký với Google
          </button>

          <div style={{ textAlign: 'center', marginTop: 32, fontSize: 14, color: 'var(--text-3)' }}>
            Đã có tài khoản? <Link to="/login" style={{ color: 'var(--purple-dark)', fontWeight: 600 }}>Đăng nhập ngay</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
