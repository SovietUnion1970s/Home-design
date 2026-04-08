import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { 
  UserPlus, 
  Mail, 
  Lock, 
  User,
  ArrowLeft,
  Loader2,
  CheckCircle2
} from 'lucide-react';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const { register, isLoading, error, user, clearError } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await register(email, password, name);
    if (ok) navigate('/dashboard');
  };

  return (
    <div className="auth-page">
      {/* Left Side: Visual/Branding */}
      <div className="auth-side-image" style={{ backgroundImage: `url('/luxury_bedroom_3d_render_1775626151395.png')`, backgroundSize: 'cover' }}>
        <div className="auth-side-overlay">
          <Link to="/" className="btn btn-ghost" style={{ position: 'absolute', top: 40, left: 40 }}>
            <ArrowLeft size={16} style={{ marginRight: 8 }} /> Quay lại trang chủ
          </Link>
          <div style={{ maxWidth: 420 }}>
            <div className="db-logo-mark" style={{ width: 44, height: 44, fontSize: 20, marginBottom: 20 }}>🏠</div>
            <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 16, lineHeight: 1.2 }}>
              Khởi đầu hành trình <br /><span>thiết kế chuyên nghiệp.</span>
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24 }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-2)', fontSize: 14 }}>
                  <CheckCircle2 size={16} className="text-teal" /> Miễn phí 3 dự án đầu tiên
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-2)', fontSize: 14 }}>
                  <CheckCircle2 size={16} className="text-teal" /> Truy cập thư viện +500 mẫu 3D
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-2)', fontSize: 14 }}>
                  <CheckCircle2 size={16} className="text-teal" /> Xuất bản vẽ kỹ thuật tức thì
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="auth-container">
        <div className="auth-form-card">
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Tạo tài khoản mới</h1>
            <p style={{ fontSize: 14, color: 'var(--text-3)' }}>Bắt đầu thiết kế ngôi nhà mơ ước của bạn ngay.</p>
          </div>

          {/* Social Auth Buttons */}
          <button className="social-btn">
            <img src="https://www.svgrepo.com/show/355037/google.svg" alt="Google" style={{ width: 18 }} />
            Đăng ký với Google
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
              <label className="prop-label">HỌ VÀ TÊN</label>
              <div style={{ position: 'relative' }}>
                <User size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                <input
                  className="input"
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  style={{ paddingLeft: 38, width: '100%' }}
                />
              </div>
            </div>

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
              <label className="prop-label">MẬT KHẨU</label>
              <div style={{ position: 'relative' }}>
                <Lock size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                <input
                  className="input"
                  type="password"
                  placeholder="Tối thiểu 8 ký tự"
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
                  <UserPlus size={18} style={{ marginRight: 8 }} /> Đăng ký tài khoản
                </>
              )}
            </button>
          </form>

          <p style={{ marginTop: 20, fontSize: 11, color: 'var(--text-4)', textAlign: 'center', lineHeight: 1.4 }}>
            Bằng cách đăng ký, bạn đồng ý với Điều khoản dịch vụ và Chính sách bảo mật của chúng tôi.
          </p>

          <div style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'var(--text-3)' }}>
            Đã có tài khoản?{' '}
            <Link to="/login" style={{ color: 'var(--purple)', fontWeight: 600 }}>
              Đăng nhập ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
