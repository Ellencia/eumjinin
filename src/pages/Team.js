import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fmt } from './Schedule';

const SUFFIX = ' — 음진인 협동조합';
const today = () => new Date().toLocaleDateString('sv-SE');

// 공개 팀 소개. 내용은 팀이 /team-edit/<링크>에서 직접 씀
export function TeamPage() {
  const { id } = useParams();
  const [t, setT] = useState(null);
  const [err, setErr] = useState(false);
  useEffect(() => {
    fetch(`/api/teams/${id}`).then(r => r.ok ? r.json() : Promise.reject())
      .then(x => { setT(x); document.title = x.name + SUFFIX; }).catch(() => setErr(true));
  }, [id]);
  const now = today();

  return (
    <section className="info-page">
      <div className="section-container">
        <Link to="/schedule" className="back-link">← 공연 일정</Link>
        {err && <p className="info-lead">팀을 찾을 수 없습니다.</p>}
        {t && (
          <>
            <p className="page-eyebrow">{t.genre || 'Band'}</p>
            <h1 className="section-title">{t.name}</h1>
            {t.intro && <p className="info-lead team-intro">{t.intro}</p>}
            {t.videos.length > 0 && (
              <div className="team-videos">
                {t.videos.map(v => (
                  <iframe key={v} src={`https://www.youtube-nocookie.com/embed/${v}`} title={`${t.name} 영상`} loading="lazy"
                    allow="encrypted-media; picture-in-picture" allowFullScreen />
                ))}
              </div>
            )}
            {t.events.length > 0 && (
              <>
                <h2 className="schedule-heading">음진인 출연</h2>
                <div className="timeline-list">
                  {t.events.map(ev => (
                    <article className="timeline-item" key={ev.id}>
                      <strong>{fmt(ev.date)}{ev.date >= now && <><br /><small>예정</small></>}</strong>
                      <div><p><b>{ev.title}</b>{ev.place && ` · ${ev.place}`}</p></div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
}

// 팀 수정 화면. 로그인 대신 운영진이 준 링크. 저장 즉시 공개
export function TeamEdit() {
  const { key } = useParams();
  const [t, setT] = useState(null);
  const [f, setF] = useState({ genre: '', intro: '', videos: '' });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  useEffect(() => {
    document.title = '팀 소개 수정' + SUFFIX;
    fetch(`/api/team-edit/${key}`).then(async r => {
      const x = await r.json();
      if (!r.ok) throw new Error(x.error);
      setT(x); setF({ genre: x.genre, intro: x.intro, videos: x.videos.join('\n') });
    }).catch(ex => setErr(ex.message));
  }, [key]);
  const set = k => e => { setF({ ...f, [k]: e.target.value }); setMsg(''); };
  const save = async e => {
    e.preventDefault(); setErr(''); setMsg('');
    const r = await fetch(`/api/team-edit/${key}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ genre: f.genre, intro: f.intro, videos: f.videos.split('\n') }),
    });
    const x = await r.json().catch(() => ({}));
    r.ok ? setMsg('저장했습니다. 바로 공개됩니다.') : setErr(x.error || `오류 ${r.status}`);
  };

  return (
    <section className="info-page">
      <div className="section-container">
        <p className="page-eyebrow">팀 소개 수정</p>
        <h1 className="section-title">{t ? t.name : '팀 소개'}</h1>
        {!t && err && <p className="info-lead">{err}</p>}
        {t && (
          <form className="team-form" onSubmit={save}>
            <p className="team-warn">이 페이지에 쓴 내용은 누구나 볼 수 있습니다. 멤버 실명·전화번호·주소는 적지 마세요.
              이 링크를 가진 사람은 누구나 고칠 수 있으니 팀 안에서만 나눠주세요.</p>
            {t.hidden && <p className="team-warn">지금은 운영진이 공개 페이지를 숨겨 둔 상태입니다.</p>}
            <label>장르<input value={f.genre} maxLength={50} placeholder="예: 모던록, 시티팝" onChange={set('genre')} /></label>
            <label>소개<textarea value={f.intro} maxLength={2000} rows={7} placeholder="팀 소개, 결성 이야기, 하는 곡들" onChange={set('intro')} /></label>
            <label>유튜브 영상 주소 (한 줄에 하나, 6개까지)
              <textarea value={f.videos} rows={4} placeholder="https://youtu.be/..." onChange={set('videos')} /></label>
            {err && <p className="form-error">{err}</p>}
            {msg && <p className="team-ok">{msg} <Link to={`/teams/${t.id}`}>페이지 보기 →</Link></p>}
            <button className="btn btn-primary">저장</button>
          </form>
        )}
      </div>
    </section>
  );
}
