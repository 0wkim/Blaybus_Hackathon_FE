import { useNavigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";

export default function DashboardPage() {
    const auth = useAuth();
    const navigate = useNavigate(); 

    if (!auth) return null;

    return (
        <div style={{ padding: '40px', color: 'white', background: '#020617', minHeight: '100vh' }}>
            <h1 style={{ marginBottom: '30px' }}>학습할 모델을 선택하세요</h1>
            
            <div style={{ display: 'flex', gap: '20px' }}>
                <div onClick={() => navigate("/study/robotarm")} style={cardStyle}>
                    <h2>🦾 Robot Arm</h2>
                    <p style={{ color: '#94a3b8' }}>로봇팔 관절 구조 분석</p>
                </div>

                <div onClick={() => navigate("/study/suspension")} style={cardStyle}>
                    <h2>🚗 Suspension</h2>
                    <p style={{ color: '#94a3b8' }}>서스펜션 메커니즘 학습</p>
                </div>

                <div onClick={() => navigate("/study/v4engine")} style={cardStyle}>
                    <h2>⚙️ V4_Engine</h2>
                    <p style={{ color: '#94a3b8' }}>V4실린더 엔진</p>
                </div>
            </div>

            <button onClick={auth.logout} style={{ marginTop: '50px', cursor: 'pointer' }}>
                로그아웃
            </button>
        </div>
    )
}

const cardStyle: React.CSSProperties = {
    background: '#0f172a',
    padding: '30px',
    borderRadius: '24px',
    cursor: 'pointer',
    border: '1px solid #1e293b',
    width: '260px',
    transition: 'transform 0.2s'
}