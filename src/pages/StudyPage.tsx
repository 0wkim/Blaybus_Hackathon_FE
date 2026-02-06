'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ViewerCanvas, { ViewerCanvasHandle } from '../components/viewer/ViewerCanvas'
import { RobotArmModel } from '../components/viewer/objects/RobotArm/model'
import { SuspensionModel } from '../components/viewer/objects/Suspension/model'
import { V4EngineModel } from '../components/viewer/objects/V4Engine/model'
import { RobotGripperModel } from '../components/viewer/objects/RobotGripper/model'
import Header from '../components/Header'

const MODEL_DATA: Record<string, any> = {
  robotarm: RobotArmModel,
  suspension: SuspensionModel,
  v4engine: V4EngineModel,
  robotgripper: RobotGripperModel,
}

type StudyViewMode = 'single' | 'assembly' | 'simulator'

export default function StudyPage() {
  const { modelId } = useParams<{ modelId: string }>()
  const navigate = useNavigate()
  const viewerRef = useRef<ViewerCanvasHandle>(null)

  const currentModel = (modelId && MODEL_DATA[modelId.toLowerCase()]) || RobotArmModel
  
  const [viewMode, setViewMode] = useState<StudyViewMode>('simulator')
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null)
  const [ghost, setGhost] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showGuide, setShowGuide] = useState(true) 
  const [showAssemblyGuide, setShowAssemblyGuide] = useState(true)

  useEffect(() => {
    setSelectedPartId(null)
  }, [modelId])

  useEffect(() => {
    document.body.style.margin = '0'
    document.body.style.background = 'radial-gradient(circle at center, #1e293b 0%, #080c14 100%)'
  }, [])

  return (
    <div style={containerStyle}>
      <Header />
      
      <main style={mainLayoutStyle(isExpanded)}>
        <section style={viewerPanelStyle}>
          <div style={subHeaderStyle}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Tab label="단일 부품" active={viewMode === 'single'} onClick={() => setViewMode('single')} />
              <Tab label="조립도" active={viewMode === 'assembly'} onClick={() => setViewMode('assembly')} />
              <Tab label="시뮬레이터" active={viewMode === 'simulator'} onClick={() => setViewMode('simulator')} />
            </div>
            <button onClick={() => setIsExpanded(!isExpanded)} style={expandBtnStyle}>
              {isExpanded ? '⧉ 작게 보기' : '⛶ 크게 보기'}
            </button>
          </div>

          <div style={canvasContainerStyle}>
            {viewMode !== 'single' && (
              <div style={zoomControlsStyle}>
                <button style={zoomBtnStyle} onClick={() => viewerRef.current?.zoomIn()}>＋</button>
                <button style={zoomBtnStyle} onClick={() => viewerRef.current?.zoomOut()}>－</button>
                <button style={zoomResetBtnStyle} onClick={() => viewerRef.current?.resetCamera()}>⟲</button>
              </div>
            )}

            {viewMode === 'assembly' && (
              <div style={guideWrapperStyle}>
                <button onClick={() => setShowAssemblyGuide(!showAssemblyGuide)} style={guideToggleBtnStyle}>
                  {showAssemblyGuide ? '▽ Assembly View Info' : '△ Assembly View Info'}
                </button>
                {showAssemblyGuide && (
                  <div style={assemblyNoticeStyle}>
                    <span style={{ color: '#38bdf8', fontWeight: 700, marginRight: '8px' }}>ⓘ INFO</span>
                    조립도 모드에서는 모델의 전체 구조를 열람만 할 수 있습니다. <br/>
                    분해 및 조립 시뮬레이션은 <span style={{ color: '#38bdf8' }}>'시뮬레이터'</span> 탭을 이용해 주세요.
                  </div>
                )}
              </div>
            )}

            {viewMode === 'simulator' && (
              <div style={guideWrapperStyle}>
                <button onClick={() => setShowGuide(!showGuide)} style={guideToggleBtnStyle}>
                  {showGuide ? '▽ Mouse Controls Guide' : '△ Mouse Controls Guide'}
                </button>
                {showGuide && (
                  <div style={guideContentStyle}>
                    <div style={guideItemStyle}><span style={guideKeyStyle}>🖱️ Left Click</span> 시점 회전</div>
                    <div style={guideItemStyle}><span style={guideKeyStyle}>🖱️ Right Click</span> 시점 이동</div>
                    <div style={guideItemStyle}><span style={guideKeyStyle}>🖱️ Mouse Wheel</span> 확대 / 축소</div>
                    <div style={dividerStyle} />
                    <div style={guideItemStyle}><span style={guideKeyStyle}>⌨️ Shift + Drag</span> 분해 / 조립</div>
                  </div>
                )}
              </div>
            )}

            {viewMode === 'single' ? (
              <div style={singleGridStyle}>
                {currentModel.parts
                  .filter((p: any, index: number, self: any[]) => 
                    p.thumbnail && p.thumbnail.trim() !== "" &&
                    self.findIndex(t => t.thumbnail === p.thumbnail) === index
                  )
                  .map((p: any) => (
                    <div key={p.id} style={partCardStyle} onClick={() => navigate(`/parts/${modelId}/${p.id}`)}>
                      <div style={thumbWrapperStyle}>
                        <img src={p.thumbnail} style={thumbStyle} alt={p.id} />
                      </div>
                      <div style={{ padding: '0 4px' }}>
                        <span style={partIdTextStyle}>{p.id}</span>
                        <span style={viewDetailTextStyle}>View Details →</span>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <ViewerCanvas
                ref={viewerRef}
                model={currentModel}
                ghost={viewMode === 'assembly' ? false : ghost}
                selectedPartId={selectedPartId}
                onSelectPart={setSelectedPartId}
                isExpanded={isExpanded}
                mode={viewMode}
              />
            )}
          </div>
        </section>

        {!isExpanded && (
          <aside style={rightPanelStyle}>
            <section style={panelCardStyle}>
              <h3 style={panelTitleStyle}>AI Assistant</h3>
              <div style={aiStatusStyle}>
                <div style={statusDotStyle(!!selectedPartId)} />
                <span style={{ fontSize: '14px', color: '#94a3b8' }}>
                  {selectedPartId ? `Analyzing: ${selectedPartId}` : 'Select a part to analyze...'}
                </span>
              </div>
            </section>

            <section style={memoSectionStyle}>
              <h3 style={panelTitleStyle}>Analysis Memo</h3>
              <div style={memoInnerWrapperStyle}>
                <textarea style={memoBoxStyle} placeholder="Technical observations..." />
                {viewMode === 'simulator' && (
                  <div style={optionRowStyle}>
                    <label style={checkboxLabelStyle}>
                      <input type="checkbox" checked={ghost} onChange={(e) => setGhost(e.target.checked)} style={{ accentColor: '#3b82f6' }} />
                      Ghost Mode (Transparency)
                    </label>
                  </div>
                )}
              </div>
            </section>
          </aside>
        )}
      </main>
    </div>
  )
}

function Tab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '8px 16px',
        borderRadius: '10px',
        border: 'none',
        background: active ? '#3b82f6' : 'rgba(15, 23, 42, 0.5)',
        color: active ? '#fff' : '#64748b',
        fontSize: '13px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
    >
      {label}
    </button>
  )
}

/* =============================================================
   STYLES (INDIVIDUAL CONSTS)
   ============================================================= */

const containerStyle: React.CSSProperties = {
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  background: 'radial-gradient(circle at center, #1e293b 0%, #080c14 100%)',
};

const mainLayoutStyle = (isExpanded: boolean): React.CSSProperties => ({
  flex: 1,
  display: 'grid',
  gridTemplateColumns: isExpanded ? '1fr' : '1fr 380px',
  padding: '20px',
  gap: '20px',
  overflow: 'hidden',
});

const viewerPanelStyle: React.CSSProperties = {
  position: 'relative',
  background: 'rgba(15, 23, 42, 0.4)',
  borderRadius: '24px',
  border: '1px solid #1e293b',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  backdropFilter: 'blur(10px)',
};

const subHeaderStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px 20px',
  borderBottom: '1px solid #1e293b',
  background: 'rgba(30, 41, 59, 0.3)',
};

const canvasContainerStyle: React.CSSProperties = {
  flex: 1,
  position: 'relative',
  background: 'transparent',
  overflow: 'hidden',
};

const zoomControlsStyle: React.CSSProperties = {
  position: 'absolute',
  top: '20px',
  left: '20px',
  zIndex: 50,
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const zoomBtnStyle: React.CSSProperties = {
  width: '36px',
  height: '36px',
  borderRadius: '8px',
  background: '#1e293b',
  border: '1px solid #334155',
  color: '#fff',
  fontSize: '18px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const zoomResetBtnStyle: React.CSSProperties = {
  width: '36px',
  height: '36px',
  borderRadius: '8px',
  background: '#1e293b',
  border: '1px solid #334155',
  color: '#38bdf8',
  fontSize: '20px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const expandBtnStyle: React.CSSProperties = {
  padding: '8px 14px',
  background: '#1e293b',
  border: '1px solid #334155',
  color: '#94a3b8',
  borderRadius: '8px',
  fontSize: '12px',
  cursor: 'pointer',
};

const guideWrapperStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: '20px',
  left: '20px',
  zIndex: 60,
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const guideToggleBtnStyle: React.CSSProperties = {
  background: 'rgba(30, 41, 59, 0.8)',
  backdropFilter: 'blur(8px)',
  border: '1px solid #334155',
  color: '#38bdf8',
  padding: '8px 14px',
  borderRadius: '10px',
  fontSize: '12px',
  fontWeight: 600,
  cursor: 'pointer',
  textAlign: 'left',
  width: 'fit-content',
};

const guideContentStyle: React.CSSProperties = {
  background: 'rgba(15, 23, 42, 0.85)',
  backdropFilter: 'blur(12px)',
  border: '1px solid #1e293b',
  borderRadius: '16px',
  padding: '16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  width: '220px',
  boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
};

const guideItemStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#cbd5e1',
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
};

const guideKeyStyle: React.CSSProperties = {
  color: '#38bdf8',
  fontWeight: 700,
  fontSize: '11px',
  textTransform: 'uppercase',
};

const dividerStyle: React.CSSProperties = {
  height: '1px',
  background: '#334155',
  margin: '4px 0',
};

const assemblyNoticeStyle: React.CSSProperties = {
  width: '340px',
  padding: '12px 16px',
  background: 'rgba(15, 23, 42, 0.85)',
  backdropFilter: 'blur(12px)',
  border: '1px solid #1e293b',
  borderRadius: '12px',
  fontSize: '12px',
  lineHeight: '1.6',
  color: '#cbd5e1',
  boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
};

const singleGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
  gap: '20px',
  padding: '24px',
  background: 'transparent',
  height: '100%',
  overflowY: 'auto',
  alignContent: 'start',
};

const partCardStyle: React.CSSProperties = {
  background: 'rgba(30, 41, 59, 0.5)',
  borderRadius: '20px',
  padding: '12px',
  cursor: 'pointer',
  border: '1px solid rgba(255, 255, 255, 0.05)',
};

const thumbWrapperStyle: React.CSSProperties = {
  position: 'relative',
  background: '#020617',
  borderRadius: '16px',
  overflow: 'hidden',
  marginBottom: '12px',
};

const thumbStyle: React.CSSProperties = {
  width: '100%',
  aspectRatio: '1/1',
  objectFit: 'cover',
};

const partIdTextStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '14px',
  fontWeight: 600,
  color: '#f1f5f9',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

const viewDetailTextStyle: React.CSSProperties = {
  fontSize: '11px',
  color: '#3b82f6',
  marginTop: '4px',
  fontWeight: 600,
};

const rightPanelStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
  height: '100%',
  minHeight: 0,
  overflow: 'hidden',
};

const panelCardStyle: React.CSSProperties = {
  background: 'rgba(15, 23, 42, 0.4)',
  borderRadius: '24px',
  padding: '24px',
  border: '1px solid #1e293b',
  boxSizing: 'border-box',
  backdropFilter: 'blur(10px)',
};

const panelTitleStyle: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 600,
  marginBottom: '16px',
  color: '#38bdf8',
};

const memoSectionStyle: React.CSSProperties = {
  background: 'rgba(15, 23, 42, 0.4)',
  borderRadius: '24px',
  padding: '24px',
  border: '1px solid #1e293b',
  backdropFilter: 'blur(10px)',
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  minHeight: 0,
  position: 'relative',
};

const memoInnerWrapperStyle: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  minHeight: 0,
};

const aiStatusStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '16px',
  background: '#020617',
  borderRadius: '16px',
  border: '1px solid #1e293b',
};

const statusDotStyle = (active: boolean): React.CSSProperties => ({
  width: '8px',
  height: '8px',
  borderRadius: '50%',
  background: active ? '#10b981' : '#334155',
  boxShadow: active ? '0 0 12px #10b981' : 'none',
});

const memoBoxStyle: React.CSSProperties = {
  flex: 1,
  width: '100%',
  background: '#0b1120',
  border: '1px solid #1e293b',
  borderRadius: '16px',
  padding: '16px',
  color: '#e2e8f0',
  fontSize: '14px',
  lineHeight: '1.5',
  resize: 'none',
  outline: 'none',
  boxSizing: 'border-box',
};

const optionRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  marginTop: '4px',
};

const checkboxLabelStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  fontSize: '14px',
  color: '#94a3b8',
  cursor: 'pointer',
};