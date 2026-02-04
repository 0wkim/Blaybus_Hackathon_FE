'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import ViewerCanvas from '../components/viewer/ViewerCanvas'
import { RobotArmModel } from '../components/viewer/objects/RobotArm/model'

// 1. 모델 매핑 객체
const MODEL_DATA: Record<string, any> = {
  robotarm: RobotArmModel,
  suspension: RobotArmModel,
}

export default function StudyPage() {
  const { modelId } = useParams<{ modelId: string }>() // 2. URL에서 modelId 추출
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null)
  const [ghost, setGhost] = useState<boolean>(true)
  const [isExpanded, setIsExpanded] = useState<boolean>(false)

  // 3. 해당하는 모델 데이터 선택 (없으면 로봇팔 기본)
  const currentModel = (modelId && MODEL_DATA[modelId.toLowerCase()]) || RobotArmModel

  // 모델이 바뀔 때 선택된 파츠 초기화
  useEffect(() => {
    setSelectedPartId(null)
  }, [modelId])

  useEffect(() => {
    document.body.style.margin = '0'
    document.body.style.padding = '0'
    document.body.style.overflow = 'hidden'
    document.body.style.backgroundColor = '#020617'
  }, [])

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: '#020617',
      display: 'grid',
      gridTemplateColumns: isExpanded ? '1fr 0fr' : '1.8fr 1fr',
      transition: 'grid-template-columns 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      padding: isExpanded ? '0px' : '16px',
      gap: isExpanded ? '0px' : '16px',
      boxSizing: 'border-box',
    }}>
      {/* 3D VIEWER PANEL */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minWidth: 0,
        borderRadius: isExpanded ? '0px' : '24px',
        overflow: 'hidden',
        background: '#020617',
        border: isExpanded ? 'none' : '1px solid #1e293b',
        transition: 'all 0.4s ease',
      }}>
        <ViewerCanvas
          key={modelId}
          model={currentModel}
          ghost={ghost}
          selectedPartId={selectedPartId}
          onSelectPart={setSelectedPartId}
          isExpanded={isExpanded}
        />
        <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 20 }}>
          <button 
            onClick={() => setIsExpanded(!isExpanded)} 
            style={actionBtnStyle}
          >
            {isExpanded ? '⧉ 작게 보기' : '⛶ 크게 보기'}
          </button>
        </div>
      </div>

      {/* RIGHT SIDE PANEL */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        height: '100%',
        overflow: 'hidden',
        opacity: isExpanded ? 0 : 1,
        width: isExpanded ? 0 : '100%',
        background: '#020617',
        transition: 'opacity 0.2s ease, width 0.4s ease',
        visibility: isExpanded ? 'hidden' : 'visible'
      }}>
        <h3 style={panelTitleStyle}>{currentModel.name} 분석</h3>
        {!isExpanded && (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '16px', 
            height: '100%', 
            width: '100%', 
            padding: '2px' 
          }}>
            <section style={panelCardStyle}>
              <div style={panelHeaderStyle}>
                <span style={{ fontSize: '20px' }}>🤖</span>
                <h3 style={panelTitleStyle}>AI 어시스턴트</h3>
              </div>
              <div style={aiContentBoxStyle}>
                {selectedPartId ? (
                  <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
                    {selectedPartId} 분석 중...
                  </p>
                ) : (
                  <p style={{ color: '#475569', fontSize: '13px', textAlign: 'center' }}>
                    부품을 선택하세요.
                  </p>
                )}
              </div>
            </section>

            <section style={{ 
              ...panelCardStyle, 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              minHeight: 0 
            }}>
              <div style={panelHeaderStyle}>
                <span style={{ fontSize: '20px' }}>📝</span>
                <h3 style={panelTitleStyle}>학습 메모</h3>
              </div>
              <textarea placeholder="기록하세요..." style={textareaStyle} />
              <div style={memoFooterStyle}>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  cursor: 'pointer' 
                }}>
                  <input 
                    type="checkbox" 
                    checked={ghost} 
                    onChange={(e) => setGhost(e.target.checked)} 
                    style={{ accentColor: '#38bdf8' }} 
                  />
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Ghost Mode</span>
                </label>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}

/* ================= 정돈된 스타일 정의 ================= */

const panelCardStyle: React.CSSProperties = {
  background: '#0f172a',
  border: '1px solid #1e293b',
  borderRadius: '24px',
  padding: '24px',
  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
}

const panelHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginBottom: '20px',
}

const panelTitleStyle: React.CSSProperties = {
  fontSize: '15px',
  fontWeight: 700,
  color: '#f1f5f9',
  margin: 0,
}

const aiContentBoxStyle: React.CSSProperties = {
  background: 'rgba(2, 6, 23, 0.4)',
  borderRadius: '16px',
  padding: '16px',
  border: '1px solid rgba(56, 189, 248, 0.05)',
}

const textareaStyle: React.CSSProperties = {
  flex: 1,
  width: '100%',
  background: 'rgba(2, 6, 23, 0.6)',
  color: '#f1f5f9',
  border: '1px solid #334155',
  borderRadius: '20px',
  padding: '20px',
  resize: 'none',
  fontSize: '14px',
  lineHeight: '1.7',
  outline: 'none',
  marginBottom: '16px',
  boxSizing: 'border-box',
}

const memoFooterStyle: React.CSSProperties = {
  borderTop: '1px solid #1e293b',
  paddingTop: '16px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}

const actionBtnStyle: React.CSSProperties = {
  padding: '10px 22px',
  background: 'rgba(15, 23, 42, 0.7)',
  border: '1px solid #334155',
  borderRadius: '14px',
  color: '#f8fafc',
  cursor: 'pointer',
  fontSize: '13px',
  fontWeight: 600,
  backdropFilter: 'blur(12px)',
  transition: 'all 0.2s',
}