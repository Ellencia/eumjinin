import { Link } from 'react-router-dom';
import spaces from '../data/spaces';
import Reveal from '../components/Reveal';
import hallk1 from '../assets/thumbs/hallk1.webp';

// 홈 섹션 대표 사진 (800px 썸네일)
const COVER = { 6: hallk1 };
const kicker = { stage: 'STAGE · 공연장', rehearsal: 'REHEARSAL · 연습실' };
const soonLabel = { stage: '무대 준비 중', rehearsal: '연습실 준비 중' };

// 시안 A: 운영 중인 공간은 큰 카드, '준비중' 자리는 아래 점선 칸
function Spaces() {
  const open = spaces.filter((s) => s.name !== '준비중');
  const soon = spaces.filter((s) => s.name === '준비중');

  return (
    <section className="sp" id="spaces">
      <div className="sp-inner">
        <Reveal>
          <div className="sp-head">
            <div>
              <p className="sp-kicker">SPACES · 공간 안내</p>
              <h2 className="sp-title">음진인의 무대</h2>
            </div>
            <p>매달 정기 공연이 열리는 Art Hall K. 무대와 연습실은 더 준비하고 있습니다.</p>
          </div>
        </Reveal>

        {open.map((s) => (
          <Reveal key={s.id} delay={100}>
            <Link to={`/spaces/${s.id}`} className="sp-feat">
              <div className="sp-photo">
                {COVER[s.id] && <img src={COVER[s.id]} alt={`${s.name} 공연 사진`} loading="lazy" />}
              </div>
              <div className="sp-body">
                <span className="sp-tag">{kicker[s.type]}</span>
                <h3>{s.name}</h3>
                {s.lead && <p className="sp-lead">{s.lead}</p>}
                {s.spec && (
                  <dl>
                    {[...s.spec, ...(s.location ? [['위치', s.location]] : [])].map(([k, v]) => (
                      <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
                    ))}
                  </dl>
                )}
                <span className="sp-more">자세히 보기 →</span>
              </div>
            </Link>
          </Reveal>
        ))}

        {soon.length > 0 && (
          <Reveal delay={200}>
            <ul className="sp-soon" aria-label="준비 중인 공간">
              {soon.map((s) => (
                <li key={s.id}><b>{s.type.toUpperCase()}</b>{soonLabel[s.type]}</li>
              ))}
            </ul>
          </Reveal>
        )}
      </div>
    </section>
  );
}

export default Spaces;
