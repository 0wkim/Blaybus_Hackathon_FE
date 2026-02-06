'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ViewerCanvas from '../components/viewer/ViewerCanvas'
import type { ViewerCanvasHandle } from '../components/viewer/ViewerCanvas'
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

type StudyViewMode = 'single' | 'assembly' | 'edit' | 'simulator'

export default function StudyPage() {
  const { modelId } = useParams<{ modelId: string }>()
  const viewerRef = useRef<ViewerCanvasHandle>(null)

  const currentModel = useMemo(() => {
    return (modelId && MODEL_DATA[modelId.toLowerCase()]) || RobotArmModel
  }, [modelId])
  
  const [viewMode, setViewMode] = useState<StudyViewMode>('simulator')
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null)
  const [activeSinglePartId, setActiveSinglePartId] = useState<string | null>(null)

  const [ghost, setGhost] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showGuide, setShowGuide] = useState(true) 
  const [showAssemblyGuide, setShowAssemblyGuide] = useState(true)
  const [showEditGuide, setShowEditGuide] = useState(true)

  const [memoText, setMemoText] = useState('')
  const [isEditing, setIsEditing] = useState(true)
  const [isMemoOpen, setIsMemoOpen] = useState(true)

  useEffect(() => {
    setSelectedPartId(null);
    setActiveSinglePartId(null);
  }, [modelId]);

  useEffect(() => {
    document.body.style.margin = '0'
    document.body.style.backgroundColor = '#080c14' 
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof Element && (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT')) return;
      if (e.key.toLowerCase() === 'f' && !e.repeat) {
        setIsExpanded(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsExpanded(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const storageKey = `camera_state_${modelId}`;
  
  useEffect(() => {
    if (viewMode === 'single') return;
    const saveInterval = setInterval(() => {
      if (viewerRef.current?.getCameraState) {
        const currentState = viewerRef.current.getCameraState();
        if (currentState) {
          localStorage.setItem(storageKey, JSON.stringify(currentState));
        }
      }
    }, 1000);
    return () => clearInterval(saveInterval);
  }, [viewMode, storageKey]);

  return (
    <div style={containerStyle}>
      <style>{`
        #part-list-sidebar::-webkit-scrollbar { width: 6px; }
        #part-list-sidebar::-webkit-scrollbar-track { background: rgba(15, 23, 42, 0.1); border-radius: 10px; }
        #part-list-sidebar::-webkit-scrollbar-thumb { background: rgba(56, 189, 248, 0.3); border-radius: 10px; }
        #part-list-sidebar::-webkit-scrollbar-thumb:hover { background: rgba(56, 189, 248, 0.6); }
      `}</style>

      <Header />
      
      <main style={mainLayoutStyle(isExpanded)}>
        <section style={viewerPanelStyle}>
          <div style={subHeaderStyle}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Tab label="단일 부품" active={viewMode === 'single'} onClick={() => setViewMode('single')} />
              <Tab label="조립도" active={viewMode === 'assembly'} onClick={() => setViewMode('assembly')} />
              <Tab label="편집" active={viewMode === 'edit'} onClick={() => setViewMode('edit')} />
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
                  {showAssemblyGuide ? '▽ 조립도 가이드 닫기' : '△ 조립도 가이드 열기'}
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
                   {showGuide ? '▽ 시뮬레이터 가이드 닫기' : '△ 시뮬레이터 가이드 열기'}
                </button>
                {showGuide && (
                  <div style={guideContentStyle}>
                    <div style={guideSectionTitleStyle}><span style={{ marginRight: '6px' }}>🖱️</span> 마우스 조작</div>
                    <div style={guideItemStyle}>
                      <div style={guideRowStyle}><span style={guideIconStyle}>🖱️</span><span>좌클릭 : <span style={highlightTextStyle}>모델 회전</span></span></div>
                      <div style={guideRowStyle}><span style={guideIconStyle}>🖐️</span><span>우클릭 : <span style={highlightTextStyle}>시점 이동</span></span></div>
                      <div style={guideRowStyle}><span style={guideIconStyle}>🔄</span><span>휠 : <span style={highlightTextStyle}>확대/축소</span></span></div>
                    </div>
                    <div style={dividerStyle} />
                    <div style={guideSectionTitleStyle}><span style={{ marginRight: '6px' }}>⌨️</span> 단축키</div>
                    <div style={guideItemStyle}>
                      <div style={guideRowStyle}><kbd style={kbdStyle}>Shift</kbd><span> + 드래그 : <span style={highlightTextStyle}>분해</span></span></div>
                      <div style={guideRowStyle}><kbd style={kbdStyle}>F</kbd><span>전체화면</span></div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {viewMode === 'edit' && (
              <div style={guideWrapperStyle}>
                <button onClick={() => setShowEditGuide(!showEditGuide)} style={guideToggleBtnStyle}>
                   {showEditGuide ? '▽ 편집 가이드 닫기' : '△ 편집 가이드 열기'}
                </button>
                {showEditGuide && (
                  <div style={guideContentStyle}>
                    <div style={guideSectionTitleStyle}>🛠️ 편집 모드 조작</div>
                    <div style={guideItemStyle}>
                      <div style={guideRowStyle}><span>🖱️ 좌클릭 : <span style={highlightTextStyle}>부품 선택</span></span></div>
                      <div style={guideRowStyle}><span>🖱️ 드래그 : <span style={highlightTextStyle}>부품 이동</span></span></div>
                    </div>
                    <div style={dividerStyle} />
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>빈 공간 클릭 시 선택 해제</div>
                  </div>
                )}
              </div>
            )}

            {viewMode === 'single' ? (
              <div style={singleModeContainerStyle}>
                <div id="part-list-sidebar" style={singleSidebarStyle}>
                  {currentModel.parts
                    .filter((p: any, index: number, self: any[]) => 
                      p.thumbnail && p.thumbnail.trim() !== "" &&
                      self.findIndex(t => t.thumbnail === p.thumbnail) === index
                    )
                    .map((p: any) => (
                      <div key={p.id} style={singleSidebarItemStyle(activeSinglePartId === p.id)} onClick={() => setActiveSinglePartId(p.id)}>
                        <img src={p.thumbnail} style={sidebarThumbStyle} alt={p.id} />
                      </div>
                    ))}
                </div>
                <div style={singleViewerAreaStyle}>
                    <ViewerCanvas 
                      key="viewer-single" // Key를 주어 탭 이동 시 확실히 재부팅
                      ref={viewerRef} 
                      model={currentModel} 
                      ghost={false} 
                      selectedPartId={activeSinglePartId} 
                      onSelectPart={setActiveSinglePartId} 
                      isExpanded={isExpanded} 
                      mode={'single'} 
                    />
                    <div style={centerPartLabelStyle}>{activeSinglePartId || "Select a Part"}</div>
                </div>
                <div style={singleInfoPanelStyle}>
                    <div style={infoBoxStyle}>
                        <h3 style={partNameTitleStyle}>{activeSinglePartId || "Select a Part"}</h3>
                        <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '12px 0' }} />
                        <h4 style={infoTitleStyle}>설명 (Description)</h4>
                        <p style={infoContentStyle}>{activeSinglePartId ? `${activeSinglePartId} 부품 상세 설명입니다.` : "목록에서 부품을 선택하세요."}</p>
                    </div>
                </div>
              </div>
            ) : (
              <ViewerCanvas
                key="viewer-multi" // Key를 분리하여 단일 모드와 섞이지 않게 함
                ref={viewerRef}
                model={currentModel}
                ghost={ghost} 
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
            {/* AI Assistant 섹션에 flex: 1을 주어 메모가 줄어들면 확장되게 합니다. */}
            <section style={{ ...panelCardStyle, flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ ...panelTitleStyle, marginBottom: 0 }}>AI Assistant</h3>
                <div style={statusDotStyle(!!(selectedPartId || activeSinglePartId))} />
              </div>
              {/* AI 내용 영역도 남은 공간을 채우도록 설정 */}
              <div style={{ ...aiStatusStyle, flex: 1, alignItems: 'flex-start' }}>
                <span style={{ fontSize: '14px', color: (selectedPartId || activeSinglePartId) ? '#e2e8f0' : '#64748b' }}>
                  {(viewMode === 'single' ? activeSinglePartId : selectedPartId) 
                    ? `Ready to analyze ${viewMode === 'single' ? activeSinglePartId : selectedPartId}` 
                    : '부품을 선택하면 분석이 시작됩니다.'}
                </span>
              </div>
              {viewMode !== 'single' && (
                <div style={{ ...optionRowStyle, marginTop: '16px' }}>
                  <label style={checkboxLabelStyle}>
                    <input type="checkbox" checked={ghost} onChange={(e) => setGhost(e.target.checked)} style={{ accentColor: '#38bdf8' }} /> 
                    <span style={{ fontSize: '13px', color: '#94a3b8' }}>Ghost Mode 활성화</span>
                  </label>
                </div>
              )}
            </section>

            {/* Memo 섹션: 닫혔을 때(isMemoOpen: false) 높이를 고정하여 바닥으로 밀어냅니다. */}
            <section style={{ 
              ...memoSectionStyle, 
              flex: isMemoOpen ? 1 : '0 0 auto', 
              maxHeight: isMemoOpen ? 'none' : '60px', // 타이틀만 보일 정도의 높이
              transition: 'all 0.3s ease' // 부드러운 전환 효과
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isMemoOpen ? '16px' : 0 }}>
                <h3 style={{ ...panelTitleStyle, marginBottom: 0 }}>Memo</h3>
                <button onClick={() => setIsMemoOpen(!isMemoOpen)} style={memoToggleBtnStyle}>
                  {isMemoOpen ? '−' : '＋'}
                </button>
              </div>
              {isMemoOpen && (
                <div style={memoInnerWrapperStyle}>
                  <textarea 
                    style={memoBoxStyle(isEditing)} 
                    placeholder="학습 내용을 기록하세요." 
                    value={memoText}
                    onChange={(e) => setMemoText(e.target.value)}
                    readOnly={!isEditing}
                  />
                  <div style={{ display: 'flex', justifyContent: 'center', marginTop: '12px' }}>
                    <button onClick={() => setIsEditing(!isEditing)} style={memoSaveBtnStyle(isEditing)}>
                      {isEditing ? '저장하기' : '수정하기'}
                    </button>
                  </div>
                </div>
              )}
            </section>
          </aside>
        )}
      </main>
    </div>
  )
}

// ---------------------------------------------------------
// 스타일 정의 (가시성을 위해 줄바꿈 보강)
// ---------------------------------------------------------

const containerStyle: React.CSSProperties = {
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  background: 'radial-gradient(circle at center, #1e293b 0%, #080c14 100%)',
  paddingTop: '60px',
  boxSizing: 'border-box',
};

const mainLayoutStyle = (isExpanded: boolean): React.CSSProperties => ({
  flex: 1,
  display: 'grid',
  gridTemplateColumns: isExpanded ? '1fr' : '1fr 340px',
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
  minWidth: 0,
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
  overflow: 'hidden',
  background: '#0f172a', 
};

const singleModeContainerStyle: React.CSSProperties = {
  display: 'flex',
  height: '100%',
  position: 'relative',
  overflow: 'hidden',
};

const singleSidebarStyle: React.CSSProperties = {
  width: '100px',
  background: 'rgba(2, 6, 23, 0.5)',
  borderRight: '1px solid #1e293b',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  padding: '12px',
  overflowY: 'auto',
  overflowX: 'hidden',
  flexShrink: 0,
};

const singleSidebarItemStyle = (isActive: boolean): React.CSSProperties => ({
  width: '100%',
  aspectRatio: '1 / 1',
  borderRadius: '12px',
  overflow: 'hidden',
  border: isActive ? '2px solid #3b82f6' : '1px solid #334155',
  cursor: 'pointer',
  opacity: isActive ? 1 : 0.85,
  background: 'linear-gradient(145deg, #020617, #0f172a)',
  flexShrink: 0,
  boxSizing: 'border-box',
  transition: 'all 0.2s ease',
});

const sidebarThumbStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
};

const singleViewerAreaStyle: React.CSSProperties = {
  flex: 1,
  position: 'relative',
  minWidth: 0,
  overflow: 'hidden',
};

const centerPartLabelStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: '20px',
  left: '50%',
  transform: 'translateX(-50%)',
  background: 'rgba(15, 23, 42, 0.8)',
  padding: '8px 20px',
  borderRadius: '20px',
  color: '#fff',
  fontWeight: 600,
  border: '1px solid #334155',
};

const singleInfoPanelStyle: React.CSSProperties = {
  width: '240px',
  borderLeft: '1px solid #1e293b',
  background: 'rgba(15, 23, 42, 0.3)',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  padding: '16px',
  flexShrink: 0,
};

const infoBoxStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.05)',
  borderRadius: '12px',
  padding: '16px',
  flex: 1,
  border: '1px solid rgba(255, 255, 255, 0.1)',
  display: 'flex',
  flexDirection: 'column',
};

const partNameTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '20px',
  fontWeight: 700,
  color: '#38bdf8',
};

const infoTitleStyle: React.CSSProperties = {
  margin: '0 0 8px 0',
  fontSize: '13px',
  fontWeight: 600,
  color: '#94a3b8',
  textTransform: 'uppercase',
};

const infoContentStyle: React.CSSProperties = {
  fontSize: '13px',
  color: '#94a3b8',
  lineHeight: 1.5,
};

const rightPanelStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
  height: '100%',
  minWidth: '340px',
  overflow: 'hidden',
};

const panelCardStyle: React.CSSProperties = {
  background: 'rgba(15, 23, 42, 0.4)',
  borderRadius: '24px',
  padding: '20px',
  border: '1px solid #1e293b',
  backdropFilter: 'blur(10px)',
};

const panelTitleStyle: React.CSSProperties = {
  fontSize: '15px',
  fontWeight: 600,
  marginBottom: '16px',
  color: '#38bdf8',
  letterSpacing: '0.5px',
};

const aiStatusStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  padding: '16px',
  background: 'rgba(2, 6, 23, 0.6)',
  borderRadius: '16px',
  border: '1px solid rgba(56, 189, 248, 0.2)',
};

const statusDotStyle = (active: boolean): React.CSSProperties => ({
  width: '10px',
  height: '10px',
  borderRadius: '50%',
  background: active ? '#10b981' : '#334155',
  boxShadow: active ? '0 0 10px #10b981' : 'none',
});

const memoSectionStyle: React.CSSProperties = {
  background: 'rgba(15, 23, 42, 0.4)',
  borderRadius: '24px',
  padding: '20px',
  border: '1px solid #1e293b',
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  minHeight: 0,
};

const memoInnerWrapperStyle: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  minHeight: 0,
};

const memoBoxStyle = (isEditing: boolean): React.CSSProperties => ({
  flex: 1,
  width: '100%',
  boxSizing: 'border-box',
  background: isEditing ? '#0b1120' : 'rgba(15, 23, 42, 0.2)',
  border: isEditing ? '1px solid #3b82f6' : '1px solid #1e293b',
  borderRadius: '16px',
  padding: '16px',
  color: isEditing ? '#e2e8f0' : '#94a3b8',
  fontSize: '14px',
  resize: 'none',
  outline: 'none',
  transition: 'all 0.3s ease',
});

const memoSaveBtnStyle = (isEditing: boolean): React.CSSProperties => ({
  borderRadius: '10px',
  fontWeight: 600,
  cursor: 'pointer',
  background: isEditing ? '#3b82f6' : 'rgba(30, 41, 59, 0.5)',
  border: isEditing ? 'none' : '1px solid #334155',
  color: '#fff',
  transition: 'all 0.2s',
  width: '120px',
  padding: '10px 0',
  fontSize: '13px'
});

const memoToggleBtnStyle: React.CSSProperties = {
  background: 'rgba(56, 189, 248, 0.1)',
  border: '1px solid rgba(56, 189, 248, 0.2)',
  color: '#38bdf8',
  borderRadius: '6px',
  width: '28px',
  height: '28px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  fontSize: '18px',
  padding: 0,
  transition: 'all 0.2s'
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
  display: 'flex',
  alignItems: 'center',
};

const guideContentStyle: React.CSSProperties = {
  background: 'rgba(15, 23, 42, 0.9)',
  backdropFilter: 'blur(12px)',
  border: '1px solid #1e293b',
  borderRadius: '16px',
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  width: '240px',
  boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
};

const guideSectionTitleStyle: React.CSSProperties = {
  fontSize: '13px',
  fontWeight: 700,
  color: '#e2e8f0',
  marginBottom: '12px',
  display: 'flex',
  alignItems: 'center',
};

const guideItemStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const guideRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  fontSize: '12px',
  color: '#cbd5e1',
};

const guideIconStyle: React.CSSProperties = {
  fontSize: '14px',
  width: '20px',
  textAlign: 'center',
};

const highlightTextStyle: React.CSSProperties = {
  color: '#38bdf8',
  fontWeight: 600,
};

const kbdStyle: React.CSSProperties = {
  background: '#334155',
  border: '1px solid #475569',
  borderRadius: '4px',
  padding: '2px 6px',
  fontSize: '11px',
  fontWeight: 700,
  color: '#fff',
  boxShadow: '0 2px 0 #1e293b',
  minWidth: '24px',
  textAlign: 'center',
  display: 'inline-block',
};

const dividerStyle: React.CSSProperties = {
  height: '1px',
  background: '#334155',
  margin: '12px 0',
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

function Tab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ padding: '8px 16px', borderRadius: '10px', border: 'none', background: active ? '#3b82f6' : 'rgba(15, 23, 42, 0.5)', color: active ? '#fff' : '#64748b', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>{label}</button>
  )
}