import { useState, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { fmt } from './Schedule';
import { YoutubeIcon, InstagramIcon } from '../components/Icons';
import ConsentCheck, { AgeCheck } from '../components/ConsentCheck';

const SUFFIX = ' — 음진인 협동조합';
// 서버가 state를 만들고 카카오 주소를 돌려줌. 돌아오면 서버가 갈 곳으로 보냄
async function kakaoLogin(body, onError) {
  const r = await fetch('/api/auth/kakao/start', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const x = await r.json().catch(() => ({}));
  if (r.ok) window.location.href = x.url; else onError(x.error || `오류 ${r.status}`);
}
const LOGIN_FAIL = '카카오 로그인을 완료하지 못했습니다. 다시 시도해주세요.';
const today = () => new Date().toLocaleDateString('sv-SE');
// 서버가 유튜브·인스타 호스트만 받으므로 둘 중 하나. 글자 대신 아이콘, 이름은 보조기기·툴팁용
const linkKind = u => /instagram\.com/.test(u) ? { cls: 'insta', label: '인스타그램', Icon: InstagramIcon } : { cls: 'yt', label: '유튜브 채널', Icon: YoutubeIcon };

// 공개 팀 소개. 내용은 팀장이 /team-edit/<팀 id>에서 직접 씀
export function TeamPage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const [t, setT] = useState(null);
  const [err, setErr] = useState(false);
  const [mine, setMine] = useState(false);
  const [loginErr, setLoginErr] = useState({ none: '이 카카오 계정은 이 팀에 연결돼 있지 않습니다. 운영진에게 팀장 초대를 요청해주세요.', fail: LOGIN_FAIL }[params.get('login')] || '');
  useEffect(() => {
    fetch(`/api/teams/${id}`).then(r => r.ok ? r.json() : Promise.reject())
      .then(x => { setT(x); document.title = x.name + SUFFIX; }).catch(() => setErr(true));
    fetch('/api/team-session').then(r => r.json()).then(x => setMine(x.teams.includes(Number(id)))).catch(() => {});
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
            {/* 이름 옆에 채널 아이콘, 영상이 소개글보다 먼저(10-31 사용자 요청) */}
            <div className="team-head">
              <h1 className="section-title">{t.name}</h1>
              {t.links.length > 0 && (
                <span className="team-links">
                  {t.links.map(u => { const { cls, label, Icon } = linkKind(u); return <a key={u} href={u} className={cls} target="_blank" rel="noreferrer noopener" aria-label={label} title={label}><Icon /></a>; })}
                </span>
              )}
            </div>
            {t.videos.length > 0 && (
              <div className="team-videos">
                {t.videos.map(v => (
                  <iframe key={v} src={`https://www.youtube-nocookie.com/embed/${v}`} title={`${t.name} 영상`} loading="lazy"
                    allow="encrypted-media; picture-in-picture" allowFullScreen />
                ))}
              </div>
            )}
            {t.intro && <p className="info-lead team-intro">{t.intro}</p>}
            {/* 공개 동의한 멤버만 옴(관리자 연결 또는 신청서 밴드 이름 일치) */}
            {t.members.length > 0 && (
              <p className="team-members">멤버 · {t.members.map(m => `${m.role ? m.role + ' ' : ''}${m.name}${m.leader ? '(리더)' : ''}`).join(', ')}</p>
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
            <div className="team-manage">
              {mine ? <Link to={`/team-edit/${t.id}`} className="btn btn-primary">팀 소개 수정</Link>
                : <button className="team-login" onClick={() => { setLoginErr(''); kakaoLogin({ teamId: t.id }, setLoginErr); }}>팀장 로그인</button>}
              {loginErr && <p className="form-error">{loginErr}</p>}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

// 운영진이 보낸 일회용 초대 링크. 동의 → 카카오 로그인 → 이 계정이 팀에 연결되고 링크는 소멸
export function TeamInvite() {
  const { key } = useParams();
  const [params] = useSearchParams();
  const [name, setName] = useState(null);
  const [err, setErr] = useState(params.get('login') === 'fail' ? LOGIN_FAIL : '');
  const [dead, setDead] = useState('');
  const [age14, setAge14] = useState(false);
  const [consent, setConsent] = useState(false);
  useEffect(() => {
    document.title = '팀장 연결' + SUFFIX;
    fetch(`/api/team-invite/${key}`).then(async r => {
      const x = await r.json();
      r.ok ? setName(x.name) : setDead(x.error);
    }).catch(() => setDead('초대 정보를 불러오지 못했습니다.'));
  }, [key]);

  return (
    <section className="info-page">
      <div className="section-container">
        <p className="page-eyebrow">팀장 연결</p>
        <h1 className="section-title">{name || '팀장 초대'}</h1>
        {dead && <p className="info-lead">{dead}</p>}
        {name && (
          <div className="team-invite">
            <p className="info-lead">카카오 계정을 이 팀의 팀장으로 연결하면 팀 소개 페이지를 직접 고칠 수 있습니다. 이 링크는 한 번만 쓸 수 있으니 팀장 본인이 눌러주세요.</p>
            <AgeCheck checked={age14} onChange={setAge14} />
            <ConsentCheck checked={consent} onChange={setConsent}
              items="카카오 회원번호, 운영진이 입력한 이름 또는 호칭"
              purpose="팀 소개 페이지 수정 권한 확인"
              retention="팀장 연결 해제 또는 팀 삭제 시까지"
              refusal="팀장으로 연결할 수 없습니다" />
            {err && <p className="form-error">{err}</p>}
            <button className="team-login" disabled={!age14 || !consent}
              onClick={() => { setErr(''); kakaoLogin({ invite: key, consent, age14 }, setErr); }}>카카오로 연결</button>
          </div>
        )}
      </div>
    </section>
  );
}

// 팀 수정 화면. 연결된 팀장만, 저장 즉시 공개
export function TeamEdit() {
  const { id } = useParams();
  const draftKey = `team-draft-${id}`;
  const [t, setT] = useState(null);
  const [f, setF] = useState({ genre: '', intro: '', videos: '', links: '' });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [needLogin, setNeedLogin] = useState(false);
  useEffect(() => {
    document.title = '팀 소개 수정' + SUFFIX;
    fetch(`/api/team-edit/${id}`).then(async r => {
      const x = await r.json();
      if (r.status === 401) { setNeedLogin(true); return; }
      if (!r.ok) throw new Error(x.error);
      setT(x); setF({ genre: x.genre, intro: x.intro, videos: x.videos.join('\n'), links: x.links.join('\n') });
      // 쓰다가 세션이 끊겨 로그인하고 돌아온 경우: 쓰던 글 복원(서버 재시작 = 전원 로그아웃)
      try {
        const draft = sessionStorage.getItem(draftKey);
        if (draft) { setF(JSON.parse(draft)); sessionStorage.removeItem(draftKey); setMsg('쓰던 내용을 복원했습니다. 저장을 눌러야 공개됩니다.'); }
      } catch { /* 저장소를 못 쓰는 브라우저면 복원 없이 진행 */ }
    }).catch(ex => setErr(ex.message));
  }, [id, draftKey]);
  const set = k => e => { setF({ ...f, [k]: e.target.value }); setMsg(''); };
  const save = async e => {
    e.preventDefault(); setErr(''); setMsg('');
    const r = await fetch(`/api/team-edit/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ genre: f.genre, intro: f.intro, videos: f.videos.split('\n'), links: f.links.split('\n') }),
    });
    const x = await r.json().catch(() => ({}));
    if (r.status === 401) {
      try { sessionStorage.setItem(draftKey, JSON.stringify(f)); } catch { /* 복원만 안 될 뿐, 화면의 글은 그대로 */ }
      setNeedLogin(true); setErr('로그인이 끊겨 저장하지 못했습니다. 다시 로그인하면 쓰던 내용을 복원합니다.');
      return;
    }
    r.ok ? setMsg('저장했습니다. 바로 공개됩니다.') : setErr(x.error || `오류 ${r.status}`);
  };
  const logout = async () => {
    await fetch('/api/team-session/logout', { method: 'POST' });
    window.location.href = `/teams/${id}`;
  };
  const relogin = <button type="button" className="team-login" onClick={() => kakaoLogin({ teamId: id }, setErr)}>카카오로 로그인</button>;

  return (
    <section className="info-page">
      <div className="section-container">
        <p className="page-eyebrow">팀 소개 수정</p>
        <h1 className="section-title">{t ? t.name : '팀 소개'}</h1>
        {!t && err && <p className="info-lead">{err}</p>}
        {!t && needLogin && <div className="team-manage"><p className="info-lead">팀장 로그인이 필요합니다.</p>{relogin}</div>}
        {t && (
          <form className="team-form" onSubmit={save}>
            <p className="team-warn">이 페이지에 쓴 내용은 누구나 볼 수 있습니다. 멤버 소개는 본인이 동의한 활동명과 역할까지만
              (예: 보컬 김OO, 기타 박OO). 전화번호·주소·개인 SNS 계정은 적지 마세요.</p>
            {t.hidden && <p className="team-warn">지금은 운영진이 공개 페이지를 숨겨 둔 상태입니다.</p>}
            <label>장르<input value={f.genre} maxLength={50} placeholder="예: 모던록, 시티팝" onChange={set('genre')} /></label>
            <label>소개<textarea value={f.intro} maxLength={2000} rows={7} placeholder={'팀 소개, 결성 이야기, 하는 곡들\n멤버: 보컬 OO, 기타 OO, 베이스 OO, 드럼 OO'} onChange={set('intro')} /></label>
            <label>유튜브 채널 · 인스타그램 주소 (한 줄에 하나, 4개까지)
              <textarea value={f.links} rows={2} placeholder={'https://www.youtube.com/@...\nhttps://www.instagram.com/...'} onChange={set('links')} /></label>
            <label>유튜브 영상 주소 (한 줄에 하나, 6개까지 — 채널이 아니라 영상 하나하나의 주소)
              <textarea value={f.videos} rows={4} placeholder="https://youtu.be/..." onChange={set('videos')} /></label>
            {err && <p className="form-error">{err}</p>}
            {msg && <p className="team-ok">{msg} <Link to={`/teams/${t.id}`}>페이지 보기 →</Link></p>}
            <div className="team-actions">
              {needLogin ? relogin : <button className="btn btn-primary">저장</button>}
              <button type="button" className="team-logout" onClick={logout}>로그아웃</button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
