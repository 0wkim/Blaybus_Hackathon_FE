import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation();

  // 현재 경로 확인 함수
  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <header style={headerStyle}>
      {/* 로고 영역 */}
      <div style={logoStyle}>
        SIMVEX <span style={{ color: '#38bdf8' }}>•</span>
      </div>

      {/* 내비게이션: 너비 고정으로 들썩임 방지 */}
      <nav style={navStyle}>
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
        <Link 
          to="/parts/robotarm" 
          style={isActive('/parts') ? activeNavItemStyle : navItemStyle}
        >
          Parts
        </Link>
      </nav>

      {/* 우측 공간: 좌우 균형 유지 */}
      <div style={rightPlaceholderStyle} />
    </header>
  );
};

/* =============================================================
   STYLES (INDIVIDUAL CONSTS)
   ============================================================= */

const headerStyle: React.CSSProperties = {
  height: '60px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 24px',
  background: 'rgba(2, 6, 23, 0.8)',
  backdropFilter: 'blur(10px)',
  borderBottom: '1px solid #1e293b',
  zIndex: 100,
  boxSizing: 'border-box',
  flexShrink: 0, // 헤더 크기 압축 방지
};

const logoStyle: React.CSSProperties = {
  fontSize: '20px',
  fontWeight: 900,
  color: '#fff',
  width: '120px', 
  flexShrink: 0,
};

const navStyle: React.CSSProperties = {
  display: 'flex',
  gap: '4px',
  background: '#0f172a',
  padding: '4px',
  borderRadius: '12px',
  alignItems: 'center',
  justifyContent: 'center',
};

const navItemStyle: React.CSSProperties = {
  width: '85px', // 메뉴 너비 강제 고정 (매우 중요)
  height: '32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#94a3b8',
  textDecoration: 'none',
  fontSize: '14px',
  transition: 'all 0.2s ease',
  borderRadius: '8px',
};

const activeNavItemStyle: React.CSSProperties = {
  width: '85px', // 비활성 상태와 동일한 너비 유지
  height: '32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#fff',
  background: '#2563eb', // 파란색 캡슐
  borderRadius: '8px',
  textDecoration: 'none',
  fontSize: '14px',
  fontWeight: 600,
  transition: 'all 0.2s ease',
};

const rightPlaceholderStyle: React.CSSProperties = {
  width: '120px',
  flexShrink: 0,
};

export default Header;