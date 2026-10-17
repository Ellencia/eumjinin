import { useState } from 'react';
import spaces from '../data/spaces';
import Reveal from '../components/Reveal';
import { SpaceCard } from './SpaceList';

const FILTERS = ['전체', '무대', '연습실'];

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
            정기 공연이 열리는 Art Hall K를 소개합니다. 연습실은 준비 중입니다.
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
