import { Link } from 'react-router-dom';
import spaces from '../data/spaces';

// '준비중'(연습실 미확정, 2026-10-17)은 예약 대상에서 제외
const rehearsalRooms = spaces.filter((s) => s.type === 'rehearsal' && s.name !== '준비중');

function Reservation() {
  return (
    <section className="reservation-page">
      <div className="section-container">

        <div className="resv-header">
          <Link to="/" className="back-link">← 홈으로</Link>
          <h1 className="section-title">연습실 예약</h1>
          <p className="section-sub">
            {rehearsalRooms.length === 0 ? '연습 공간 확정 후 예약을 시작합니다.' : <>音眞人의 연습 공간을 자유롭게 예약하세요.<br />멤버라면 누구나 이용할 수 있습니다.</>}
          </p>
        </div>

        {rehearsalRooms.length === 0 && (
          <div className="resv-notice">
            <span className="resv-notice-icon">🚧</span>
            <div>
              <strong>연습실은 준비 중입니다</strong>
              <p>운영 공간이 확정되면 이곳에서 예약을 받습니다. 공연은 Art Hall K에서 진행됩니다.</p>
            </div>
          </div>
        )}

        <div className="resv-rooms">
          {rehearsalRooms.map((room) => (
            <div className="resv-room-card" key={room.id}>
              <div className="resv-room-info">
                <h2 className="resv-room-name">{room.name}</h2>
                <p className="resv-room-desc">{room.desc}</p>
                <p className="resv-room-cap">최대 {room.capacity}인</p>
                <div className="space-tags">
                  {room.tags.map((t) => (
                    <span className="tag" key={t}>#{t}</span>
                  ))}
                </div>
              </div>
              <div className="resv-room-action">
                <Link
                  to={`/reservation/${room.id}`}
                  className="btn btn-primary resv-select-btn"
                >
                  예약하기
                </Link>
              </div>
            </div>
          ))}
        </div>

        {rehearsalRooms.length > 0 && (
        <div className="resv-notice">
          <span className="resv-notice-icon">📋</span>
          <div>
            <strong>예약은 신청 → 담당자 확인 순으로 진행됩니다</strong>
            <p>신청 직후에는 "신청" 상태이며, 담당자가 확인 후 연락드리면 확정됩니다. 변경·취소는 그때 안내드리는 연락처로 요청해 주세요.</p>
          </div>
        </div>
        )}

      </div>
    </section>
  );
}

export default Reservation;
