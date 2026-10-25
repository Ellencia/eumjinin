import { Fragment, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import spaces from '../data/spaces';

// 원본(2000px)은 라이트박스, thumbs/(800px, make_thumbs.py 산출)는 갤러리 격자용
import hallk1 from '../assets/hallk1.webp';
import hallk2 from '../assets/hallk2.webp';
import hallk3 from '../assets/hallk3.webp';
import hallk4 from '../assets/hallk4.webp';
import hallk5 from '../assets/hallk5.webp';
import hallk1t from '../assets/thumbs/hallk1.webp';
import hallk2t from '../assets/thumbs/hallk2.webp';
import hallk3t from '../assets/thumbs/hallk3.webp';
import hallk4t from '../assets/thumbs/hallk4.webp';
import hallk5t from '../assets/thumbs/hallk5.webp';

const SPACE_IMAGES = {
  6: { full: [hallk1, hallk2, hallk3, hallk4, hallk5], thumb: [hallk1t, hallk2t, hallk3t, hallk4t, hallk5t] },
};

const kicker = { stage: 'STAGE · 공연장', rehearsal: 'REHEARSAL · 연습실' };
const pad = (n) => String(n).padStart(2, '0');

export function Lightbox({ images, index, onClose }) {
  const [current, setCurrent] = useState(index);

  const prev = (e) => { e?.stopPropagation(); setCurrent((c) => (c - 1 + images.length) % images.length); };
  const next = (e) => { e?.stopPropagation(); setCurrent((c) => (c + 1) % images.length); };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [images.length, onClose]); // eslint-disable-line react-hooks/exhaustive-deps

  // 양옆 원본 미리 받기
  useEffect(() => {
    [current - 1, current + 1].forEach((i) => { new Image().src = images[(i + images.length) % images.length]; });
  }, [current, images]);

  const many = images.length > 1; // 한 장(신고확인증 등)이면 화살표·카운터 없음
  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <button className="lightbox-close" onClick={onClose}>✕</button>
      {many && <button className="lightbox-arrow lightbox-prev" onClick={prev}>&#8249;</button>}
      <img
        src={images[current]}
        alt={`${current + 1}`}
        className="lightbox-img"
        onClick={(e) => e.stopPropagation()}
      />
      {many && <button className="lightbox-arrow lightbox-next" onClick={next}>&#8250;</button>}
      {many && <p className="lightbox-counter">{current + 1} / {images.length}</p>}
    </div>
  );
}

// 큰 사진 하나 + 썸네일 줄. 썸네일은 큰 사진만 바꾸고, 큰 사진을 누르면 라이트박스
function SpaceGallery({ images, name }) {
  const [idx, setIdx] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  return (
    <section className="sd-photos" aria-label="사진">
      <button type="button" className="sd-main" onClick={() => setLightboxIndex(idx)} aria-label="크게 보기">
        <img src={images.full[idx]} alt={`${name} 사진 ${idx + 1}`} />
        <span className="sd-counter">{pad(idx + 1)} / {pad(images.full.length)}</span>
      </button>
      <div className="sd-thumbs">
        {images.thumb.map((src, k) => (
          <button key={k} type="button" aria-label={`사진 ${k + 1} 보기`} aria-pressed={k === idx} onClick={() => setIdx(k)}>
            <img src={src} alt="" loading="lazy" />
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          images={images.full}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </section>
  );
}

function SpaceDetail() {
  const { id } = useParams();
  const space = spaces.find((s) => s.id === parseInt(id));
  const images = SPACE_IMAGES[parseInt(id)];

  // '준비중' 공간(id 1·2)은 목록에서 카드만 보이고 상세는 없음. 데이터에 남은 옛 스펙이 보이지 않도록
  if (!space || space.name === '준비중') {
    return (
      <section className="spaces spaces-page">
        <div className="section-container" style={{ textAlign: 'center', padding: '80px 24px' }}>
          <h2>{space ? '준비 중인 공간입니다.' : '존재하지 않는 공간입니다.'}</h2>
          <Link to="/spaces" className="btn btn-primary" style={{ marginTop: 24, display: 'inline-block' }}>
            목록으로 돌아가기
          </Link>
        </div>
      </section>
    );
  }

  // 시안 A. 확인 안 된 정보(주소·공연명)는 칸째 생략
  return (
    <section className="sd">
      <div className="sd-inner">

        <p className="sd-crumb">
          <Link to="/spaces">공간</Link>  /  {space.name.toUpperCase()}
        </p>

        <div className="sd-head">
          <div className="sd-title">
            <p className="sd-kicker">{kicker[space.type]}</p>
            <h1>{space.name}</h1>
            {space.lead && <p className="sd-lead">{space.lead}</p>}
          </div>
          {space.spec && (
            <dl className="sd-spec">
              {[...space.spec, ...(space.location ? [['위치', space.location]] : [])].map(([k, v]) => (
                <Fragment key={k}><dt>{k}</dt><dd>{v}</dd></Fragment>
              ))}
            </dl>
          )}
        </div>

        {images && <SpaceGallery images={images} name={space.name} />}

        {space.shows?.length > 0 && (
          <section className="sd-shows">
            <h2>이 무대에서</h2>
            <ol>
              {space.shows.map((d) => (
                <li key={d}><span className="sd-date">{d}</span>정기 공연</li>
              ))}
            </ol>
          </section>
        )}

        <div className="sd-foot">
          {space.location && (
            <div>
              <h2>찾아오는 길</h2>
              <p>{space.location}, {space.name}</p>
              {space.mapUrl && (
                <a href={space.mapUrl} target="_blank" rel="noopener noreferrer" className="sd-btn sd-btn-ghost sd-map">네이버 지도</a>
              )}
            </div>
          )}
          <div className="sd-cta">
            {space.type === 'rehearsal'
              ? <Link to={`/reservation/${space.id}`} className="sd-btn">예약하기</Link>
              : <Link to="/" state={{ scrollTo: 'join' }} className="sd-btn">멤버 신청</Link>}
            <Link to="/spaces" className="sd-btn sd-btn-ghost">공간 목록</Link>
          </div>
        </div>

      </div>
    </section>
  );
}

export default SpaceDetail;
