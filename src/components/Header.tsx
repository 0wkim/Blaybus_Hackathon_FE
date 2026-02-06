import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <header style={headerStyle}>
      <div style={logoWrapperStyle}>
        <Link to="/" style={logoLinkStyle}>
          SIMVEX <span style={{ color: '#38bdf8' }}>•</span>
        </Link>
      </div>

      <nav style={navContainerStyle}>
        <Link 
          to="/dashboard" 
          style={location.pathname === '/dashboard' ? activeNavItemStyle : navItemStyle}
        >
          Home
        </Link>
        <Link 
          to="/study/robotarm" 
          style={isActive('/study') ? activeNavItemStyle : navItemStyle}
        >
          Study
        </Link>
      </nav>

      <div style={rightSpaceStyle} />
    </header>
  );
};

const headerStyle: React.CSSProperties = {
  height: '60px',
  position: 'fixed', // 최상단 물리적 고정
  top: 0,
  left: 0,
  right: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 24px',
  background: 'rgba(2, 6, 23, 0.9)',
  backdropFilter: 'blur(10px)',
  borderBottom: '1px solid #1e293b',
  zIndex: 9999,
  boxSizing: 'border-box',
};

const logoWrapperStyle: React.CSSProperties = {
  width: '150px',
  flexShrink: 0,
};

const logoLinkStyle: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: 900,
  color: '#fff',
  textDecoration: 'none',
  cursor: 'pointer',
};

const navContainerStyle: React.CSSProperties = {
  position: 'absolute',
  left: '50%',
  transform: 'translateX(-50%)', // 화면 정중앙 고정
  display: 'flex',
  gap: '4px',
  background: '#0f172a',
  padding: '4px',
  borderRadius: '12px',
};

const navItemStyle: React.CSSProperties = {
  width: '85px', // 너비 고정으로 텍스트 변화에도 미동 없음
  height: '32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#94a3b8',
  textDecoration: 'none',
  fontSize: '14px',
  borderRadius: '8px',
};

const activeNavItemStyle: React.CSSProperties = {
  ...navItemStyle,
  color: '#fff',
  background: '#2563eb', // 파란색 캡슐 강조
  fontWeight: 600,
};

const rightSpaceStyle: React.CSSProperties = {
  width: '150px',
  flexShrink: 0,
};

export default Header;