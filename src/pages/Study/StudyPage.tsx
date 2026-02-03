import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ViewerCanvas from '@/viewer/ViewerCanvas'

export default function StudyPage() {
  const { modelId } = useParams()
  const navigate = useNavigate()
  const [explode, setExplode] = useState(0)

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 360px',
        height: '100vh',
        background: '#020617',
      }}
    >
      <ViewerCanvas explode={explode} />

      <div
        style={{
          padding: 16,
          color: 'white',
          borderLeft: '1px solid #1e293b',
        }}
      >
        <button onClick={() => navigate('/')}>← Dashboard</button>
        <h3>Study Mode</h3>
        <p>Model: {modelId}</p>

        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={explode}
          onChange={(e) => setExplode(Number(e.target.value))}
        />
      </div>
    </div>
  )
}
