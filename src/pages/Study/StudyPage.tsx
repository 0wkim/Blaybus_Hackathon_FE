import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ViewerCanvas from '@/viewer/ViewerCanvas'
import { getModelOrThrow } from '@/viewer/registry'

export default function StudyPage() {
  const { modelId } = useParams<{ modelId: string }>()
  const navigate = useNavigate()

  const model = useMemo(() => getModelOrThrow(modelId ?? 'RobotArm'), [modelId])

  const [explode, setExplode] = useState(0) // 0~1
  const [ghost, setGhost] = useState(false)
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null)

  const selectedLabel =
    selectedPartId
      ? model.parts.find((p) => p.id === selectedPartId)?.label ?? selectedPartId
      : 'None'

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 360px',
        height: '100vh',
        background: '#020617',
      }}
    >
      {/* 3D Viewer */}
      <ViewerCanvas
        model={model}
        explode={explode}
        ghost={ghost}
        selectedPartId={selectedPartId}
        onSelectPart={setSelectedPartId}
      />

      {/* Sidebar */}
      <aside
        style={{
          padding: 16,
          color: 'white',
          borderLeft: '1px solid #1e293b',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <button
          onClick={() => navigate('/')}
          style={{
            width: 'fit-content',
            background: 'transparent',
            color: '#94a3b8',
            border: '1px solid #334155',
            borderRadius: 8,
            padding: '6px 10px',
            cursor: 'pointer',
          }}
        >
          ← Dashboard
        </button>

        <div style={{ background: '#0f172a', borderRadius: 12, padding: 12 }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>Study</div>
          <div style={{ color: '#94a3b8', fontSize: 13 }}>
            Model: <b style={{ color: 'white' }}>{model.id}</b>
          </div>
          <div style={{ color: '#94a3b8', fontSize: 13, marginTop: 6 }}>
            Selected: <b style={{ color: 'white' }}>{selectedLabel}</b>
          </div>
        </div>

        {/* 분해/조립: 마우스 드래그 슬라이더 */}
        <div style={{ background: '#0f172a', borderRadius: 12, padding: 12 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>분해 / 조립</div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={explode}
            onChange={(e) => setExplode(Number(e.target.value))}
            style={{ width: '100%' }}
          />
          <div style={{ marginTop: 8, color: '#94a3b8', fontSize: 13 }}>
            상태:{' '}
            {explode === 0 ? '조립' : explode === 1 ? '완전 분해' : '진행 중'}
          </div>
        </div>

        {/* ghost mode */}
        <div style={{ background: '#0f172a', borderRadius: 12, padding: 12 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Ghost mode</div>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={ghost}
              onChange={(e) => setGhost(e.target.checked)}
              disabled={!selectedPartId}
            />
            <span style={{ color: '#94a3b8', fontSize: 13 }}>
              선택된 부품 외 반투명 처리
            </span>
          </label>
          {!selectedPartId && (
            <div style={{ marginTop: 8, color: '#64748b', fontSize: 12 }}>
              (부품을 클릭해서 선택하면 활성화됩니다)
            </div>
          )}
        </div>

        {/* AI / Memo는 자리만 */}
        <div style={{ flex: 1, background: '#0f172a', borderRadius: 12, padding: 12 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>AI Assistant</div>
          <div style={{ color: '#64748b', fontSize: 13 }}>(추가 예정)</div>
        </div>

        <div style={{ height: 180, background: '#0f172a', borderRadius: 12, padding: 12 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Memo</div>
          <textarea
            placeholder="학습 내용을 메모하세요"
            style={{
              width: '100%',
              height: 120,
              background: '#020617',
              color: 'white',
              border: '1px solid #1e293b',
              borderRadius: 8,
              resize: 'none',
              padding: 10,
            }}
          />
        </div>
      </aside>
    </div>
  )
}
