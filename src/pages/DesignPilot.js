import { useMemo, useState } from 'react';
import stage1 from '../assets/stage1.webp';
import stage2 from '../assets/stage2.webp';
import stage3 from '../assets/stage3.webp';
import hall1 from '../assets/hallk1.webp';
import hall2 from '../assets/hallk2.webp';

const designs = [
  { id: 'classic', name: 'Classic Hall', tone: '정돈된 공연장', image: stage1, accent: '#7c3aed', layout: 'center' },
  { id: 'club', name: 'Live Club', tone: '강한 라이브 에너지', image: stage2, accent: '#ef4444', layout: 'split' },
  { id: 'studio', name: 'Studio Warm', tone: '연습실 중심의 따뜻함', image: hall1, accent: '#d97706', layout: 'panel' },
  { id: 'archive', name: 'Archive', tone: '활동 기록 중심', image: hall2, accent: '#0f766e', layout: 'editorial' },
  { id: 'minimal', name: 'Minimal', tone: '정보 우선 미니멀', image: stage3, accent: '#111827', layout: 'center' },
  { id: 'poster', name: 'Poster', tone: '공연 포스터 감성', image: stage1, accent: '#be185d', layout: 'split' },
  { id: 'neon', name: 'Neon Night', tone: '야간 공연 분위기', image: stage2, accent: '#06b6d4', layout: 'panel' },
  { id: 'community', name: 'Community', tone: '멤버 모집 중심', image: hall1, accent: '#16a34a', layout: 'editorial' },
  { id: 'premium', name: 'Premium Hall', tone: '대관/공간 신뢰감', image: hall2, accent: '#b45309', layout: 'center' },
  { id: 'festival', name: 'Festival', tone: '프로젝트와 행사 중심', image: stage3, accent: '#ea580c', layout: 'split' },
];

function DesignHero({ design }) {
  return (
    <div className={`design-stage design-${design.layout}`} style={{ '--design-accent': design.accent }}>
      <img src={design.image} alt="" className="design-stage-img" />
      <div className="design-stage-overlay" />
      <div className="design-stage-content">
        <p className="design-kicker">{design.tone}</p>
        <h2>음악이 시작되는 모든 이들을 위한 공간</h2>
        <p>
          연습실 예약, 멤버 신청, 공연 프로젝트를 한 흐름에서 보여주는
          음진인 홈페이지 시안입니다.
        </p>
        <div className="design-actions">
          <span>공간 보기</span>
          <span>멤버 신청</span>
        </div>
      </div>
      <div className="design-mini-panel">
        <strong>{design.name}</strong>
        <span>공간 · 커뮤니티 · 프로젝트</span>
      </div>
    </div>
  );
}

function DesignPilot() {
  const [selectedId, setSelectedId] = useState(designs[0].id);
  const selected = useMemo(
    () => designs.find((design) => design.id === selectedId) || designs[0],
    [selectedId]
  );

  return (
    <section className="design-page">
      <div className="design-shell">
        <div className="design-toolbar">
          <div>
            <p className="page-eyebrow">Pilot</p>
            <h1>홈페이지 디자인 시안</h1>
          </div>
          <p>파일럿 기간 동안 한 주소에서 10개 방향을 전환해 비교합니다.</p>
        </div>

        <div className="design-tabs" aria-label="디자인 시안 선택">
          {designs.map((design, index) => (
            <button
              key={design.id}
              className={`design-tab ${selected.id === design.id ? 'active' : ''}`}
              onClick={() => setSelectedId(design.id)}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              {design.name}
            </button>
          ))}
        </div>

        <DesignHero design={selected} />
      </div>
    </section>
  );
}

export default DesignPilot;
