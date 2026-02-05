import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SignupPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.margin = '0';
    document.body.style.padding = '0';
  }, []);

  return (
    <div style={styles.container}>
      {/* 로고 섹션 */}
      <div style={styles.logoWrapper}>
        <div style={styles.logoBox}>S</div>
        <span style={styles.logoText}>SIMVEX</span>
      </div>

      {/* 회원가입 카드 */}
      <div style={styles.card}>
        <h2 style={styles.title}>회원가입</h2>
        <p style={styles.subtitle}>새로운 계정을 만드세요</p>

        {/* 이름 입력 */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>이름</label>
          <input type="text" placeholder="홍길동" style={styles.input} />
        </div>

        {/* 이메일 입력 */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>아이디 (이메일)</label>
          <input type="email" placeholder="example@email.com" style={styles.input} />
        </div>

        {/* 비밀번호 입력 */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>비밀번호</label>
          <input type="password" placeholder="••••••••" style={styles.input} />
        </div>

        {/* 비밀번호 확인 입력 */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>비밀번호 확인</label>
          <input type="password" placeholder="••••••••" style={styles.input} />
        </div>

        {/* 회원가입 버튼 */}
        <button style={styles.signupButton}>
          회원가입 <span style={styles.arrow}>→</span>
        </button>

        {/* 하단 링크 */}
        <div style={styles.footerText}>
          이미 계정이 있으신가요? 
          <span onClick={() => navigate('/login')} style={styles.link}>
            로그인
          </span>
        </div>
      </div>
    </div>
  );
};

// 스타일 객체 
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
    marginBottom: '32px',
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
    padding: '40px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  },
  title: {
    fontSize: '26px',
    fontWeight: '600',
    margin: '0 0 8px 0',
  },
  subtitle: {
    color: '#94a3b8',
    fontSize: '14px',
    marginBottom: '28px',
  },
  inputGroup: {
    marginBottom: '18px',
  },
  label: {
    fontSize: '13px',
    color: '#94a3b8',
    display: 'block',
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    backgroundColor: '#1e293b',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: 'white',
    boxSizing: 'border-box',
    outline: 'none',
    fontSize: '14px',
  },
  signupButton: {
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
    marginTop: '10px',
  },
  arrow: {
    fontSize: '16px',
    marginTop: '-2px',
  },
  footerText: {
    textAlign: 'center',
    marginTop: '24px',
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

export default SignupPage;