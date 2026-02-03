import { useNavigate } from 'react-router-dom'

const MODELS = [
  { id: 'RobotArm', name: 'Robot Arm' },
  { id: 'V4_Engine', name: 'V4 Engine' },
  { id: 'MachineVice', name: 'Machine Vice' },
  { id: 'Drone', name: 'Drone' },
  { id: 'Suspension', name: 'Suspension' },
  { id: 'LeafSpring', name: 'Leaf Spring' },
  { id: 'RobotGripper', name: 'Robot Gripper' },
]

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={{ margin: 0 }}>SIMVEX</h1>
        <div style={{ display: 'flex', gap: 12 }}>
          <button style={styles.textBtn}>Login</button>
          <button style={styles.textBtn}>Sign Up</button>
        </div>
      </header>

      {/* Intro */}
      <section style={styles.intro}>
        <h2>3D 기반 공학 학습 시뮬레이터</h2>
        <p>
          복잡한 기계 구조를 3D로 분해·조립하며
          직관적으로 학습할 수 있는 시뮬레이션 환경입니다.
        </p>
      </section>

      {/* Model Grid */}
      <section>
        <h3>학습할 모델을 선택하세요</h3>

        <div style={styles.grid}>
          {MODELS.map((model) => (
            <div key={model.id} style={styles.card}>
              <div style={styles.thumbnail}>
                {model.name}
              </div>

              <div style={styles.cardFooter}>
                <button
                  style={styles.primaryBtn}
                  onClick={() => navigate(`/study/${model.id}`)}
                >
                  Study
                </button>
                <button
                  style={styles.secondaryBtn}
                  onClick={() => navigate(`/cad/${model.id}`)}
                >
                  CAD
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#020617',
    color: '#e5e7eb',
    padding: '24px 32px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  textBtn: {
    background: 'transparent',
    color: '#e5e7eb',
    border: '1px solid #334155',
    borderRadius: 6,
    padding: '6px 12px',
    cursor: 'pointer',
  },
  intro: {
    maxWidth: 600,
    marginBottom: 40,
    color: '#cbd5f5',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: 20,
    marginTop: 16,
  },
  card: {
    background: '#020617',
    border: '1px solid #1e293b',
    borderRadius: 12,
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  thumbnail: {
    height: 120,
    borderRadius: 8,
    background: '#0f172a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 600,
    marginBottom: 16,
    color: '#94a3b8',
    textAlign: 'center',
  },
  cardFooter: {
    display: 'flex',
    gap: 8,
  },
  primaryBtn: {
    flex: 1,
    padding: '8px 0',
    borderRadius: 6,
    background: '#2563eb',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
  },
  secondaryBtn: {
    flex: 1,
    padding: '8px 0',
    borderRadius: 6,
    background: '#334155',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
  },
}
