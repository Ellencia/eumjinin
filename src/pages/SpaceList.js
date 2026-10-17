import { useState } from 'react';
import { Link } from 'react-router-dom';
import spaces from '../data/spaces';

const FILTERS = ['전체', '무대', '연습실'];
const typeLabel = { stage: '무대', rehearsal: '연습실' };
const typeColor = { stage: '#7c3aed', rehearsal: '#0ea5e9' };

// 홈 섹션(Spaces.js)과 공유
export function SpaceCard({ space }) {
  const isComingSoon = space.name === '준비중';

  if (isComingSoon) {
    return (
      <div className="space-card space-card-coming">
        <span className="space-badge" style={{ background: typeColor[space.type] }}>
          {typeLabel[space.type]}
        </span>
        <div className="space-coming-badge">준비중</div>
        <h3 className="space-name">—</h3>
        <p className="space-desc">새로운 공간이 곧 공개됩니다.</p>
      </div>
    );
  }

  return (
    <Link to={`/spaces/${space.id}`} className="space-card space-card-link">
      <span className="space-badge" style={{ background: typeColor[space.type] }}>
        {typeLabel[space.type]}
      </span>
      <h3 className="space-name">{space.name}</h3>
      <p className="space-desc">{space.desc}</p>
      <p className="space-capacity">최대 {space.capacity}인</p>
      <div className="space-tags">
        {space.tags.map((t) => (
          <span className="tag" key={t}>#{t}</span>
        ))}
      </div>
      <span className="space-card-arrow">자세히 보기 →</span>
    </Link>
  );
}

function SpaceList() {
  const [filter, setFilter] = useState('전체');

  const filtered = spaces.filter((s) => {
    if (filter === '전체') return true;
    if (filter === '무대') return s.type === 'stage';
    return s.type === 'rehearsal';
  });

  return (
    <section className="spaces spaces-page">
      <div className="section-container">
        <p className="spaces-breadcrumb">
          <Link to="/">홈</Link> &rsaquo; 공간 안내
        </p>
        <h2 className="section-title">공간 안내</h2>
        <p className="section-sub">
          정기 공연이 열리는 Art Hall K를 소개합니다. 연습실은 준비 중입니다.
        </p>
        <div className="filter-tabs">
          {FILTERS.map((f) => (
            <button
              key={f}
              className={`filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="spaces-grid">
          {filtered.map((s) => (
            <SpaceCard key={s.id} space={s} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default SpaceList;
