import { useState, useRef, useMemo } from 'react';
import Reveal from '../components/Reveal';

const GENRES = ['팝', '록', '재즈', 'R&B', '클래식', '힙합', '인디', '기타'];
const ROLES = ['보컬', '기타', '베이스', '드럼', '키보드/피아노', '현악기', '관악기', '작곡/편곡', '그 외'];
const CONFETTI_COLORS = ['#a78bfa', '#f472b6', '#fbbf24', '#34d399', '#60a5fa', '#f87171', '#fb923c'];

const today = new Date().toISOString().split('T')[0];

function getFieldError(name, value) {
  switch (name) {
    case 'name':
      if (!value.trim()) return '이름을 입력해주세요.';
      if (value.trim().length < 2) return '이름은 2자 이상이어야 합니다.';
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
    name: '', email: '', band: '', role: '',
    location: '', birth: '', genre: '', phone: '', intro: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});
  const btnRef = useRef(null);

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
    // 필수 필드 전부 touched로 표시해서 에러 노출
    const requiredFields = ['name', 'email', 'phone'];
    setTouched((prev) => Object.fromEntries([...requiredFields.map(f => [f, true]), ...Object.entries(prev)]));
    if (requiredFields.some(f => getFieldError(f, form[f]))) return;
    setError('');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
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
        <div className="section-container join-success">
          <span className="success-icon">🎉</span>
          <h2>신청이 완료됐어요!</h2>
          <p>{form.name}님, 음진인 가족이 되신 것을 환영합니다.<br />곧 이메일로 안내드릴게요.</p>
          <button className="btn btn-primary" onClick={() => setSubmitted(false)}>
            돌아가기
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="join" id="join">
      <div className="section-container">
        <Reveal>
          <h2 className="section-title">멤버 신청</h2>
          <p className="section-sub">
            함께 음악을 만들어갈 멤버를 기다리고 있습니다.
          </p>
        </Reveal>
        <Reveal delay={120}>
        <form className="join-form" onSubmit={handleSubmit}>

          <div className="form-row">
            <div className="form-group">
              <label>이름 *</label>
              <input
                type="text" name="name" placeholder="홍길동"
                value={form.name} onChange={handleChange} onBlur={handleBlur}
                className={fieldStatus('name')}
              />
              {fieldError('name') && <span className="field-error">{fieldError('name')}</span>}
            </div>
            <div className="form-group">
              <label>이메일 *</label>
              <input
                type="email" name="email" placeholder="example@email.com"
                value={form.email} onChange={handleChange} onBlur={handleBlur}
                className={fieldStatus('email')}
              />
              {fieldError('email') && <span className="field-error">{fieldError('email')}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>소속 밴드명</label>
              <input
                type="text" name="band" placeholder="밴드 이름 (없으면 비워두세요)"
                value={form.band} onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>밴드 역할</label>
              <select name="role" value={form.role} onChange={handleChange}>
                <option value="">선택하세요</option>
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>거주지</label>
              <input
                type="text" name="location" placeholder="예: 마포구, 홍대동"
                value={form.location} onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>생년월일</label>
              <input
                type="date" name="birth" max={today}
                value={form.birth} onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>선호 장르</label>
              <select name="genre" value={form.genre} onChange={handleChange}>
                <option value="">선택하세요</option>
                {GENRES.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>연락처 *</label>
              <input
                type="tel" name="phone" placeholder="010-0000-0000"
                value={form.phone} onChange={handleChange} onBlur={handleBlur}
                className={fieldStatus('phone')}
              />
              {fieldError('phone') && <span className="field-error">{fieldError('phone')}</span>}
            </div>
          </div>

          <div className="form-group">
            <label>자기소개</label>
            <textarea
              name="intro"
              placeholder="음악 경력이나 하고 싶은 활동을 자유롭게 적어주세요."
              rows={4}
              value={form.intro}
              onChange={handleChange}
            />
          </div>

          {error && <p className="form-error">{error}</p>}
          <button
            ref={btnRef}
            type="submit"
            className="btn btn-primary btn-full btn-ripple"
            disabled={loading}
            onClick={handleRipple}
          >
            {loading ? '신청 중...' : '신청하기'}
          </button>
        </form>
        </Reveal>
      </div>
    </section>
  );
}

export default Join;
