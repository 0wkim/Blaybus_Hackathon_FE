import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth(); 
  const [isHovered, setIsHovered] = useState(false);

  const isActive = (path: string) => location.pathname.startsWith(path);

  const handleLogout = async () => {
    // 로그아웃 로직 실행
    await logout(); 
    
    // 로그아웃이 완료되면 AuthProvider의 isAuthenticated가 false로 변경 됨 
    // ProtectedRoute가 이를 감지하여 접근 제어
    navigate('/login', { replace: true });
  };

  return (
    <header style={headerStyle}>
      {/* 로고 영역 */}
      <div style={logoWrapperStyle}>
        <Link to="/" style={logoLinkStyle}>
          SIMVEX <span style={{ color: '#38bdf8' }}>•</span>
        </Link>
      </div>

      {/* 중앙 네비게이션 */}
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

      {/* 오른쪽 로그아웃 버튼 영역 */}
      <div style={rightSpaceStyle}>
        <button
          onClick={handleLogout}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            ...logoutButtonStyle,
            backgroundColor: isHovered ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
            color: isHovered ? '#ef4444' : '#94a3b8',
          }}
        >
          <span style={{ fontSize: '13px', fontWeight: 500 }}>Logout</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </header>
  );
};

// 스타일
const headerStyle: React.CSSProperties = {
  height: '60px',
  position: 'fixed',
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
  width: '100vw',
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
  display: 'flex',
  gap: '4px',
  background: '#0f172a',
  padding: '4px',
  borderRadius: '12px',
  position: 'absolute',
  left: '50%',
  transform: 'translateX(-50%)',
};

const navItemStyle: React.CSSProperties = {
  width: '85px',
  height: '32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#94a3b8',
  textDecoration: 'none',
  fontSize: '14px',
  borderRadius: '8px',
  transition: 'all 0.2s ease',
};

const activeNavItemStyle: React.CSSProperties = {
  ...navItemStyle,
  color: '#fff',
  background: '#2563eb',
  fontWeight: 600,
};

const rightSpaceStyle: React.CSSProperties = {
  width: '150px',
  display: 'flex',
  justifyContent: 'flex-end',
  flexShrink: 0,
};

const logoutButtonStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '6px 12px',
  borderRadius: '8px',
  border: 'none',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  outline: 'none',
};

export default Header;