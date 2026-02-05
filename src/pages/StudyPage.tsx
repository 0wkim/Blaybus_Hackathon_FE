'use client'

import { useState, useEffect, useRef } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import ViewerCanvas, { ViewerCanvasHandle } from '../components/viewer/ViewerCanvas'
import { RobotArmModel } from '../components/viewer/objects/RobotArm/model'
import { SuspensionModel } from '../components/viewer/objects/Suspension/model'

/* =============================================================
   1. MODELS DATA
   ============================================================= */

const MODEL_DATA: Record<string, any> = {
  robotarm: RobotArmModel,
  suspension: SuspensionModel,
}

type StudyViewMode = 'single' | 'assembly' | 'simulator'

/* =============================================================
   2. SUB-COMPONENTS
   ============================================================= */
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
   3. MAIN PAGE COMPONENT
   ============================================================= */
export default function StudyPage() {
  const { modelId } = useParams<{ modelId: string }>()
  const navigate = useNavigate()
  const viewerRef = useRef<ViewerCanvasHandle>(null)

  const currentModel = (modelId && MODEL_DATA[modelId.toLowerCase()]) || RobotArmModel
  
  const [viewMode, setViewMode] = useState<StudyViewMode>('simulator')
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null)
  const [ghost, setGhost] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showGuide, setShowGuide] = useState(true) // ⭐ 가이드 열림 상태

  useEffect(() => {
    setSelectedPartId(null)
  }, [modelId])

  useEffect(() => {
    document.body.style.margin = '0'
    document.body.style.background = '#020617'
  }, [])

  return (
    <div style={containerStyle}>
      {/* HEADER */}
      <header style={headerStyle}>
        <div style={logoStyle}>SIMEX <span style={{ color: '#38bdf8' }}>•</span></div>
        <nav style={navStyle}>
          <Link to="/" style={navItemStyle}>Home</Link>
          <Link to="/study" style={{ ...navItemStyle, color: '#fff', background: '#1e293b', borderRadius: '8px' }}>Study</Link>
          <Link to="/parts" style={navItemStyle}>Parts</Link>
        </nav>
        <div style={{ width: 100 }} />
      </header>

      {/* MAIN LAYOUT */}
      <main style={mainLayoutStyle(isExpanded)}>
        {/* LEFT SECTION */}
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
            {/* 줌 버튼 레이어 */}
            {viewMode !== 'single' && (
              <div style={zoomControlsStyle}>
                <button style={zoomBtnStyle} onClick={() => viewerRef.current?.zoomIn()}>＋</button>
                <button style={zoomBtnStyle} onClick={() => viewerRef.current?.zoomOut()}>－</button>
                <button style={zoomResetBtnStyle} onClick={() => viewerRef.current?.resetCamera()}>⟲</button>
              </div>
            )}

            {/* ⭐ 시뮬레이터 모드 전용 마우스 가이드 (내용 추가됨) */}
            {viewMode === 'simulator' && (
              <div style={guideWrapperStyle}>
                <button 
                  onClick={() => setShowGuide(!showGuide)} 
                  style={guideToggleBtnStyle}
                >
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
                {currentModel.parts.map((p: any) => (
                  <div key={p.id} style={partCardStyle} onClick={() => navigate(`/parts/${modelId}/${p.id}`)}>
                    <div style={thumbWrapperStyle}>
                      <img src={p.thumbnail} style={thumbStyle} alt={p.id} />
                      <div style={pathBadgeStyle}>{p.id}.glb</div>
                    </div>
                    <div style={{ padding: '0 4px' }}>
                      <span style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#f1f5f9' }}>{p.id}</span>
                      <span style={{ fontSize: '11px', color: '#3b82f6', marginTop: '4px', fontWeight: 600 }}>View Details →</span>
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

        {/* RIGHT SECTION */}
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
                      <input 
                        type="checkbox" 
                        checked={ghost} 
                        onChange={(e) => setGhost(e.target.checked)} 
                        style={{ accentColor: '#3b82f6' }} 
                      />
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

/* =============================================================
   4. STYLES
   ============================================================= */

const containerStyle: React.CSSProperties = {
  height: '100vh', 
  display: 'flex', 
  flexDirection: 'column', 
  background: '#020617'
}

const headerStyle: React.CSSProperties = {
  height: '60px', 
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'space-between', 
  padding: '0 24px',
  background: 'rgba(2, 6, 23, 0.8)', 
  backdropFilter: 'blur(10px)', 
  borderBottom: '1px solid #1e293b', 
  zIndex: 100
}

const logoStyle: React.CSSProperties = { 
  fontSize: '20px', 
  fontWeight: 900, 
  color: '#fff' 
}

const navStyle: React.CSSProperties = { 
  display: 'flex', 
  gap: '8px',
  background: '#0f172a', 
  padding: '4px', 
  borderRadius: '12px' 
}

const navItemStyle: React.CSSProperties = { 
  padding: '6px 16px', 
  color: '#94a3b8', 
  textDecoration: 'none', 
  fontSize: '14px' 
}

const mainLayoutStyle = (isExpanded: boolean): React.CSSProperties => ({
  flex: 1, 
  display: 'grid', 
  gridTemplateColumns: isExpanded ? '1fr' : '1fr 380px', 
  padding: '20px', 
  gap: '20px', 
  overflow: 'hidden'
})

const viewerPanelStyle: React.CSSProperties = {
  position: 'relative', 
  background: '#0f172a', 
  borderRadius: '24px', 
  border: '1px solid #1e293b', 
  display: 'flex', 
  flexDirection: 'column', 
  overflow: 'hidden'
}

const subHeaderStyle: React.CSSProperties = {
  display: 'flex', 
  alignItems: 'center', 
  justifyContent: 'space-between', 
  padding: '16px 20px', 
  borderBottom: '1px solid #1e293b', 
  background: 'rgba(30, 41, 59, 0.3)'
}

const canvasContainerStyle: React.CSSProperties = { 
  flex: 1, 
  position: 'relative', 
  background: '#0f172a' 
}

const zoomControlsStyle: React.CSSProperties = {
  position: 'absolute', 
  top: '20px', 
  left: '20px', 
  zIndex: 50, 
  display: 'flex', 
  flexDirection: 'column', 
  gap: '8px'
}

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
  transition: '0.2s'
}

const zoomResetBtnStyle: React.CSSProperties = { 
  ...zoomBtnStyle, 
  color: '#38bdf8', 
  fontSize: '20px' }

const expandBtnStyle: React.CSSProperties = {
  padding: '8px 14px', 
  background: '#1e293b', 
  border: '1px solid #334155', 
  color: '#94a3b8', 
  borderRadius: '8px', 
  fontSize: '12px', 
  cursor: 'pointer'
}

/* 마우스 가이드 스타일 (Z-index 조정) */
const guideWrapperStyle: React.CSSProperties = {
  position: 'absolute', 
  bottom: '20px', 
  left: '20px', 
  zIndex: 60, 
  display: 'flex', 
  flexDirection: 'column', 
  gap: '8px'
}

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
  transition: '0.2s'
}

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
  boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
}

const guideItemStyle: React.CSSProperties = {
  fontSize: '12px', 
  color: '#cbd5e1', 
  display: 'flex', 
  flexDirection: 'column', 
  gap: '2px'
}

const guideKeyStyle: React.CSSProperties = { 
  color: '#38bdf8', 
  fontWeight: 700, 
  fontSize: '11px', 
  textTransform: 'uppercase' 
}

const dividerStyle: React.CSSProperties = { 
  height: '1px',
  background: '#334155', 
  margin: '4px 0' }

const singleGridStyle: React.CSSProperties = {
  display: 'grid', 
  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
  gap: '20px', 
  padding: '24px', 
  overflowY: 'auto', 
  height: '100%', 
  background: '#0f172a'
}

const partCardStyle: React.CSSProperties = { 
  background: '#1e293b', 
  borderRadius: '20px', 
  padding: '12px', 
  cursor: 'pointer', 
  border: '1px solid #334155' 
}

const thumbWrapperStyle: React.CSSProperties = { 
  position: 'relative', 
  background: '#020617', 
  borderRadius: '16px', 
  overflow: 'hidden', 
  marginBottom: '12px' 
}

const thumbStyle: React.CSSProperties = { 
  width: '100%', 
  aspectRatio: '1/1', 
  objectFit: 'cover' 
}

const pathBadgeStyle: React.CSSProperties = { 
  position: 'absolute', 
  bottom: '8px', 
  right: '8px', 
  background: 'rgba(2, 6, 23, 0.7)', 
  padding: '2px 8px', 
  borderRadius: '6px', 
  fontSize: '10px', 
  color: '#38bdf8' 
}

const rightPanelStyle: React.CSSProperties = { 
  display: 'flex', 
  flexDirection: 'column', 
  gap: '20px', 
  height: '100%', 
  minHeight: 0, 
  overflow: 'hidden' 
}

const panelCardStyle: React.CSSProperties = { 
  background: '#0f172a', 
  borderRadius: '24px', 
  padding: '24px', 
  border: '1px solid #1e293b', 
  boxSizing: 'border-box' 
}

const panelTitleStyle: React.CSSProperties = { 
  fontSize: '16px', 
  fontWeight: 600, 
  marginBottom: 16, 
  color: '#38bdf8' 
}

const memoSectionStyle: React.CSSProperties = { 
  ...panelCardStyle, 
  flex: 1, 
  display: 'flex', 
  flexDirection: 'column', 
  minHeight: 0, 
  position: 'relative' 
}

const memoInnerWrapperStyle: React.CSSProperties = { 
  flex: 1, 
  display: 'flex', 
  flexDirection: 'column', 
  gap: 12, 
  minHeight: 0 
}

const aiStatusStyle: React.CSSProperties = { 
  display: 'flex', 
  alignItems: 'center', 
  gap: 12, 
  padding: '16px', 
  background: '#020617', 
  borderRadius: '16px', 
  border: '1px solid #1e293b' 
}

const statusDotStyle = (active: boolean): React.CSSProperties => ({ 
  width: '8px', 
  height: '8px', 
  borderRadius: '50%', 
  background: active ? '#10b981' : '#334155', 
  boxShadow: active ? '0 0 12px #10b981' : 'none' 
})

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
  boxSizing: 'border-box' 
}

const optionRowStyle: React.CSSProperties = { 
  display: 'flex', 
  alignItems: 'center', 
  marginTop: '4px' 
}

const checkboxLabelStyle: React.CSSProperties = { 
  display: 'flex', 
  alignItems: 'center', 
  gap: 8, 
  fontSize: '14px', 
  color: '#94a3b8', 
  cursor: 'pointer' 
}