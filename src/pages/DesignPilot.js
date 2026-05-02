import { useDesign } from '../contexts/DesignContext';

const DESIGNS = [
  { id: 'default', name: 'Current', tone: '현재 React 앱', color: '#7c3aed', bg: '#0a051e' },
  { id: 'v1', name: 'Vinyl & Zine', tone: '빈티지 바이닐 · 사이드바 네비게이션', color: '#D4A437', bg: '#2A0509' },
  { id: 'v2', name: 'DIY Punk', tone: 'DIY 펑크 포스터 · 스크롤형', color: '#d72b1f', bg: '#0e0e0c' },
  { id: 'v3', name: 'Editorial', tone: '에디토리얼 매거진 (준비중)', color: '#555', bg: '#222', disabled: true },
  { id: 'v4', name: 'Indie Folk', tone: '인디 · 포크 (준비중)', color: '#555', bg: '#222', disabled: true },
  { id: 'v5', name: 'Live Club', tone: '라이브 클럽 (준비중)', color: '#555', bg: '#222', disabled: true },
  { id: 'v6', name: 'Korean Modern', tone: '한국 모던 (준비중)', color: '#555', bg: '#222', disabled: true },
  { id: 'v7', name: 'Organic', tone: '자연 · 한지 (준비중)', color: '#555', bg: '#222', disabled: true },
];

function DesignPilot() {
  const { design, setDesign } = useDesign();

  return (
    <section className="design-page">
      <div className="design-shell">
        <div className="design-toolbar">
          <div>
            <p className="page-eyebrow">Pilot</p>
            <h1>홈페이지 디자인 시안</h1>
          </div>
          <p>시안을 선택하면 전체 사이트가 해당 디자인으로 렌더링됩니다.</p>
        </div>

        <div className="design-cards-grid">
          {DESIGNS.map((d) => (
            <button
              key={d.id}
              className={`design-select-card ${design === d.id ? 'active' : ''} ${d.disabled ? 'disabled' : ''}`}
              onClick={() => !d.disabled && setDesign(d.id)}
              disabled={d.disabled}
            >
              <div className="design-card-preview" style={{ background: d.bg }}>
                {design === d.id && <span className="design-card-active-badge">● 현재</span>}
                <span className="design-card-name" style={{ color: d.color }}>{d.name}</span>
              </div>
              <div className="design-card-info">
                <strong>{d.name}</strong>
                <span>{d.tone}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export default DesignPilot;
