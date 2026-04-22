import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import spaces from '../data/spaces';

import hallk1 from '../assets/hallk1.webp';
import hallk2 from '../assets/hallk2.webp';
import hallk3 from '../assets/hallk3.webp';
import hallk4 from '../assets/hallk4.webp';
import hallk5 from '../assets/hallk5.webp';

const SPACE_IMAGES = {
  6: [hallk1, hallk2, hallk3, hallk4, hallk5],
};

const typeLabel = { stage: '무대', rehearsal: '연습실' };
const typeColor = { stage: '#7c3aed', rehearsal: '#0ea5e9' };

function Lightbox({ images, index, onClose }) {
  const [current, setCurrent] = useState(index);

  const prev = (e) => { e.stopPropagation(); setCurrent((c) => (c - 1 + images.length) % images.length); };
  const next = (e) => { e.stopPropagation(); setCurrent((c) => (c + 1) % images.length); };

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <button className="lightbox-close" onClick={onClose}>✕</button>
      <button className="lightbox-arrow lightbox-prev" onClick={prev}>&#8249;</button>
      <img
        src={images[current]}
        alt={`${current + 1}`}
        className="lightbox-img"
        onClick={(e) => e.stopPropagation()}
      />
      <button className="lightbox-arrow lightbox-next" onClick={next}>&#8250;</button>
      <p className="lightbox-counter">{current + 1} / {images.length}</p>
    </div>
  );
}

function SpaceGallery({ images }) {
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [main, ...rest] = images;

  return (
    <>
      <div className="space-gallery">
        {/* 대표 이미지 */}
        <div className="gallery-main" onClick={() => setLightboxIndex(0)}>
          <img src={main} alt="대표 이미지" />
          <span className="gallery-zoom">⊕</span>
        </div>
        {/* 2×2 그리드 */}
        <div className="gallery-grid">
          {rest.map((img, i) => (
            <div key={i} className="gallery-thumb" onClick={() => setLightboxIndex(i + 1)}>
              <img src={img} alt={`사진 ${i + 2}`} />
              <span className="gallery-zoom">⊕</span>
            </div>
          ))}
        </div>
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          images={images}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}

function SpaceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const space = spaces.find((s) => s.id === parseInt(id));
  const images = SPACE_IMAGES[parseInt(id)];

  if (!space) {
    return (
      <section className="spaces spaces-page">
        <div className="section-container" style={{ textAlign: 'center', padding: '80px 24px' }}>
          <h2>존재하지 않는 공간입니다.</h2>
          <Link to="/spaces" className="btn btn-primary" style={{ marginTop: 24, display: 'inline-block' }}>
            목록으로 돌아가기
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="spaces spaces-page">
      <div className="section-container">

        <p className="spaces-breadcrumb">
          <Link to="/">홈</Link> &rsaquo; <Link to="/spaces">공간 안내</Link> &rsaquo; {space.name}
        </p>

        <div className="space-detail-header">
          <span className="space-badge" style={{ background: typeColor[space.type] }}>
            {typeLabel[space.type]}
          </span>
          <h2 className="space-detail-title">{space.name}</h2>
          <p className="space-detail-desc">{space.desc}</p>
          <p className="space-detail-capacity">최대 수용 인원 <strong>{space.capacity}인</strong></p>
          <div className="space-tags">
            {space.tags.map((t) => <span className="tag" key={t}>#{t}</span>)}
          </div>
        </div>

        {/* 갤러리 */}
        {images && <SpaceGallery images={images} />}

        <div className="space-detail-grid">
          <div className="space-detail-section">
            <h3>주요 특징</h3>
            <ul className="space-detail-list">
              {space.features.map((f) => <li key={f}>✓ {f}</li>)}
            </ul>
          </div>
          <div className="space-detail-section">
            <h3>구비 장비</h3>
            <ul className="space-detail-list">
              {space.equipment.map((e) => <li key={e}>• {e}</li>)}
            </ul>
          </div>
        </div>

        <div className="space-detail-actions">
          {space.type === 'rehearsal' && (
            <Link to={`/reservation/${space.id}`} className="btn btn-primary">
              예약하기
            </Link>
          )}
          <button className="btn btn-outline" onClick={() => navigate('/spaces')}>
            목록으로
          </button>
        </div>

      </div>
    </section>
  );
}

export default SpaceDetail;
