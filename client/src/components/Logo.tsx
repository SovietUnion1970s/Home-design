import React from 'react';
import { Box } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Logo: React.FC<{ size?: number; showText?: boolean; lightTheme?: boolean }> = ({ 
  size = 28, 
  showText = true, 
  lightTheme = true 
}) => {
  return (
    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, userSelect: 'none', textDecoration: 'none' }}>
      <div style={{
        width: size, height: size, borderRadius: size * 0.25,
        background: 'linear-gradient(135deg, #3b82f6, #0ea5e9)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(59,130,246,0.25)',
        color: 'white',
        flexShrink: 0
      }}>
        <Box size={size * 0.55} strokeWidth={2.5} />
      </div>
      {showText && (
        <div style={{ 
          fontSize: size * 0.65, 
          fontWeight: 800, 
          letterSpacing: '-0.3px',
          color: lightTheme ? '#0f172a' : '#f8fafc',
          display: 'flex',
          alignItems: 'center'
        }}>
          Home<span style={{ color: '#3b82f6', fontWeight: 600 }}>Design</span>
        </div>
      )}
    </Link>
  );
};
