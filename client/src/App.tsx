import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Designer from './pages/Designer';
import Login from './pages/Login';
import Register from './pages/Register';
import AuthCallback from './pages/AuthCallback';
import { Toaster } from 'react-hot-toast';

// Protected route — redirects to /login if no auth token
const ProtectedRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const { token } = useAuthStore();
  return token ? element : <Navigate to="/login" replace />;
};

// Public route — redirects to /dashboard if already logged in
const PublicOnlyRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const { token } = useAuthStore();
  return !token ? element : <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" toastOptions={{ duration: 3000, style: { fontSize: '14px', fontWeight: 500 } }} />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<PublicOnlyRoute element={<Login />} />} />
        <Route path="/register" element={<PublicOnlyRoute element={<Register />} />} />

        {/* OAuth callback — always accessible so the token can be saved */}
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Protected */}
        <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
        <Route path="/designer" element={<ProtectedRoute element={<Designer />} />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
