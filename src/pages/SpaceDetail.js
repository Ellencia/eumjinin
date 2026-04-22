import { Link, useParams, useNavigate } from 'react-router-dom';
import spaces from '../data/spaces';

const typeLabel = { stage: '무대', rehearsal: '연습실' };
const typeColor = { stage: '#7c3aed', rehearsal: '#0ea5e9' };

function SpaceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const space = spaces.find((s) => s.id === parseInt(id));

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

        {/* 브레드크럼 */}
        <p className="spaces-breadcrumb">
          <Link to="/">홈</Link> &rsaquo; <Link to="/spaces">공간 안내</Link> &rsaquo; {space.name}
        </p>

        {/* 헤더 */}
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

        {/* 주요 특징 + 구비 장비 */}
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

        {/* 액션 버튼 */}
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
