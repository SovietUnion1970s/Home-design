import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export const UserProfileMenu: React.FC = () => {
  const { user, logout, updateProfile, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Profile edit state
  const [editFirstName, setEditFirstName] = useState(user?.firstName || '');
  const [editLastName, setEditLastName] = useState(user?.lastName || '');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSaveProfile = async () => {
    const ok = await updateProfile({ firstName: editFirstName, lastName: editLastName });
    if (ok) {
        toast.success("Cập nhật thông tin thành công!");
        setShowModal(false);
    }
  };

  // Extract initial
  const initial = user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <div style={{ position: 'relative' }} ref={menuRef}>
      {/* Avatar Button */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg, var(--purple-dark), var(--teal))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 700, cursor: 'pointer',
          border: isOpen ? '2px solid white' : '2px solid transparent',
          transition: 'all 0.2s', color: 'white'
        }}
      >
        {initial}
      </div>

      {/* Popover Dropdown */}
      {isOpen && (
        <div style={{
          position: 'absolute', top: 48, right: 0, width: 220,
          background: 'rgba(10,10,20,0.95)', backdropFilter: 'blur(24px)',
          border: '1px solid var(--border-2)', borderRadius: 12,
          boxShadow: 'var(--shadow-lg)', zIndex: 9999, overflow: 'hidden',
          display: 'flex', flexDirection: 'column'
        }}>
          <div style={{ padding: '16px 14px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.firstName || user?.lastName ? `${user.firstName || ''} ${user.lastName || ''}` : 'Người dùng Ẩn danh'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.email}
            </div>
            <div className="badge badge-teal" style={{ marginTop: 8, display: 'inline-block', fontSize: 10 }}>
              {user?.role}
            </div>
          </div>
          
          <div style={{ padding: 6 }}>
            <button 
              onClick={() => { setIsOpen(false); setShowModal(true); }}
              style={{ width: '100%', textAlign: 'left', padding: '10px 12px', background: 'transparent', border: 'none', color: 'var(--text-2)', fontSize: 13, borderRadius: 6, cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'center' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <span>👤</span> Chỉnh sửa Hồ sơ
            </button>
            <button 
              onClick={handleLogout}
              style={{ width: '100%', textAlign: 'left', padding: '10px 12px', background: 'transparent', border: 'none', color: '#f87171', fontSize: 13, borderRadius: 6, cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'center' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(248,113,113,0.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <span>🚪</span> Đăng xuất
            </button>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100000,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border)',
            padding: 24, borderRadius: 16, width: 400, boxShadow: 'var(--shadow-xl)'
          }}>
             <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Thông tin Cá nhân</h2>
             
             <div className="input-group" style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 6, display: 'block' }}>Tên (First Name)</label>
                <input className="input" value={editFirstName} onChange={e => setEditFirstName(e.target.value)} style={{ width: '100%', padding: '10px 12px' }} />
             </div>

             <div className="input-group" style={{ marginBottom: 24 }}>
                <label style={{ fontSize: 12, color: 'var(--text-2)', marginBottom: 6, display: 'block' }}>Họ (Last Name)</label>
                <input className="input" value={editLastName} onChange={e => setEditLastName(e.target.value)} style={{ width: '100%', padding: '10px 12px' }} />
             </div>

             <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Hủy</button>
                <button className="btn btn-primary" onClick={handleSaveProfile} disabled={isLoading}>
                  {isLoading ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
