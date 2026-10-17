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
function MemoInput({ value, onSave }) {
  const [v, setV] = useState(value);
  useEffect(() => setV(value), [value]);
  return <input className="adm-memo" value={v} placeholder="메모" onChange={e => setV(e.target.value)}
    onBlur={() => v !== value && onSave(v)} />;
}

function Login({ onDone }) {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const submit = async e => {
    e.preventDefault();
    try { await api('/api/admin/login', { method: 'POST', body: JSON.stringify({ password: pw }) }); onDone(); }
    catch (ex) { setErr(ex.message); }
  };
  return (
    <form className="adm-login" onSubmit={submit}>
      <h1>kband 관리자</h1>
      <input type="password" autoFocus placeholder="비밀번호" value={pw} onChange={e => setPw(e.target.value)} />
      <button className="btn btn-primary">로그인</button>
      {err && <p className="adm-error">{err}</p>}
    </form>
  );
}

function Reservations({ onAuthFail }) {
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
        <thead><tr><th>날짜</th><th>시간</th><th>방</th><th>이름</th><th>연락처</th><th>상태</th><th>메모</th><th>신청일</th><th></th></tr></thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id} className={`st-${r.status}`}>
              <td>{r.date}</td>
              <td>{r.startTime}~{r.endTime}</td>
              <td>{roomName(r.roomId)}</td>
              <td>{r.name}</td>
              <td><a href={`tel:${r.phone}`}>{r.phone}</a></td>
              <td><select value={r.status} onChange={e => patch(r.id, { status: e.target.value })}>{RESV_STATUS.map(s => <option key={s}>{s}</option>)}</select></td>
              <td><MemoInput value={r.memo} onSave={memo => patch(r.id, { memo })} /></td>
              <td className="adm-dim">{fmtDateTime(r.createdAt)}</td>
              <td><button className="adm-del" onClick={() => remove(r.id)} title="삭제">✕</button></td>
            </tr>
          ))}
          {rows.length === 0 && <tr><td colSpan={9} className="adm-empty">예약 없음</td></tr>}
        </tbody>
      </table>
    </>
  );
}

function Members({ onAuthFail }) {
  const [f, setF] = useState({ q: '', status: '' });
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState('');

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
        <thead><tr><th>신청일</th><th>이름</th><th>연락처</th><th>이메일</th><th>밴드</th><th>역할</th><th>장르</th><th>지역</th><th>생년</th><th>소개</th><th>상태</th><th>메모</th><th></th></tr></thead>
        <tbody>
          {rows.map(m => (
            <tr key={m.id} className={`st-${m.status}`}>
              <td className="adm-dim">{fmtDateTime(m.createdAt)}</td>
              <td>{m.name}</td>
              <td><a href={`tel:${m.phone}`}>{m.phone}</a></td>
              <td><a href={`mailto:${m.email}`}>{m.email}</a></td>
              <td>{m.band}</td><td>{m.role}</td><td>{m.genre}</td><td>{m.location}</td><td>{m.birth}</td>
              <td className="adm-intro" title={m.intro}>{m.intro}</td>
              <td><select value={m.status} onChange={e => patch(m.id, { status: e.target.value })}>{MEMBER_STATUS.map(s => <option key={s}>{s}</option>)}</select></td>
              <td><MemoInput value={m.memo} onSave={memo => patch(m.id, { memo })} /></td>
              <td><button className="adm-del" onClick={() => remove(m.id)} title="삭제">✕</button></td>
            </tr>
          ))}
          {rows.length === 0 && <tr><td colSpan={13} className="adm-empty">신청 없음</td></tr>}
        </tbody>
      </table>
    </>
  );
}

function Admin() {
  const [authed, setAuthed] = useState(null); // null = 확인 중
  const [tab, setTab] = useState('resv');
  const onAuthFail = useCallback(() => setAuthed(false), []);

  useEffect(() => { api('/api/admin/me').then(() => setAuthed(true)).catch(() => setAuthed(false)); }, []);

  if (authed === null) return null;
  if (!authed) return <Login onDone={() => setAuthed(true)} />;

  const logout = async () => { await api('/api/admin/logout', { method: 'POST' }); setAuthed(false); };

  return (
    <div className="adm">
      <header className="adm-header">
        <strong>kband 관리자</strong>
        <nav>
          <button className={tab === 'resv' ? 'active' : ''} onClick={() => setTab('resv')}>연습실 예약</button>
          <button className={tab === 'members' ? 'active' : ''} onClick={() => setTab('members')}>멤버 신청</button>
        </nav>
        <button className="adm-logout" onClick={logout}>로그아웃</button>
      </header>
      <main className="adm-main">
        {tab === 'resv' ? <Reservations onAuthFail={onAuthFail} /> : <Members onAuthFail={onAuthFail} />}
      </main>
    </div>
  );
}

export default Admin;
