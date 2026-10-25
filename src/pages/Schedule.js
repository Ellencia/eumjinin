import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PAGES from '../data/pages.json';
import { PROJECT_LINKS } from './InfoPage';

// 공연 일정·라인업. 데이터는 관리자 공연 탭(/api/events) — 여기엔 손으로 적지 않음
const today = () => new Date().toLocaleDateString('sv-SE');
const fmt = d => { const x = new Date(`${d}T00:00`); return `${x.getMonth() + 1}. ${x.getDate()} (${'일월화수목금토'[x.getDay()]})`; };

function EventList({ events }) {
  return (
    <div className="timeline-list">
      {events.map(ev => (
        <article className="timeline-item" key={ev.id}>
          <strong>{fmt(ev.date)}{ev.time && <><br /><small>{ev.time}</small></>}</strong>
          <div>
            <p>
              {/* 같은 날짜의 프로젝트 연혁 항목이 있으면 그리로 */}
              <b>{PROJECT_LINKS[ev.date] ? <Link to={PROJECT_LINKS[ev.date]} className="timeline-link">{ev.title}</Link> : ev.title}</b>
              {ev.place && ` · ${ev.place}`}
            </p>
            {ev.teams.length > 0 && <p className="schedule-lineup">{ev.teams.map(t => t.name).join(' · ')}</p>}
            {ev.note && <p className="schedule-note">{ev.note}</p>}
          </div>
        </article>
      ))}
    </div>
  );
}

function Schedule() {
  const [events, setEvents] = useState(null);
  const [err, setErr] = useState(false);
  useEffect(() => {
    fetch('/api/events').then(r => r.ok ? r.json() : Promise.reject()).then(setEvents).catch(() => setErr(true));
  }, []);
  const page = PAGES['/schedule'];
  const now = today();
  const upcoming = events?.filter(e => e.date >= now) || [];
  const past = events?.filter(e => e.date < now).reverse() || [];

  return (
    <section className="info-page">
      <div className="section-container">
        <Link to="/" className="back-link">← 홈으로</Link>
        <p className="page-eyebrow">Projects</p>
        <h1 className="section-title">{page.title}</h1>
        <p className="section-sub">{page.desc}</p>

        {err && <p className="info-lead">일정을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.</p>}
        {events && (
          <>
            <h2 className="schedule-heading">다가오는 공연</h2>
            {upcoming.length ? <EventList events={upcoming} /> : <p className="info-lead">확정된 일정이 아직 없습니다.</p>}
            {past.length > 0 && (
              <>
                <h2 className="schedule-heading">지난 공연</h2>
                <EventList events={past} />
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
}

export default Schedule;
