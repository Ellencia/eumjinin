import { useState, useRef, useMemo, useEffect } from 'react';
import Reveal from '../components/Reveal';
import ConsentCheck from '../components/ConsentCheck';
import { AnimatedCheck } from '../components/Icons';

const GENRES = ['팝', '록', '재즈', 'R&B', '클래식', '힙합', '인디', '기타'];
const ROLES = ['보컬', '기타', '베이스', '드럼', '키보드/피아노', '현악기', '관악기', '작곡/편곡', '그 외'];
const CONFETTI_COLORS = ['#F2E205', '#FFF27A', '#EDEBE4', '#ffffff', '#A3A1A8'];

// 시안 A+D: 한 화면에 한 단계. 필수 칸은 모두 1단계라 거기서만 막음
const STEPS = [
  { label: '연락처', title: '어떻게 연락드릴까요?', q: '세 칸 모두 필수입니다.' },
  { label: '밴드', title: '어떤 음악을 하세요?', q: '아직 밴드가 없어도 괜찮습니다.' },
  { label: '소개', title: '조금만 더 알려주세요', q: '동의 말고는 모두 선택입니다.' },
];
const REQUIRED = ['name', 'phone', 'email'];

const today = new Date().toISOString().split('T')[0];

function getFieldError(name, value) {
  switch (name) {
    case 'name':
      if (!value.trim()) return '이름을 입력해주세요.';
      // server.js isName과 같은 규칙
      if (!/^\p{L}[\p{L}\s.'·-]*$/u.test(value.trim()) || /[ㄱ-ㆎ]/.test(value)
        || value.match(/\p{L}/gu).length < 2) return '이름을 정확히 입력해주세요.';
      return '';
    case 'email':
      if (!value.trim()) return '이메일을 입력해주세요.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) return '올바른 이메일 형식이 아닙니다.';
      return '';
    case 'phone':
      if (!value) return '연락처를 입력해주세요.';
      if (!/^\d{3}-\d{3,4}-\d{4}$/.test(value)) return '전화번호 형식이 올바르지 않습니다. (예: 010-0000-0000)';
      return '';
    default:
      return '';
  }
}

function formatPhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

function Confetti() {
  const pieces = useMemo(() =>
    Array.from({ length: 72 }, (_, i) => ({
      key: i,
      style: {
        left: `${Math.random() * 100}%`,
        background: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        animationDuration: `${0.9 + Math.random() * 1.4}s`,
        animationDelay: `${Math.random() * 0.6}s`,
        width: `${6 + Math.random() * 6}px`,
        height: `${10 + Math.random() * 8}px`,
        borderRadius: Math.random() > 0.5 ? '50%' : '2px',
        transform: `rotate(${Math.random() * 360}deg)`,
      },
    })), []);

  return (
    <div className="confetti-container" aria-hidden="true">
      {pieces.map((p) => (
        <span key={p.key} className="confetti-piece" style={p.style} />
      ))}
    </div>
  );
}

function Join() {
  const [form, setForm] = useState({
    name: '', email: '', band: '', role: '', leader: false,
    location: '', birth: '', genre: '', phone: '', intro: '',
  });
  const [consent, setConsent] = useState(false);
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});
  const btnRef = useRef(null);
  const headRef = useRef(null);
  const moved = useRef(false);

  // 단계가 바뀌면 제목으로 포커스(키보드·화면낭독기). 첫 렌더는 건너뜀
  useEffect(() => {
    if (moved.current) headRef.current?.focus({ preventScroll: true });
  }, [step]);

  const goTo = (n) => { moved.current = true; setError(''); setStep(n); };

  const handleChange = (e) => {
    const value = e.target.name === 'phone'
      ? formatPhone(e.target.value)
      : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const handleBlur = (e) => {
    setTouched((prev) => ({ ...prev, [e.target.name]: true }));
  };

  const fieldError = (name) => touched[name] ? getFieldError(name, form[name]) : '';
  const fieldStatus = (name) => {
    if (!touched[name]) return '';
    return getFieldError(name, form[name]) ? ' input-invalid' : ' input-valid';
  };

  const handleRipple = (e) => {
    const btn = btnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const circle = document.createElement('span');
    circle.className = 'ripple-circle';
    circle.style.width = circle.style.height = `${size}px`;
    circle.style.left = `${e.clientX - rect.left - size / 2}px`;
    circle.style.top = `${e.clientY - rect.top - size / 2}px`;
    btn.appendChild(circle);
    circle.addEventListener('animationend', () => circle.remove());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === 0) {
      // 필수 필드 전부 touched로 표시해서 에러 노출
      setTouched((prev) => Object.fromEntries([...REQUIRED.map(f => [f, true]), ...Object.entries(prev)]));
      if (REQUIRED.some(f => getFieldError(f, form[f]))) return;
    }
    if (step < STEPS.length - 1) { goTo(step + 1); return; }
    if (!consent) { setError('개인정보 수집·이용에 동의해주세요.'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, consent }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '신청 중 오류가 발생했습니다.');
        return;
      }
      setSubmitted(true);
    } catch {
      setError('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <section className="join" id="join">
        <Confetti />
        <div className="join-inner">
          <div className="join-success">
            <AnimatedCheck />
            <h2>신청이 완료됐어요!</h2>
            <p>{form.name}님, 신청이 접수되었습니다.<br />담당자가 확인 후 연락드릴게요.</p>
            <button className="join-next" onClick={() => { setSubmitted(false); setStep(0); }}>
              돌아가기
            </button>
          </div>
        </div>
      </section>
    );
  }

  const req = <em>필수</em>;

  return (
    <section className="join" id="join">
      <div className="join-inner">
        <Reveal>
          <p className="join-kicker">JOIN · 멤버 신청</p>
          <h2 className="join-title">같이<br />무대에<br />서요</h2>
          <p className="join-lead">함께 음악을 만들어갈 멤버를 기다리고 있습니다. 매달 정기 공연이 열립니다.</p>
        </Reveal>
        <Reveal delay={120}>
        <form className="join-form" onSubmit={handleSubmit} noValidate>
          <div className="join-prog" aria-hidden="true">
            {STEPS.map((s, i) => <i key={s.label} className={i <= step ? 'on' : ''} />)}
          </div>
          <ol className="join-steps">
            {STEPS.map((s, i) => (
              <li key={s.label} className={i === step ? 'cur' : ''} aria-current={i === step ? 'step' : undefined}>
                {String(i + 1).padStart(2, '0')} {s.label}
              </li>
            ))}
          </ol>
          {/* 1단계에선 자리만 지켜서(숨김) 아래 내용이 단계마다 들썩이지 않게 */}
          <button type="button" className="join-back" disabled={step === 0} onClick={() => goTo(step - 1)}>← 이전</button>

          <fieldset className="join-step" key={step}>
            <h3 ref={headRef} tabIndex={-1}>{STEPS[step].title}</h3>
            <p className="join-q">{STEPS[step].q}</p>

            {step === 0 && (
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="join-name">이름 {req}</label>
                  <input
                    id="join-name" type="text" name="name" placeholder="홍길동"
                    value={form.name} onChange={handleChange} onBlur={handleBlur}
                    className={fieldStatus('name')}
                  />
                  {fieldError('name') && <span className="field-error">{fieldError('name')}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="join-phone">연락처 {req}</label>
                  <input
                    id="join-phone" type="tel" name="phone" placeholder="010-0000-0000"
                    value={form.phone} onChange={handleChange} onBlur={handleBlur}
                    className={fieldStatus('phone')}
                  />
                  {fieldError('phone') && <span className="field-error">{fieldError('phone')}</span>}
                </div>
                <div className="form-group form-full">
                  <label htmlFor="join-email">이메일 {req}</label>
                  <input
                    id="join-email" type="email" name="email" placeholder="example@email.com"
                    value={form.email} onChange={handleChange} onBlur={handleBlur}
                    className={fieldStatus('email')}
                  />
                  {fieldError('email') && <span className="field-error">{fieldError('email')}</span>}
                </div>
              </div>
            )}

            {step === 1 && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="join-role">밴드 역할</label>
                    <select id="join-role" name="role" value={form.role} onChange={handleChange}>
                      <option value="">선택하세요</option>
                      {ROLES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="join-genre">선호 장르</label>
                    <select id="join-genre" name="genre" value={form.genre} onChange={handleChange}>
                      <option value="">선택하세요</option>
                      {GENRES.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group form-full">
                    <label htmlFor="join-band">소속 밴드명</label>
                    <input
                      id="join-band" type="text" name="band" placeholder="밴드 이름 (없으면 비워두세요)"
                      value={form.band} onChange={handleChange}
                    />
                  </div>
                </div>
                <label className="check-row">
                  <input
                    type="checkbox" name="leader" checked={form.leader}
                    onChange={(e) => setForm({ ...form, leader: e.target.checked })}
                  />
                  <span>밴드 리더(팀장)입니다 <small>— 리더 단톡방에도 초대해 드립니다</small></span>
                </label>
              </>
            )}

            {step === 2 && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="join-location">거주지</label>
                    <input
                      id="join-location" type="text" name="location" placeholder="예: 마포구, 홍대동"
                      value={form.location} onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="join-birth">생년월일</label>
                    <input
                      id="join-birth" type="date" name="birth" max={today}
                      value={form.birth} onChange={handleChange}
                    />
                  </div>
                  <div className="form-group form-full">
                    <label htmlFor="join-intro">자기소개</label>
                    <textarea
                      id="join-intro" name="intro"
                      placeholder="음악 경력이나 하고 싶은 활동을 자유롭게 적어주세요."
                      rows={4}
                      value={form.intro}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <ConsentCheck
                  checked={consent} onChange={setConsent}
                  items="이름, 이메일, 연락처(필수) / 소속 밴드, 역할, 리더 여부, 거주지, 생년월일, 장르, 자기소개(선택)"
                  purpose="멤버 신청 접수 및 연락"
                />
              </>
            )}
          </fieldset>

          {error && <p className="form-error">{error}</p>}
          <div className="join-nav">
            <button
              ref={btnRef}
              type="submit"
              className="join-next btn-ripple"
              disabled={loading}
              onClick={handleRipple}
            >
              {step < STEPS.length - 1
                ? '다음'
                : loading ? '신청 중...' : '신청하기'}
            </button>
          </div>
        </form>
        </Reveal>
      </div>
    </section>
  );
}

export default Join;
