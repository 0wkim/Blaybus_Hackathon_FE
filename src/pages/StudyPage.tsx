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
  
  // 단일 부품 모드에서 현재 선택된 부품 ID (기본값: 첫 번째 부품)
  const [activeSinglePartId, setActiveSinglePartId] = useState<string | null>(null)

  const [ghost, setGhost] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showGuide, setShowGuide] = useState(true) 
  const [showAssemblyGuide, setShowAssemblyGuide] = useState(true)

  // ▼ 수정된 코드: 무조건 초기화(null)만 수행
  useEffect(() => {
    setSelectedPartId(null);      // 시뮬레이터 모드 선택 초기화
    setActiveSinglePartId(null);  // 단일 부품 모드 선택 초기화 (자동 선택 로직 삭제)
  }, [modelId]);

  useEffect(() => {
    document.body.style.margin = '0'
    document.body.style.background = 'radial-gradient(circle at center, #1e293b 0%, #080c14 100%)'
  }, [])

  // [수정 1] 확장/축소 시 캔버스 크기 재계산을 위해 resize 이벤트 강제 발생
  useEffect(() => {
    // 레이아웃 전환 애니메이션 등을 고려하여 약간의 지연 후 실행
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 50); // 0.05초 후 리사이징 알림

    return () => clearTimeout(timer);
  }, [isExpanded]);

  // 단일 부품 모드에서 선택된 부품 객체 찾기
  const activeSinglePart = currentModel.parts.find((p: any) => p.id === activeSinglePartId)

  return (
    <div style={containerStyle}>
      <Header />
      
      <main style={mainLayoutStyle(isExpanded)}>
        <section style={viewerPanelStyle}>
          {/* 상단 탭 메뉴 */}
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
            {/* 줌 컨트롤 (단일 부품 모드가 아닐 때만 혹은 필요시 표시) */}
            {viewMode !== 'single' && (
              <div style={zoomControlsStyle}>
                <button style={zoomBtnStyle} onClick={() => viewerRef.current?.zoomIn()}>＋</button>
                <button style={zoomBtnStyle} onClick={() => viewerRef.current?.zoomOut()}>－</button>
                <button style={zoomResetBtnStyle} onClick={() => viewerRef.current?.resetCamera()}>⟲</button>
              </div>
            )}

            {/* 안내 메시지들 (기존 코드 유지) */}
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
                 {/* ...기존 시뮬레이터 가이드 코드... */}
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

            {/* =========================================================
                [수정됨] 단일 부품 뷰 모드 레이아웃 (스케치 반영)
               ========================================================= */}
            {viewMode === 'single' ? (
              <div style={singleModeContainerStyle}>
                
                {/* 1. 왼쪽: 부품 목록 리스트 (Sidebar) */}
                <div style={singleSidebarStyle}>
                  {currentModel.parts
                    .filter((p: any, index: number, self: any[]) => 
                      p.thumbnail && p.thumbnail.trim() !== "" &&
                      self.findIndex(t => t.thumbnail === p.thumbnail) === index
                    )
                    .map((p: any) => (
                      <div 
                        key={p.id} 
                        style={singleSidebarItemStyle(activeSinglePartId === p.id)} 
                        onClick={() => setActiveSinglePartId(p.id)}
                      >
                        <img src={p.thumbnail} style={sidebarThumbStyle} alt={p.id} />
                      </div>
                    ))}
                </div>

                {/* 2. 중앙: 3D 뷰어 (현재 선택된 부품만 강조하거나 보여줌) */}
                <div style={singleViewerAreaStyle}>
                    {/* 뷰어를 여기에 렌더링. selectedPartId를 강제로 주입하여 해당 부품만 보여주거나 강조 */}
                    <ViewerCanvas
                        ref={viewerRef}
                        model={currentModel}
                        ghost={true} // 나머지는 투명하게
                        selectedPartId={activeSinglePartId} // 선택된 부품 강조
                        onSelectPart={setActiveSinglePartId}
                        isExpanded={isExpanded}
                        mode={'single'} // 뷰어 내부에서 single 모드 처리 필요 (카메라 포커싱 등)
                    />
                    
                    {/* 부품 이름 오버레이 (스케치의 '부품' 글자 위치) */}
                    <div style={centerPartLabelStyle}>
                        {activeSinglePartId || "Select a Part"}
                    </div>
                </div>

                {/* 3. 오른쪽 오버레이: 설명 & 수치 패널 */}
                <div style={singleInfoPanelStyle}>
                    {/* 설명 박스 */}
                    <div style={infoBoxStyle}>
                        {/* [수정] 여기에 부품 이름을 크게 표시합니다 */}
                        <h3 style={partNameTitleStyle}>
                            {activeSinglePartId || "Select a Part"}
                        </h3>
                        
                        {/* 구분선 */}
                        <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '12px 0' }} />

                        <h4 style={infoTitleStyle}>설명 (Description)</h4>
                        <p style={infoContentStyle}>
                            {activeSinglePartId 
                                ? `${activeSinglePartId} 부품입니다. 상세 설명이 이곳에 표시됩니다.` 
                                : "목록에서 부품을 선택해주세요."}
                        </p>
                    </div>
                    <div style={infoBoxStyle}>
                        <h4 style={infoTitleStyle}>수치 (Specs)</h4>
                        <div style={specGridStyle}>
                            <div style={specItemStyle}><span>Width</span> <span>24mm</span></div>
                            <div style={specItemStyle}><span>Weight</span> <span>120g</span></div>
                            <div style={specItemStyle}><span>Material</span> <span>Alloy</span></div>
                        </div>
                    </div>
                </div>

              </div>
            ) : (
              // 조립도/시뮬레이터 모드일 때 기존 뷰어
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

        {/* 4. 맨 오른쪽: AI Assistant & Memo (기존 유지 - 스케치의 우측 패널) */}
        {!isExpanded && (
          <aside style={rightPanelStyle}>
            <section style={panelCardStyle}>
              <h3 style={panelTitleStyle}>AI Assistant</h3>
              <div style={aiStatusStyle}>
                <div style={statusDotStyle(!!(selectedPartId || activeSinglePartId))} />
                <span style={{ fontSize: '14px', color: '#94a3b8' }}>
                   {/* 단일 모드일 땐 activeSinglePartId, 아니면 selectedPartId 표시 */}
                  {(viewMode === 'single' ? activeSinglePartId : selectedPartId) 
                    ? `Analyzing: ${viewMode === 'single' ? activeSinglePartId : selectedPartId}` 
                    : 'Select a part to analyze...'}
                </span>
              </div>
              <div style={{ marginTop: '16px', height: '100px', border: '1px dashed #334155', borderRadius: '8px' }}>
                {/* AI 채팅 내용 Placeholder */}
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
   STYLES (기존 스타일 + 추가된 단일 모드 스타일)
   ============================================================= */

/* ... (기존 containerStyle, mainLayoutStyle 등 상단 스타일은 그대로 유지) ... */
const containerStyle: React.CSSProperties = {
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  background: 'radial-gradient(circle at center, #1e293b 0%, #080c14 100%)',
};

const mainLayoutStyle = (isExpanded: boolean): React.CSSProperties => ({
  flex: 1,
  display: 'grid',
  // [수정] 오른쪽 패널 크기를 320px -> 300px 정도로 살짝 줄여 여유 확보 추천
  gridTemplateColumns: isExpanded ? '1fr' : '1fr 320px', 
  padding: '20px',
  gap: '20px',
  overflow: 'hidden', // 전체 스크롤 방지
  transition: 'grid-template-columns 0.3s ease', // 부드러운 전환 효과 (선택사항)
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
  
  // [수정 2] ★★★ 이 속성이 없으면 캔버스가 그리드를 뚫고 나갑니다! ★★★
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
    background: 'transparent',
    overflow: 'hidden',
};

/* --- [NEW] 단일 부품 모드 전용 스타일 --- */

const singleModeContainerStyle: React.CSSProperties = {
    display: 'flex',
    height: '100%',
    position: 'relative',
};

// 1. 왼쪽 사이드바 (리스트)
const singleSidebarStyle: React.CSSProperties = {
    width: '100px', 
    background: 'rgba(2, 6, 23, 0.5)',
    borderRight: '1px solid #1e293b',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '16px 10px',
    overflowY: 'auto',
    zIndex: 10,
    
    // [핵심 수정 1] 화면이 좁아져도 절대 찌그러지지 않게 고정
    flexShrink: 0, 
};

const singleSidebarItemStyle = (isActive: boolean): React.CSSProperties => ({
    width: '100%',
    aspectRatio: '1/1',
    borderRadius: '12px',
    overflow: 'hidden',
    border: isActive ? '2px solid #3b82f6' : '1px solid #334155',
    cursor: 'pointer',
    opacity: isActive ? 1 : 0.6,
    transition: 'all 0.2s',
    boxSizing: 'border-box',
    background: '#0f172a',
});

const sidebarThumbStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
};

// 2. 중앙 뷰어 영역
const singleViewerAreaStyle: React.CSSProperties = {
    flex: 1,
    position: 'relative',
    background: 'transparent',
    
    // [핵심 수정 3] 부모 공간이 줄어들면 같이 줄어들 수 있도록 허용
    // 이게 없으면 내용물(3D Canvas) 크기만큼 버티느라 양옆을 밀어냅니다.
    minWidth: 0, 
    overflow: 'hidden', // 넘치는 부분 자르기
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
    pointerEvents: 'none',
    border: '1px solid #334155',
};

// 2. 오른쪽 정보 패널 (설명/수치)
const singleInfoPanelStyle: React.CSSProperties = {
    width: '240px',
    borderLeft: '1px solid #1e293b',
    background: 'rgba(15, 23, 42, 0.3)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '16px',
    zIndex: 10,
    
    // [핵심 수정 2] 화면이 좁아져도 절대 찌그러지지 않게 고정
    flexShrink: 0,
};

const infoBoxStyle: React.CSSProperties = {
    background: 'rgba(255, 255, 255, 0.05)', // 스케치의 회색 박스 느낌
    borderRadius: '12px',
    padding: '16px',
    flex: 1, // 상하 등분
    border: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'flex',
    flexDirection: 'column',
};

// [새로 추가] 부품 이름용 큰 제목 스타일
const partNameTitleStyle: React.CSSProperties = {
    margin: 0,
    fontSize: '20px',
    fontWeight: 700,
    color: '#38bdf8', // 하늘색 포인트 컬러
    wordBreak: 'break-word', // 이름이 길면 줄바꿈
};

// [수정] 소제목(설명, 수치) 스타일
const infoTitleStyle: React.CSSProperties = {
    margin: '0 0 8px 0',
    fontSize: '13px',
    fontWeight: 600,
    color: '#94a3b8', // 연한 회색으로 변경하여 위계 구분
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
};

const infoContentStyle: React.CSSProperties = {
    fontSize: '13px',
    color: '#94a3b8',
    lineHeight: 1.5,
};

const specGridStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
};

const specItemStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    color: '#e2e8f0',
    borderBottom: '1px dashed #334155',
    paddingBottom: '4px',
};

/* --- 기존 우측 패널 및 기타 스타일 유지 --- */
const rightPanelStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
  height: '100%',
  minHeight: 0,
  overflow: 'hidden',
  
  // [수정 3] 패널이 찌그러지지 않도록 최소 너비 보장
  minWidth: '320px', 
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
};
const memoInnerWrapperStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    minHeight: 0,
};
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