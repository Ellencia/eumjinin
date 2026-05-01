import { useState } from 'react';
import { Link } from 'react-router-dom';
import spaces from '../data/spaces';
import Reveal from '../components/Reveal';

const FILTERS = ['전체', '무대', '연습실'];

const typeLabel = { stage: '무대', rehearsal: '연습실' };
const typeColor = { stage: '#7c3aed', rehearsal: '#0ea5e9' };

function SpaceCard({ space }) {
  const color = typeColor[space.type];
  const label = typeLabel[space.type];
  return (
    <Link to={`/spaces/${space.id}`} className="space-card space-card-link">
      <span className="space-badge" style={{ background: color }}>{label}</span>
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

function Spaces() {
  const [filter, setFilter] = useState('전체');

  const filtered = spaces.filter((s) => {
    if (filter === '전체') return true;
    if (filter === '무대') return s.type === 'stage';
    return s.type === 'rehearsal';
  });

  return (
    <section className="spaces" id="spaces">
      <div className="section-container">
        <Reveal>
          <h2 className="section-title">공간 안내</h2>
          <p className="section-sub">
            공연 무대부터 녹음 부스까지, 다양한 공간을 멤버에게 제공합니다.
          </p>
        </Reveal>
        <Reveal delay={100}>
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
        </Reveal>
        <div className="spaces-grid">
          {filtered.map((s, i) => (
            <Reveal key={s.id} delay={i * 80}>
              <SpaceCard space={s} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Spaces;
