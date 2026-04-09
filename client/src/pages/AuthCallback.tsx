import React, { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

/**
 * This page handles the redirect from the backend after OAuth login.
 * URL format: /auth/callback?token=<jwt>
 * It extracts the token, saves it to the auth store, then redirects to /dashboard.
 */
const AuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { setTokenFromOAuth } = useAuthStore();
  const navigate = useNavigate();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const token = searchParams.get('token');
    if (token) {
      setTokenFromOAuth(token);
      navigate('/dashboard', { replace: true });
    } else {
      // No token — something went wrong, go back to login
      navigate('/login', { replace: true });
    }
  }, [searchParams, setTokenFromOAuth, navigate]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 16,
        background: 'var(--bg-base)',
      }}
    >
      <div style={{ fontSize: 40 }}>🔄</div>
      <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-1)' }}>
        Đang xác thực...
      </div>
      <div style={{ fontSize: 13, color: 'var(--text-3)' }}>
        Vui lòng chờ trong giây lát.
      </div>
    </div>
  );
};

export default AuthCallback;
