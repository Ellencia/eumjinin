import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import spaces from '../data/spaces';

const TIME_SLOTS = [
  '00:00', '01:00', '02:00', '03:00', '04:00',
  '05:00', '06:00', '07:00', '08:00', '09:00',
  '10:00', '11:00', '12:00', '13:00', '14:00',
  '15:00', '16:00', '17:00', '18:00', '19:00',
  '20:00', '21:00', '22:00', '23:00', '24:00',
  '25:00', '26:00', '27:00', '28:00', '29:00',
];

function timeToMins(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + (m || 0);
}

function getSlotState(slot, startTime, endTime) {
  if (slot === startTime) return 'slot-start';
  if (slot === endTime) return 'slot-end';
  if (startTime && endTime &&
      timeToMins(slot) > timeToMins(startTime) &&
      timeToMins(slot) < timeToMins(endTime)) return 'slot-in-range';
  return '';
}

function getDuration(startTime, endTime) {
  if (!startTime || !endTime) return '';
  return `${(timeToMins(endTime) - timeToMins(startTime)) / 60}시간`;
}

// 25:00~29:00 슬롯을 "01:00 +1" 형태로 표시
function SlotLabel({ slot }) {
  const h = parseInt(slot);
  if (h <= 24) return slot;
  return (
    <>
      {String(h - 24).padStart(2, '0')}:00
      <span className="slot-next-day">+1</span>
    </>
  );
}

function formatPhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

function isValidPhone(value) {
  return /^\d{2,3}-\d{3,4}-\d{4}$/.test(value);
}

function toDateStr(date) {
  if (!date) return '';
  return date.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function ReservationDetail() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const room = spaces.find((s) => s.id === parseInt(roomId));

  const [selectedDate, setSelectedDate] = useState(undefined);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [bookedRanges, setBookedRanges] = useState([]);
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxDateObj = new Date(today);
  maxDateObj.setMonth(maxDateObj.getMonth() + 2);

  // 날짜 선택 시 해당 방·날짜의 기존 예약 fetch
  useEffect(() => {
    if (!selectedDate) return;
    const dateStr = selectedDate.toISOString().split('T')[0];
    fetch(`http://localhost:3001/api/reservations?roomId=${roomId}&date=${dateStr}`)
      .then(res => res.json())
      .then(data => setBookedRanges(data))
      .catch(() => setBookedRanges([]));
  }, [roomId, selectedDate]);

  const duration = getDuration(startTime, endTime);
  const canSubmit = selectedDate && startTime && endTime && name && isValidPhone(phone);

  const currentDateStr = selectedDate ? selectedDate.toISOString().split('T')[0] : '';

  // 슬롯이 기존 예약과 겹치는지 확인 (자정 경계 포함)
  const isBooked = (slot) => {
    const slotMins = timeToMins(slot);
    return bookedRanges.some(r => {
      const rStart = timeToMins(r.startTime);
      const rEnd = timeToMins(r.endTime);
      if (r.date === currentDateStr) {
        return slotMins >= rStart && slotMins < rEnd;
      }
      // 전날 예약이 자정을 넘어 오늘로 이어지는 경우
      const overflowEnd = rEnd - 24 * 60;
      return slotMins < overflowEnd;
    });
  };

  const handleDaySelect = (day) => {
    setSelectedDate(day);
    setStartTime('');
    setEndTime('');
    setSubmitError('');
  };

  const handleSlotClick = (slot) => {
    if (!selectedDate || isBooked(slot)) return;
    if (!startTime || (startTime && endTime)) {
      setStartTime(slot);
      setEndTime('');
    } else {
      if (slot <= startTime) {
        setStartTime(slot);
        setEndTime('');
      } else {
        setEndTime(slot);
      }
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('http://localhost:3001/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: parseInt(roomId),
          date: selectedDate.toISOString().split('T')[0],
          startTime,
          endTime,
          name,
          phone,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitted(true);
      } else {
        setSubmitError(data.error || '예약 중 오류가 발생했습니다.');
      }
    } catch {
      setSubmitError('서버에 연결할 수 없습니다. npm run server 를 실행해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!room || room.type !== 'rehearsal') {
      navigate('/reservation', { replace: true });
    }
  }, [room, navigate]);

  if (!room) return null;

  if (submitted) {
    return (
      <section className="reservation-page">
        <div className="section-container">
          <div className="resv-detail">
            <div className="resv-submitted">
              <div className="resv-submitted-icon">✅</div>
              <h2>신청이 접수되었습니다</h2>
              <p>
                <strong>{room.name}</strong> · {toDateStr(selectedDate)}<br />
                {startTime} ~ {endTime} ({duration})<br />
                담당자가 확인 후 연락드리겠습니다.
              </p>
              <button className="btn btn-primary" onClick={() => navigate('/reservation')}>
                ← 연습실 목록으로
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="reservation-page">
      <div className="section-container">
        <div className="resv-detail">
          <button className="back-link resv-back-btn" onClick={() => navigate('/reservation')}>
            ← 연습실 목록으로
          </button>

          <div className="resv-detail-header">
            <h1 className="section-title">{room.name}</h1>
            <p className="section-sub">{room.desc}</p>
            <div className="space-tags" style={{ justifyContent: 'center' }}>
              <span className="resv-cap-badge">최대 {room.capacity}인</span>
              {room.tags.map((t) => <span className="tag" key={t}>#{t}</span>)}
            </div>
          </div>

          <div className="resv-form-card">

            {/* 날짜 + 시간 가로 배치 */}
            <div className="resv-datetime-row">

              {/* 날짜 선택 */}
              <div className="resv-form-section resv-date-col">
                <h3 className="resv-form-label">날짜 선택</h3>
                <div className="rdp-wrapper">
                  <DayPicker
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDaySelect}
                    disabled={[{ before: today }, { after: maxDateObj }]}
                    startMonth={today}
                    endMonth={maxDateObj}
                  />
                </div>
              </div>

              {/* 시간 범위 선택 */}
              <div className="resv-form-section resv-time-col">
                <div className="resv-time-header">
                  <h3 className="resv-form-label">이용 시간</h3>
                  <div className="resv-time-summary">
                    {startTime && endTime ? (
                      <span className="resv-time-result">
                        {startTime} ~ {endTime}
                        <strong> · {duration}</strong>
                      </span>
                    ) : startTime ? (
                      <span className="resv-time-hint-inline">종료 시간을 선택해주세요</span>
                    ) : (
                      <span className="resv-time-hint-inline">시작 시간을 먼저 클릭하세요</span>
                    )}
                  </div>
                </div>

                <div className={`resv-time-grid ${!selectedDate ? 'disabled' : ''}`}>
                {TIME_SLOTS.map((slot) => {
                  const booked = isBooked(slot);
                  const state = booked ? 'slot-booked' : getSlotState(slot, startTime, endTime);
                  return (
                    <button
                      key={slot}
                      className={`resv-time-slot ${state}`}
                      onClick={() => handleSlotClick(slot)}
                      disabled={!selectedDate || booked}
                      title={booked ? '이미 예약된 시간' : ''}
                    >
                      <SlotLabel slot={slot} />
                    </button>
                  );
                })}
              </div>
              {!selectedDate && <p className="resv-hint">날짜를 먼저 선택해주세요</p>}
              </div>
            </div>{/* resv-datetime-row */}

            {/* 예약자 정보 */}
            <div className="resv-form-section">
              <h3 className="resv-form-label">예약자 정보</h3>
              <div className="resv-fields">
                <input
                  className="resv-input"
                  type="text"
                  placeholder="이름"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <input
                  className="resv-input"
                  type="tel"
                  placeholder="연락처 (010-0000-0000)"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                />
              </div>
            </div>

            <button
              className={`btn btn-primary resv-submit-btn ${canSubmit && !submitting ? '' : 'disabled'}`}
              onClick={handleSubmit}
            >
              {submitting ? '처리 중...' : '예약 신청하기'}
            </button>
            {submitError && <p className="resv-hint center resv-error">{submitError}</p>}
            {!canSubmit && !submitError && <p className="resv-hint center">모든 항목을 선택·입력해주세요</p>}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ReservationDetail;
