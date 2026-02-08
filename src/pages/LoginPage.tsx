import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";

const LoginPage = () => {
  const { login, isLoading } = useAuth(); // isLoading도 가져와서 중복 클릭 방지
  const navigate = useNavigate();

  // 입력값 상태 관리
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
  }, []);

  const handleLogin = async () => {
    // 유효성 검사
    if (!email || !password) {
      alert("아이디와 비밀번호를 모두 입력해주세요.");
      return;
    }

    // AuthProvider의 login 함수 호출 (성공 여부 반환)
    const success = await login(email, password);
    
    // 성공 시 대시보드 이동
    if (success) {
      navigate("/dashboard");
    } else {
      alert("로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.");
    }
  };

  // 엔터키 입력 시 로그인 실행
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div style={styles.container}>
      {/* 로고 섹션 */}
      <div style={styles.logoWrapper}>
        <div style={styles.logoBox}>S</div>
        <span style={styles.logoText}>SIMVEX</span>
      </div>

      {/* 로그인 카드 */}
      <div style={styles.card}>
        <h2 style={styles.title}>로그인</h2>
        <p style={styles.subtitle}>계정에 접속하세요</p>

        {/* 입력 필드: 아이디 */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>아이디 (이메일)</label>
          <input 
            type="email" 
            placeholder="example@email.com" 
            style={styles.input} 
            value={email} // 상태 연결
            onChange={(e) => setEmail(e.target.value)} // 입력 감지
          />
        </div>

        {/* 입력 필드: 비밀번호 */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>비밀번호</label>
          <input 
            type="password" 
            placeholder="••••••••" 
            style={styles.input} 
            value={password} // 상태 연결
            onChange={(e) => setPassword(e.target.value)} // 입력 감지
            onKeyDown={handleKeyDown} // 엔터키 이벤트 연결
          />
        </div>

        {/* 로그인 버튼 */}
        <button 
          onClick={handleLogin} 
          style={{...styles.loginButton, opacity: isLoading ? 0.7 : 1}} 
          disabled={isLoading} // 로딩 중 클릭 방지
        >
          {isLoading ? "로그인 중..." : (
            <>
              로그인 <span style={styles.arrow}>→</span>
            </>
          )}
        </button>

        {/* 하단 링크 */}
        <div style={styles.footerText}>
          계정이 없으신가요? 
          <span onClick={() => navigate('/signup')} style={styles.link}>
            회원가입
          </span>
        </div>
      </div>
    </div>
  );
};

// 스타일 가이드라인에 맞춘 테마 객체
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'radial-gradient(circle at center, #1e293b 0%, #080c14 100%)',
    color: 'white',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  logoWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '40px',
  },
  logoBox: {
    width: '38px',
    height: '38px',
    backgroundColor: '#4da6ff',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '20px',
  },
  logoText: {
    fontSize: '22px',
    fontWeight: 'bold',
    letterSpacing: '0.5px',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderRadius: '16px',
    padding: '48px 40px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  },
  title: {
    fontSize: '26px',
    fontWeight: '600',
    margin: '0 0 10px 0',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: '14px',
    marginBottom: '36px',
  },
  inputGroup: {
    marginBottom: '20px',
  },
  label: {
    fontSize: '13px',
    color: '#94a3b8',
    display: 'block',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '13px 16px',
    backgroundColor: '#1e293b',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: 'white',
    boxSizing: 'border-box',
    outline: 'none',
    fontSize: '14px',
  },
  loginButton: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginTop: '12px',
  },
  arrow: {
    fontSize: '16px',
    marginTop: '-2px',
  },
  footerText: {
    textAlign: 'center',
    marginTop: '32px',
    fontSize: '14px',
    color: '#94a3b8',
  },
  link: {
    color: '#4da6ff',
    cursor: 'pointer',
    marginLeft: '6px',
    fontWeight: '500',
  },
};

export default LoginPage;