import { useState, useEffect, useCallback } from 'react';
import spaces from '../data/spaces';
import './admin.css';

const ROOMS = spaces.filter(s => s.type === 'rehearsal' && s.name !== '준비중'); // 미확정 방은 `방 N`으로 표시
const roomName = id => ROOMS.find(r => r.id === id)?.name || `방 ${id}`;
const RESV_STATUS = ['신청', '확정', '취소'];
const MEMBER_STATUS = ['신청', '연락함', '합류', '보류'];

const todayStr = (offsetDays = 0) => {
  const d = new Date(); d.setDate(d.getDate() + offsetDays);
  return d.toLocaleDateString('sv-SE'); // YYYY-MM-DD, 로컬 시간대
};
const fmtDateTime = iso => new Date(iso).toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' });

async function api(path, opts = {}) {
  const res = await fetch(path, { headers: { 'Content-Type': 'application/json' }, ...opts });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || `HTTP ${res.status}`), { status: res.status });
  return data;
}

// 입력창: 포커스 빠질 때만 저장. 치는 중엔 로컬 상태
function MemoInput({ value, onSave, placeholder = '메모', className = 'adm-memo', type }) {
  const [v, setV] = useState(value);
  useEffect(() => setV(value), [value]);
  return <input className={className} type={type} value={v} placeholder={placeholder} onChange={e => setV(e.target.value)}
    onBlur={() => v !== value && onSave(v)} />;
}

// 관리 탭 공통: 목록 불러오기 + 실패 처리. 401이면 로그인 화면으로
function useList(path, onAuthFail) {
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState('');
  const load = useCallback(async () => {
    try { setRows(await api(path)); setErr(''); }
    catch (ex) { ex.status === 401 ? onAuthFail() : setErr(ex.message); }
  }, [path, onAuthFail]);
  useEffect(() => { load(); }, [load]);
  // 변경 요청 후 다시 불러옴(출연 횟수 등 서버가 세는 값이 같이 바뀜)
  const run = async (p, method, body) => {
    try { await api(p, { method, body: body && JSON.stringify(body) }); await load(); }
    catch (ex) { ex.status === 401 ? onAuthFail() : setErr(ex.message); }
  };
  return { rows, err, run };
}

function Login({ onDone }) {
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const submit = async e => {
    e.preventDefault();
    try { await api('/api/admin/login', { method: 'POST', body: JSON.stringify({ username: id, password: pw }) }); onDone(); }
    catch (ex) { setErr(ex.message); }
  };
  return (
    <form className="adm-login" onSubmit={submit}>
      <h1>kband 관리자</h1>
      <input autoFocus autoComplete="username" autoCapitalize="none" placeholder="아이디" value={id} onChange={e => setId(e.target.value)} />
      <input type="password" autoComplete="current-password" placeholder="비밀번호" value={pw} onChange={e => setPw(e.target.value)} />
      <button className="btn btn-primary">로그인</button>
      {err && <p className="adm-error">{err}</p>}
    </form>
  );
}

function Reservations({ onAuthFail, full }) {
  const [f, setF] = useState({ from: todayStr(), to: todayStr(30), roomId: '', status: '' });
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState('');

  const load = useCallback(async () => {
    try { setRows(await api('/api/admin/reservations?' + new URLSearchParams(f))); setErr(''); }
    catch (ex) { ex.status === 401 ? onAuthFail() : setErr(ex.message); }
  }, [f, onAuthFail]);
  useEffect(() => { load(); }, [load]);

  const patch = async (id, body) => {
    try { const row = await api(`/api/admin/reservations/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
      setRows(rs => rs.map(r => r.id === id ? row : r)); setErr(''); }
    catch (ex) { setErr(ex.message); }
  };
  const remove = async id => {
    if (!window.confirm('이 예약을 삭제할까요? 취소 처리만 하려면 상태를 바꾸세요.')) return;
    await api(`/api/admin/reservations/${id}`, { method: 'DELETE' }); load();
  };
  const set = k => e => setF({ ...f, [k]: e.target.value });

  return (
    <>
      <div className="adm-filters">
        <input type="date" value={f.from} onChange={set('from')} /> ~ <input type="date" value={f.to} onChange={set('to')} />
        <select value={f.roomId} onChange={set('roomId')}><option value="">전체 방</option>{ROOMS.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select>
        <select value={f.status} onChange={set('status')}><option value="">전체 상태</option>{RESV_STATUS.map(s => <option key={s}>{s}</option>)}</select>
        <span className="adm-count">{rows.length}건</span>
      </div>
      {err && <p className="adm-error">{err}</p>}
      <table className="adm-table">
        <thead><tr><th>날짜</th><th>시간</th><th>방</th><th>이름</th><th>연락처</th><th>상태</th><th className="adm-grow">메모</th><th>신청일</th><th></th></tr></thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id} className={`st-${r.status}`}>
              <td data-label="날짜">{r.date}</td>
              <td data-label="시간">{r.startTime}~{r.endTime}</td>
              <td data-label="방">{roomName(r.roomId)}</td>
              <td data-label="이름">{r.name}</td>
              <td data-label="연락처"><a href={`tel:${r.phone}`}>{r.phone}</a></td>
              <td data-label="상태"><select value={r.status} onChange={e => patch(r.id, { status: e.target.value })}>{RESV_STATUS.map(s => <option key={s}>{s}</option>)}</select></td>
              <td data-label="메모"><MemoInput value={r.memo} onSave={memo => patch(r.id, { memo })} /></td>
              <td data-label="신청일" className="adm-dim">{fmtDateTime(r.createdAt)}</td>
              <td className="adm-act">{full && <button className="adm-del" onClick={() => remove(r.id)} title="삭제">✕</button>}</td>
            </tr>
          ))}
          {rows.length === 0 && <tr><td colSpan={9} className="adm-empty">예약 없음</td></tr>}
        </tbody>
      </table>
    </>
  );
}

// 합류 안내문. 링크·참여코드는 서버 .env(BAND_INVITE_URL·KAKAO_OPEN_URL·KAKAO_OPEN_CODE). 관리자가 복사해서 문자·카톡으로 보냄
function inviteText(m, inv) {
  const lines = [
    '[음진인 협동조합] 멤버 신청 안내',
    '',
    `안녕하세요, ${m.name}님.`,
    '음악에 진심인 사람들, 음진인 협동조합입니다.',
    '멤버 신청서 잘 받았습니다. 관심 가져 주셔서 감사합니다.',
  ];
  if (inv.band) lines.push('', '■ 네이버 밴드 가입',
    '음진인 소식과 공연 공지는 네이버 밴드에서 나눕니다.',
    '아래 링크에서 가입 신청해 주시면 운영진이 확인 후 승인해 드립니다.', inv.band);
  if (m.leader && inv.chat) {
    lines.push('', '■ 밴드 리더 단톡방',
      '팀 리더분들은 공연 일정·라인업 조율을 위해 리더 단톡방(카카오 오픈채팅)에도 참여 부탁드립니다.', inv.chat);
    if (inv.chatCode) lines.push(`참여코드: ${inv.chatCode}`);
  }
  lines.push('', '■ 정기 공연',
    '매월 행주산성 Art Hall K에서 정기 공연이 열립니다. 일정은 밴드 공지와 홈페이지에서 확인하실 수 있습니다.',
    'https://kband.co.kr',
    '', '앞으로 무대에서 뵙겠습니다. 감사합니다.', '음진인 협동조합 드림');
  return lines.join('\n');
}

function Members({ onAuthFail, full }) {
  const [f, setF] = useState({ q: '', status: '' });
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState('');
  const [inv, setInv] = useState({});
  const [copied, setCopied] = useState(0);
  const [teams, setTeams] = useState([]);
  useEffect(() => {
    api('/api/admin/invite').then(setInv).catch(() => {});
    api('/api/admin/teams').then(setTeams).catch(() => {});
  }, []);
  const teamOf = id => teams.find(t => t.id === id);
  const copy = async m => {
    try { await navigator.clipboard.writeText(inviteText(m, inv)); setCopied(m.id); setTimeout(() => setCopied(0), 1500); }
    catch { setErr('클립보드 복사 실패'); }
  };

  const load = useCallback(async () => {
    try { setRows(await api('/api/admin/members?' + new URLSearchParams(f))); setErr(''); }
    catch (ex) { ex.status === 401 ? onAuthFail() : setErr(ex.message); }
  }, [f, onAuthFail]);
  useEffect(() => { load(); }, [load]);

  const patch = async (id, body) => {
    try { const row = await api(`/api/admin/members/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
      setRows(rs => rs.map(r => r.id === id ? row : r)); setErr(''); }
    catch (ex) { setErr(ex.message); }
  };
  const remove = async id => {
    if (!window.confirm('이 신청을 삭제할까요?')) return;
    await api(`/api/admin/members/${id}`, { method: 'DELETE' }); load();
  };

  return (
    <>
      <div className="adm-filters">
        <input placeholder="이름·연락처·밴드·이메일 검색" value={f.q} onChange={e => setF({ ...f, q: e.target.value })} />
        <select value={f.status} onChange={e => setF({ ...f, status: e.target.value })}><option value="">전체 상태</option>{MEMBER_STATUS.map(s => <option key={s}>{s}</option>)}</select>
        <span className="adm-count">{rows.length}명</span>
      </div>
      {err && <p className="adm-error">{err}</p>}
      <table className="adm-table">
        <thead><tr><th>신청일</th><th>이름</th><th>연락처</th><th>적은 밴드</th><th>팀</th><th>리더</th><th>장르 · 지역</th><th className="adm-grow">소개</th><th>상태</th><th className="adm-grow">메모</th><th>안내문</th><th></th></tr></thead>
        <tbody>
          {rows.map(m => (
            <tr key={m.id} className={`st-${m.status}`}>
              <td data-label="신청일" className="adm-dim">{fmtDateTime(m.createdAt)}</td>
              <td data-label="이름"><div className="adm-stack"><span className="adm-title">{m.name}</span><span className="adm-dim">{[m.role, m.birth].filter(Boolean).join(' · ')}</span></div></td>
              <td data-label="연락처"><div className="adm-stack adm-contact"><a href={`tel:${m.phone}`}>{m.phone}</a><a href={`mailto:${m.email}`}>{m.email}</a></div></td>
              <td data-label="적은 밴드">{m.band}</td>
              <td data-label="팀"><div className="adm-stack"><select value={m.teamId || ''} onChange={e => patch(m.id, { teamId: e.target.value })}>
                <option value="">—</option>{teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
                {teamOf(m.teamId)?.next && <span className="adm-dim">다음 출연 {teamOf(m.teamId).next}</span>}</div></td>
              <td data-label="리더"><input type="checkbox" checked={!!m.leader} onChange={e => patch(m.id, { leader: e.target.checked ? 1 : 0 })} title="밴드 리더" /></td>
              <td data-label="장르 · 지역"><div className="adm-stack"><span>{m.genre}</span><span className="adm-dim">{m.location}</span></div></td>
              <td data-label="소개" className="adm-intro">{m.intro}</td>
              <td data-label="상태"><select value={m.status} onChange={e => patch(m.id, { status: e.target.value })}>{MEMBER_STATUS.map(s => <option key={s}>{s}</option>)}</select></td>
              <td data-label="메모"><MemoInput value={m.memo} onSave={memo => patch(m.id, { memo })} /></td>
              <td data-label="안내문"><button className="adm-copy" onClick={() => copy(m)} disabled={!inv.band && !inv.chat}
                title={inv.band || inv.chat ? '밴드 링크(리더면 오픈채팅까지) 안내문을 클립보드로' : '서버 .env에 BAND_INVITE_URL 등이 없음'}>
                {copied === m.id ? '복사됨' : '복사'}</button></td>
              <td className="adm-act">{full && <button className="adm-del" onClick={() => remove(m.id)} title="삭제">✕</button>}</td>
            </tr>
          ))}
          {rows.length === 0 && <tr><td colSpan={12} className="adm-empty">신청 없음</td></tr>}
        </tbody>
      </table>
    </>
  );
}

// 팀. 출연·지난·다음은 공연 탭 라인업에서 서버가 셈. 멤버 = 멤버 신청 탭에서 이 팀에 연결한 사람
function Teams({ onAuthFail }) {
  const { rows, err, run } = useList('/api/admin/teams', onAuthFail);
  const [name, setName] = useState('');
  const [q, setQ] = useState('');
  const add = async e => { e.preventDefault(); if (!name.trim()) return; await run('/api/admin/teams', 'POST', { name }); setName(''); };
  const remove = t => window.confirm(`'${t.name}' 팀을 삭제할까요? 라인업에서도 빠지고 멤버 연결이 풀립니다.`) && run(`/api/admin/teams/${t.id}`, 'DELETE');
  const shown = rows.filter(t => t.name.includes(q.trim()));
  const [copied, setCopied] = useState(0);
  // 수정 링크: 없으면 만들고 복사. 재발급은 예전 링크가 죽으므로 확인
  const copyKey = async (t, fresh) => {
    if (fresh && !window.confirm(`'${t.name}' 수정 링크를 새로 만들까요? 예전 링크는 바로 못 씁니다.`)) return;
    try {
      const editKey = t.editKey && !fresh ? t.editKey : (await api(`/api/admin/teams/${t.id}/key`, { method: 'POST' })).editKey;
      await navigator.clipboard.writeText(`${window.location.origin}/team-edit/${editKey}`);
      setCopied(t.id); setTimeout(() => setCopied(0), 1500);
      if (editKey !== t.editKey) run('/api/admin/teams', 'GET');
    } catch (ex) { ex.status === 401 ? onAuthFail() : window.alert(ex.message); }
  };

  return (
    <>
      <form className="adm-filters" onSubmit={add}>
        <input placeholder="팀 이름 검색" value={q} onChange={e => setQ(e.target.value)} />
        <input placeholder="새 팀 이름" value={name} onChange={e => setName(e.target.value)} />
        <button className="adm-copy">팀 추가</button>
        <span className="adm-count">{shown.length}팀</span>
      </form>
      {err && <p className="adm-error">{err}</p>}
      <table className="adm-table">
        <thead><tr><th className="adm-grow">팀</th><th>출연</th><th>지난 출연</th><th>다음 출연</th><th className="adm-grow">멤버</th><th>소개 페이지</th><th className="adm-grow">메모</th><th></th></tr></thead>
        <tbody>
          {shown.map(t => (
            <tr key={t.id}>
              <td data-label="팀"><MemoInput value={t.name} placeholder="팀 이름" className="adm-name" onSave={v => run(`/api/admin/teams/${t.id}`, 'PATCH', { name: v })} /></td>
              <td data-label="출연">{t.shows || ''}</td>
              <td data-label="지난 출연" className="adm-dim">{t.last || ''}</td>
              <td data-label="다음 출연">{t.next || ''}</td>
              <td data-label="멤버" className="adm-wrap" title="☆ = 팀 소개 페이지에 이름·역할 공개 동의한 멤버">{t.members.map(m => `${m.publicOk ? '☆' : ''}${m.name}${m.leader ? '(리더)' : ''}`).join(', ')}</td>
              <td data-label="소개 페이지"><div className="adm-actions">
                {(t.intro || t.videos !== '[]' || t.links !== '[]') ? <a href={`/teams/${t.id}`} target="_blank" rel="noreferrer">보기</a> : <span className="adm-dim">비어 있음</span>}
                {/* 버튼 개수·글자 길이가 행마다 달라지면 칸 폭이 널뛴다 → 격자(admin.css .adm-actions), 재발급은 항상 그리되 링크 없으면 비활성=안 보임 */}
                <button className="adm-copy" onClick={() => copyKey(t, false)}>{copied === t.id ? '복사됨' : t.editKey ? '수정 링크 복사' : '수정 링크 만들기'}</button>
                <button className="adm-copy" onClick={() => copyKey(t, true)} disabled={!t.editKey} title={t.editKey ? '예전 링크를 못 쓰게 하고 새로 만듦' : '아직 만든 링크가 없음'}>재발급</button>
                <label className="adm-dim"><input type="checkbox" checked={!!t.hidden} onChange={e => run(`/api/admin/teams/${t.id}`, 'PATCH', { hidden: e.target.checked ? 1 : 0 })} /> 숨김</label>
              </div></td>
              <td data-label="메모"><MemoInput value={t.memo} onSave={memo => run(`/api/admin/teams/${t.id}`, 'PATCH', { memo })} /></td>
              <td className="adm-act"><button className="adm-del" onClick={() => remove(t)} title="삭제">✕</button></td>
            </tr>
          ))}
          {shown.length === 0 && <tr><td colSpan={8} className="adm-empty">팀 없음</td></tr>}
        </tbody>
      </table>
    </>
  );
}

// 공연 일정 + 라인업. 공개 /schedule 페이지가 같은 데이터를 그대로 보여줌
function Events({ onAuthFail }) {
  const { rows, err, run } = useList('/api/events', onAuthFail);
  const [teams, setTeams] = useState([]);
  useEffect(() => { api('/api/admin/teams').then(setTeams).catch(() => {}); }, [rows]); // 라인업에 새 이름을 치면 팀이 생기므로 따라 갱신
  const empty = { date: '', time: '', title: '', place: '', note: '' };
  const [f, setF] = useState(empty);
  const add = async e => { e.preventDefault(); await run('/api/admin/events', 'POST', f); setF(empty); };
  const edit = (id, k) => v => run(`/api/admin/events/${id}`, 'PATCH', { [k]: v });
  const addTeam = (id, input) => { const name = input.value.trim(); input.value = ''; if (name) run(`/api/admin/events/${id}/teams`, 'POST', { name }); };
  const today = todayStr();

  return (
    <>
      <form className="adm-filters" onSubmit={add}>
        <input type="date" required value={f.date} onChange={e => setF({ ...f, date: e.target.value })} />
        <input className="adm-short" placeholder="시간 15:00" value={f.time} onChange={e => setF({ ...f, time: e.target.value })} />
        <input required placeholder="제목 (정기모임 등)" value={f.title} onChange={e => setF({ ...f, title: e.target.value })} />
        <input className="adm-short" placeholder="장소" value={f.place} onChange={e => setF({ ...f, place: e.target.value })} />
        <button className="adm-copy">공연 추가</button>
        <span className="adm-count">{rows.length}건</span>
      </form>
      {err && <p className="adm-error">{err}</p>}
      <datalist id="adm-team-names">{teams.map(t => <option key={t.id} value={t.name} />)}</datalist>
      <table className="adm-table">
        <thead><tr><th>날짜</th><th>시간</th><th className="adm-grow-2">제목</th><th className="adm-grow">장소</th><th className="adm-grow-2">라인업</th><th className="adm-grow-2">비고</th><th></th></tr></thead>
        <tbody>
          {rows.map(ev => (
            <tr key={ev.id} className={ev.date < today ? 'adm-past' : ''}>
              <td data-label="날짜"><MemoInput type="date" value={ev.date} className="adm-name" onSave={edit(ev.id, 'date')} /></td>
              <td data-label="시간"><MemoInput value={ev.time} placeholder="시간" className="adm-short" onSave={edit(ev.id, 'time')} /></td>
              <td data-label="제목"><MemoInput value={ev.title} placeholder="제목" className="adm-name" onSave={edit(ev.id, 'title')} /></td>
              <td data-label="장소"><MemoInput value={ev.place} placeholder="장소" className="adm-name" onSave={edit(ev.id, 'place')} /></td>
              <td data-label="라인업" className="adm-lineup">
                {ev.teams.map(t => (
                  <span key={t.id} className="adm-chip">{t.name}
                    <button onClick={() => run(`/api/admin/events/${ev.id}/teams/${t.id}`, 'DELETE')} title="라인업에서 빼기">✕</button></span>
                ))}
                <input list="adm-team-names" placeholder="팀 추가" title="이름 치고 Enter" className="adm-short"
                  onKeyDown={e => e.key === 'Enter' && addTeam(ev.id, e.target)} />
              </td>
              <td data-label="비고"><MemoInput value={ev.note} placeholder="비고" onSave={edit(ev.id, 'note')} /></td>
              <td className="adm-act"><button className="adm-del" onClick={() => window.confirm(`${ev.date} ${ev.title} 삭제할까요?`) && run(`/api/admin/events/${ev.id}`, 'DELETE')} title="삭제">✕</button></td>
            </tr>
          ))}
          {rows.length === 0 && <tr><td colSpan={7} className="adm-empty">공연 없음</td></tr>}
        </tbody>
      </table>
    </>
  );
}

// 내 비밀번호 변경(전원) + 운영진 계정 관리(accounts 권한). 계정은 지우지 않고 끔 — 접속기록의 "누가"가 남도록
function Accounts({ me, onAuthFail }) {
  const manage = me.perms.includes('accounts');
  const { rows, err, run } = useList(manage ? '/api/admin/accounts' : '/api/admin/roles', onAuthFail);
  const [roles, setRoles] = useState([]);
  useEffect(() => { api('/api/admin/roles').then(setRoles).catch(() => {}); }, []);
  const [pw, setPw] = useState({ current: '', next: '' });
  const [msg, setMsg] = useState('');
  const changePw = async e => {
    e.preventDefault();
    try { await api('/api/admin/me/password', { method: 'POST', body: JSON.stringify(pw) }); setPw({ current: '', next: '' }); setMsg('비밀번호를 바꿨습니다. 다른 기기의 로그인은 끊겼습니다.'); }
    catch (ex) { setMsg(ex.message); }
  };
  const empty = { username: '', name: '', role: 'staff', password: '' };
  const [f, setF] = useState(empty);
  const add = async e => { e.preventDefault(); await run('/api/admin/accounts', 'POST', f); setF(empty); };
  const reset = a => {
    const password = window.prompt(`${a.name}(${a.username}) 새 비밀번호 (10자 이상). 그 사람의 로그인은 끊깁니다.`);
    if (password) run(`/api/admin/accounts/${a.id}`, 'PATCH', { password });
  };

  return (
    <>
      <form className="adm-filters" onSubmit={changePw}>
        <strong>{me.name} ({me.username} · {me.roleLabel})</strong>
        <input type="password" autoComplete="current-password" placeholder="현재 비밀번호" value={pw.current} onChange={e => setPw({ ...pw, current: e.target.value })} />
        <input type="password" autoComplete="new-password" placeholder="새 비밀번호 (10자 이상)" value={pw.next} onChange={e => setPw({ ...pw, next: e.target.value })} />
        <button className="adm-copy">비밀번호 변경</button>
        {msg && <span className="adm-dim">{msg}</span>}
      </form>
      {manage && <>
        <form className="adm-filters" onSubmit={add}>
          <input required placeholder="아이디 (영문 소문자)" autoCapitalize="none" value={f.username} onChange={e => setF({ ...f, username: e.target.value })} />
          <input required placeholder="이름" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} />
          <select value={f.role} onChange={e => setF({ ...f, role: e.target.value })}>{roles.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}</select>
          <input required type="password" autoComplete="new-password" placeholder="첫 비밀번호 (10자 이상)" value={f.password} onChange={e => setF({ ...f, password: e.target.value })} />
          <button className="adm-copy">계정 추가</button>
          <span className="adm-count">{rows.filter(a => a.active).length}명 활성</span>
        </form>
        {err && <p className="adm-error">{err}</p>}
        <p className="adm-dim">대표관리자 = 전부 · 운영진 = 공연 편집 + 멤버·예약 열람(상태·메모·팀·리더만 수정, 삭제 불가) · 공연 담당 = 팀·공연만(개인정보 못 봄)</p>
        <table className="adm-table">
          <thead><tr><th>아이디</th><th className="adm-grow">이름</th><th>역할</th><th>사용</th><th>만든 날</th><th>비밀번호</th></tr></thead>
          <tbody>
            {rows.map(a => (
              <tr key={a.id} className={a.active ? '' : 'adm-past'}>
                <td data-label="아이디">{a.username}</td>
                <td data-label="이름"><MemoInput value={a.name} placeholder="이름" className="adm-name" onSave={name => run(`/api/admin/accounts/${a.id}`, 'PATCH', { name })} /></td>
                <td data-label="역할"><select value={a.role} onChange={e => run(`/api/admin/accounts/${a.id}`, 'PATCH', { role: e.target.value })}>
                  {roles.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}</select></td>
                <td data-label="사용"><input type="checkbox" checked={!!a.active} title="끄면 바로 로그아웃되고 다시 로그인 못 함"
                  onChange={e => run(`/api/admin/accounts/${a.id}`, 'PATCH', { active: e.target.checked })} /></td>
                <td data-label="만든 날" className="adm-dim">{fmtDateTime(a.createdAt)}</td>
                <td data-label="비밀번호"><button className="adm-copy" onClick={() => reset(a)}>초기화</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </>}
    </>
  );
}

const TABS = [
  ['resv', '연습실 예약', 'people'],
  ['members', '멤버 신청', 'people'],
  ['teams', '팀', 'events'],
  ['events', '공연', 'events'],
  ['accounts', '계정', null], // 내 비밀번호 변경은 전원
];

function Admin() {
  const [me, setMe] = useState(undefined); // undefined = 확인 중, null = 로그인 필요
  const [tab, setTab] = useState(null);
  const onAuthFail = useCallback(() => setMe(null), []);
  const loadMe = useCallback(() => api('/api/admin/me').then(setMe).catch(() => setMe(null)), []);
  useEffect(() => { loadMe(); }, [loadMe]);

  if (me === undefined) return null;
  if (!me) return <div className="adm"><Login onDone={loadMe} /></div>;

  const tabs = TABS.filter(([, , perm]) => !perm || me.perms.includes(perm));
  const cur = tabs.some(([k]) => k === tab) ? tab : tabs[0][0];
  const full = me.perms.includes('people.full');
  const logout = async () => { await api('/api/admin/logout', { method: 'POST' }); setMe(null); };

  return (
    <div className="adm">
      <header className="adm-header">
        <strong>kband 관리자</strong>
        <nav>
          {tabs.map(([k, label]) => <button key={k} className={cur === k ? 'active' : ''} onClick={() => setTab(k)}>{label}</button>)}
        </nav>
        <span className="adm-me">{me.name} · {me.roleLabel}</span>
        <button className="adm-logout" onClick={logout}>로그아웃</button>
      </header>
      <main className="adm-main">
        {cur === 'resv' && <Reservations onAuthFail={onAuthFail} full={full} />}
        {cur === 'members' && <Members onAuthFail={onAuthFail} full={full} />}
        {cur === 'teams' && <Teams onAuthFail={onAuthFail} />}
        {cur === 'events' && <Events onAuthFail={onAuthFail} />}
        {cur === 'accounts' && <Accounts me={me} onAuthFail={onAuthFail} />}
      </main>
    </div>
  );
}

export default Admin;
