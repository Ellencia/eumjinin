import { useState, useEffect, Fragment } from 'react';
import { useDesign } from '../../contexts/DesignContext';
import spaces from '../../data/spaces';
import './v1.css';

/* ===================== MARQUEE ===================== */
function Marquee({ items }) {
  const all = [...items, ...items];
  return (
    <div className="marquee">
      <div className="marquee-track">
        {all.map((t, i) => <span key={i}>{t}</span>)}
      </div>
    </div>
  );
}

/* ===================== SIDEBAR ===================== */
function Sidebar({ page, setPage, onChangeDesign }) {
  const items = [
    { key: 'home', num: '01', ko: '홈', en: 'INDEX' },
    { key: 'join', num: '02', ko: '연주자 가입', en: 'JOIN' },
    { key: 'practice', num: '03', ko: '연습실', en: 'STUDIO' },
    { key: 'bands', num: '04', ko: '소속 밴드', en: 'BANDS' },
    { key: 'events', num: '05', ko: '공연 일정', en: 'GIGS' },
    { key: 'gallery', num: '06', ko: '갤러리', en: 'GALLERY' },
    { key: 'faq', num: '07', ko: 'FAQ', en: 'FAQ' },
    { key: 'contact', num: '08', ko: '문의하기', en: 'CONTACT' },
  ];

  return (
    <aside className="sidebar">
      <div className="sb-brand">
        <div className="logo"></div>
        <div className="han">音眞人</div>
        <div className="ko">음 · 진 · 인</div>
        <div className="tag">EST. 2024 — SIDE B</div>
      </div>

      <nav className="sb-nav">
        <div className="label">／ NAVIGATE</div>
        {items.map(it => (
          <button
            key={it.key}
            className={page === it.key ? 'active' : ''}
            onClick={() => { setPage(it.key); window.scrollTo(0, 0); }}>
            <span className="num">{it.num}</span>
            <span>{it.ko}</span>
            <span className="en">{it.en}</span>
          </button>
        ))}
      </nav>

      <div className="sb-meta">
        <div className="row"><span><span className="led"></span>NOW PLAYING</span><span>33⅓ RPM</span></div>
        <div style={{marginTop: 8, opacity: 0.85}}>
          〈음악에 진심인<br/>사람들의 모임〉<br/>
          — Track {String(items.findIndex(i => i.key === page) + 1).padStart(2,'0')} / {items.length}
        </div>
        <button
          style={{marginTop: 12, width:'100%', padding:'8px', background:'transparent', border:'1px dashed rgba(244,236,216,0.3)', color:'var(--mustard)', fontFamily:"'JetBrains Mono',monospace", fontSize:10, letterSpacing:'0.2em', cursor:'pointer'}}
          onClick={onChangeDesign}
        >
          ／ DESIGN PILOT
        </button>
      </div>
    </aside>
  );
}

/* ===================== HOME PAGE ===================== */
function HomePage({ setPage }) {
  return (
    <div className="page-home">
      <section className="hero">
        <div className="hero-stamp">PRESS · PLAY</div>
        <div className="hero-vinyl"></div>
        <div className="hero-tag">音樂 ◆ 真心 ◆ 사람들의 모임</div>
        <h1 className="hero-title">
          음악에<br/>
          <em>진심</em>인<br/>
          사람들의 모임
          <span className="hanja">音 眞 人 — EUM·JIN·IN</span>
        </h1>
        <p className="hero-sub">
          노래 부르고 연주하는 즐거움이 전부인 사람들. 장르 불문, 실력 불문 — 모여서 합주하고,
          무대에 서고, 음악으로 노는 것을 좋아하는 모든 분들을 환영합니다.
        </p>
        <div className="hero-actions">
          <button className="btn btn-primary" onClick={() => setPage('join')}>
            연주자 가입 <span className="arrow">▶</span>
          </button>
          <button className="btn btn-ghost" onClick={() => setPage('practice')}>
            연습실 둘러보기 <span className="arrow">→</span>
          </button>
        </div>
      </section>

      <Marquee items={[
        '음악에 진심인 사람들의 모임',
        'BAND COLLECTIVE — SINCE 2024',
        'ART HALL K · 행주산성',
        'JAM · GIG · RECORD',
        '함께 합주합시다',
      ]}/>

      <section className="cassette-band">
        <div className="stat"><div className="num">12+</div><div className="lbl">소속 밴드</div></div>
        <div className="stat"><div className="num">87</div><div className="lbl">현역 연주자</div></div>
        <div className="stat"><div className="num">24</div><div className="lbl">공연 / 합주</div></div>
        <div className="stat"><div className="num">B1</div><div className="lbl">Art Hall K</div></div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <div className="section-num">／ 01 — MANIFESTO</div>
            <h2 className="section-title">우리가 <em>믿는 것</em></h2>
          </div>
          <p className="section-aside">
            잘하기보다 — 즐겁게.<br/>
            완벽하기보다 — 함께.<br/>
            결국 음악은, 진심.
          </p>
        </div>

        <div className="manifesto">
          <div className="m-card">
            <div className="corner"></div>
            <div className="num">01</div>
            <h3>장르 불문</h3>
            <p>록, 재즈, 인디, 포크, 펑크, 메탈, 발라드 — 어떤 음악이든 환영합니다. 좋아하는 음악이 있고, 그걸 함께 연주할 사람이 있다면 그것으로 충분합니다.</p>
          </div>
          <div className="m-card">
            <div className="corner"></div>
            <div className="num">02</div>
            <h3>실력보다 진심</h3>
            <p>오디션도, 평가도 없습니다. 처음 잡는 코드여도 좋고, 30년차 베테랑이어도 좋습니다. 음악을 진심으로 사랑하는 마음이 가입 자격입니다.</p>
          </div>
          <div className="m-card">
            <div className="corner"></div>
            <div className="num">03</div>
            <h3>모여서 노는 것</h3>
            <p>합주, 공연, 녹음, 그리고 그 사이의 수다. 음악을 핑계삼아 좋은 사람들과 어울리는 시간 — 그 자체가 음진인의 목적입니다.</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <div className="section-num">／ 02 — FEATURED</div>
            <h2 className="section-title">이번 달 <em>플레이리스트</em></h2>
          </div>
        </div>
        <div className="manifesto">
          <div className="card card-dark" style={{padding: '24px'}}>
            <div style={{fontFamily:"'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.2em', color: 'var(--mustard)'}}>SIDE A · TRACK 01</div>
            <h3 style={{fontFamily:"'Black Han Sans', serif", fontSize: 24, marginTop: 8, color: 'var(--cream)'}}>합주실 정기 오픈데이</h3>
            <p style={{fontFamily:"'Noto Serif KR', serif", fontSize: 14, lineHeight: 1.7, marginTop: 10, opacity: 0.78}}>
              매월 둘째 주 토요일, Art Hall K 지하 연습실을 누구나 자유롭게 사용할 수 있도록 개방합니다.
            </p>
            <button className="btn btn-ghost" style={{marginTop: 18, padding: '10px 18px', fontSize: 13}} onClick={() => setPage('practice')}>
              일정 보기 <span className="arrow">→</span>
            </button>
          </div>
          <div className="card card-dark" style={{padding: '24px'}}>
            <div style={{fontFamily:"'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.2em', color: 'var(--mustard)'}}>SIDE A · TRACK 02</div>
            <h3 style={{fontFamily:"'Black Han Sans', serif", fontSize: 24, marginTop: 8, color: 'var(--cream)'}}>음진인 정기 라이브</h3>
            <p style={{fontFamily:"'Noto Serif KR', serif", fontSize: 14, lineHeight: 1.7, marginTop: 10, opacity: 0.78}}>
              분기마다 Art Hall K 무대에서 열리는 합동 공연. 무대에 서고 싶은 모든 밴드 환영.
            </p>
            <button className="btn btn-ghost" style={{marginTop: 18, padding: '10px 18px', fontSize: 13}} onClick={() => setPage('events')}>
              공연 일정 <span className="arrow">→</span>
            </button>
          </div>
          <div className="card card-dark" style={{padding: '24px'}}>
            <div style={{fontFamily:"'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.2em', color: 'var(--mustard)'}}>SIDE B · TRACK 01</div>
            <h3 style={{fontFamily:"'Black Han Sans', serif", fontSize: 24, marginTop: 8, color: 'var(--cream)'}}>신규 연주자 모집</h3>
            <p style={{fontFamily:"'Noto Serif KR', serif", fontSize: 14, lineHeight: 1.7, marginTop: 10, opacity: 0.78}}>
              보컬 / 기타 / 베이스 / 드럼 / 키보드 / 관악 — 모든 파트 상시 모집 중입니다.
            </p>
            <button className="btn btn-ghost" style={{marginTop: 18, padding: '10px 18px', fontSize: 13}} onClick={() => setPage('join')}>
              가입하기 <span className="arrow">→</span>
            </button>
          </div>
        </div>
      </section>

      <div className="tape"></div>

      <section className="section" style={{textAlign: 'center', padding: '80px 64px'}}>
        <div className="section-num" style={{marginBottom: 24}}>／ EPILOGUE</div>
        <div style={{fontFamily:"'Noto Serif KR', serif", fontStyle: 'italic', fontSize: 'clamp(22px, 3vw, 36px)', lineHeight: 1.5, maxWidth: 760, margin: '0 auto', color: 'var(--cream)'}}>
          "모여서 즐겁게 노는 것 — 그것이 우리가<br/>음악에 진심인 방식."
        </div>
        <div style={{fontFamily:"'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.3em', color: 'var(--mustard)', marginTop: 28}}>
          ／ 音眞人 OFFICIAL ／
        </div>
      </section>
    </div>
  );
}

/* ===================== JOIN PAGE ===================== */
function JoinPage() {
  const [parts, setParts] = useState([]);
  const [genres, setGenres] = useState([]);
  const [days, setDays] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  const togglePart = (p) => setParts(parts.includes(p) ? parts.filter(x => x !== p) : [...parts, p]);
  const toggleGenre = (g) => setGenres(genres.includes(g) ? genres.filter(x => x !== g) : [...genres, g]);
  const toggleDay = (d) => setDays(days.includes(d) ? days.filter(x => x !== d) : [...days, d]);

  const partList = ['보컬', '기타', '베이스', '드럼', '키보드', '신디', '색소폰', '트럼펫', '바이올린', '기타 ETC'];
  const genreList = ['록', '메탈', '재즈', '인디', '포크', '팝', '발라드', '펑크', '블루스', '시티팝', 'R&B'];
  const dayList = ['월', '화', '수', '목', '금', '토', '일'];

  return (
    <div className="form-shell">
      <div className="form-side">
        <div>
          <div className="hero-tag">／ JOIN — 연주자 가입</div>
          <h1 style={{fontFamily:"'Black Han Sans', serif", fontSize: 'clamp(40px, 5vw, 68px)', lineHeight: 0.95, color: 'var(--cream)', marginBottom: 20}}>
            함께<br/><em style={{fontStyle: 'italic', color: 'var(--mustard)'}}>합주합시다</em>
          </h1>
          <p style={{fontFamily:"'Noto Serif KR', serif", fontSize: 16, lineHeight: 1.7, opacity: 0.85}}>
            아래 양식을 작성해주시면, 운영진이 검토 후 1주일 이내에 연락드립니다.
            오디션은 없습니다 — 음악을 사랑하는 마음이 자격입니다.
          </p>
        </div>

        <div className="quote">
          "음악은 혼자보다 함께 할 때 더 아름답습니다.<br/>
          진심으로 연주하는 모든 순간이 무대입니다."
        </div>

        <div className="notice">
          <strong>／ NOTICE</strong><br/>
          ◆ 가입비 없음 · 별도 회비 협의<br/>
          ◆ 연습실 우선 예약 가능<br/>
          ◆ 정기 합주 / 공연 자유 참여
        </div>
      </div>

      <div className="form-body">
        {submitted ? (
          <div style={{textAlign: 'center', padding: '60px 20px'}}>
            <div style={{fontFamily:"'Anton', sans-serif", fontSize: 64, color: 'var(--mustard)'}}>✓</div>
            <h2 style={{fontFamily:"'Black Han Sans', serif", fontSize: 36, color: 'var(--cream)', marginTop: 16}}>접수 완료!</h2>
            <p style={{fontFamily:"'Noto Serif KR', serif", fontSize: 16, marginTop: 14, opacity: 0.85}}>
              곧 운영진이 확인하고 연락드릴게요.<br/>음진인에 오신 것을 환영합니다.
            </p>
            <button className="btn btn-primary" style={{marginTop: 32}} onClick={() => setSubmitted(false)}>
              다시 작성 <span className="arrow">↺</span>
            </button>
          </div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
            <div className="section-num">／ A·SIDE — 기본 정보</div>
            <h2 style={{fontFamily:"'Black Han Sans', serif", fontSize: 28, color: 'var(--cream)', marginTop: 8, marginBottom: 28}}>당신을 알려주세요</h2>

            <div className="form-grid">
              <div className="field">
                <label>이름 / 닉네임 <span className="req">*</span></label>
                <input type="text" placeholder="예: 김OO / 진쓰" required/>
              </div>
              <div className="field">
                <label>활동명 (선택)</label>
                <input type="text" placeholder="무대에서 부를 이름"/>
              </div>
              <div className="field">
                <label>이메일 <span className="req">*</span></label>
                <input type="email" placeholder="you@example.com" required/>
              </div>
              <div className="field">
                <label>연락처 (전화) <span className="req">*</span></label>
                <input type="tel" placeholder="010-XXXX-XXXX" required/>
              </div>
            </div>

            <div className="section-num" style={{marginTop: 32}}>／ B·SIDE — 음악</div>
            <h2 style={{fontFamily:"'Black Han Sans', serif", fontSize: 28, color: 'var(--cream)', marginTop: 8, marginBottom: 22}}>당신의 사운드</h2>

            <div className="field">
              <label>담당 파트 <span className="req">*</span> <span style={{opacity: 0.5, marginLeft: 8}}>(복수 선택 가능)</span></label>
              <div className="chip-row">
                {partList.map(p => (
                  <span key={p} className={'chip ' + (parts.includes(p) ? 'on' : '')} onClick={() => togglePart(p)}>{p}</span>
                ))}
              </div>
            </div>

            <div className="field">
              <label>선호 장르 <span style={{opacity: 0.5, marginLeft: 8}}>(복수 선택 가능)</span></label>
              <div className="chip-row">
                {genreList.map(g => (
                  <span key={g} className={'chip ' + (genres.includes(g) ? 'on' : '')} onClick={() => toggleGenre(g)}>{g}</span>
                ))}
              </div>
            </div>

            <div className="form-grid">
              <div className="field">
                <label>경력 / 연주 가능 햇수</label>
                <select>
                  <option>1년 미만 (입문)</option>
                  <option>1~3년</option>
                  <option>3~5년</option>
                  <option>5~10년</option>
                  <option>10년 이상</option>
                </select>
              </div>
              <div className="field">
                <label>현재 소속 밴드 유무</label>
                <select>
                  <option>없음 — 새 멤버 찾는 중</option>
                  <option>있음 — 추가 활동 희망</option>
                  <option>잠시 휴식 중</option>
                </select>
              </div>
            </div>

            <div className="section-num" style={{marginTop: 32}}>／ EXTRA — 활동 정보</div>
            <h2 style={{fontFamily:"'Black Han Sans', serif", fontSize: 28, color: 'var(--cream)', marginTop: 8, marginBottom: 22}}>언제 · 어디서</h2>

            <div className="field">
              <label>활동 가능 지역</label>
              <input type="text" placeholder="예: 고양시, 서울 서북부, 일산 인근"/>
            </div>

            <div className="field">
              <label>활동 가능 요일</label>
              <div className="chip-row">
                {dayList.map(d => (
                  <span key={d} className={'chip ' + (days.includes(d) ? 'on' : '')} onClick={() => toggleDay(d)}>{d}요일</span>
                ))}
              </div>
            </div>

            <div className="field">
              <label>활동 가능 시간대</label>
              <input type="text" placeholder="예: 평일 저녁 7시 이후, 주말 오후"/>
            </div>

            <div className="field">
              <label>자기소개 / 한마디</label>
              <textarea placeholder="좋아하는 음악, 영향 받은 아티스트, 하고 싶은 음악 등 자유롭게 적어주세요."></textarea>
            </div>

            <div style={{display:'flex', gap: 12, marginTop: 32, flexWrap: 'wrap'}}>
              <button type="submit" className="btn btn-primary">가입 신청 <span className="arrow">▶</span></button>
              <button type="reset" className="btn btn-ghost" onClick={() => { setParts([]); setGenres([]); setDays([]); }}>다시 작성</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

/* ===================== PRACTICE PAGE ===================== */
function PracticePage() {
  const [selected, setSelected] = useState(null);
  const rehearsalSpaces = spaces.filter(s => s.type === 'rehearsal');

  const days = ['월', '화', '수', '목', '금', '토', '일'];
  const slots = ['10-12', '13-15', '15-17', '17-19', '19-21', '21-23'];
  const grid = [
    ['F','F','B','F','F','B','F'],
    ['B','F','F','B','F','F','F'],
    ['F','B','F','F','F','B','B'],
    ['F','F','F','B','B','F','F'],
    ['B','B','F','F','F','B','F'],
    ['F','F','B','F','F','F','F'],
  ];

  const handleReserve = () => {
    alert('현재 외부 예약 링크가 설정되어 있지 않습니다.\n곧 연결됩니다 — 문의하기 페이지로 연락 주세요.');
  };

  return (
    <div>
      <section className="hero" style={{padding: '64px 64px 48px'}}>
        <div className="hero-stamp">SIDE B · STUDIO</div>
        <div className="hero-tag">／ PRACTICE STUDIO ／ ART HALL K</div>
        <h1 className="hero-title" style={{fontSize: 'clamp(48px, 7vw, 96px)', maxWidth: 'none'}}>
          지하의 <em>합주실</em>
          <span className="hanja">B1 — ART HALL K</span>
        </h1>
        <p className="hero-sub">
          행주산성 〈해찬송학김〉 빌딩 지하 1층, Art Hall K. 무대와 합주실, 그리고 연주자들이 모이는
          공간. 음진인 멤버는 우선 예약 가능, 외부 이용도 환영합니다.
        </p>
        <div className="hero-actions">
          <button className="btn btn-primary" onClick={handleReserve}>
            온라인 예약 <span className="arrow">▶</span>
          </button>
        </div>
      </section>

      <Marquee items={[
        'ART HALL K · B1',
        '합주 / 녹음 / 무대',
        '음진인 멤버 우선 예약',
        '행주산성 해찬송학김 빌딩',
        'OPEN 10:00 — 23:00',
      ]}/>

      <section className="section">
        <div className="section-head">
          <div>
            <div className="section-num">／ 01 — LOCATION</div>
            <h2 className="section-title">위치 <em>& 찾아오는 길</em></h2>
          </div>
        </div>
        <div className="pr-grid">
          <div className="pr-map">
            <div className="crosshair"></div>
            <div className="pin">▼</div>
            <div className="label">ART HALL K</div>
          </div>
          <div className="contact-info">
            <div className="row">
              <span className="key">주소</span>
              <span>경기도 고양시 덕양구 행주산성로 일대<br/>〈해찬송학김〉 빌딩 지하 1층 (B1)</span>
            </div>
            <div className="row">
              <span className="key">시설</span>
              <span>공연 무대 1 · 합주실 2 · 라운지</span>
            </div>
            <div className="row">
              <span className="key">운영</span>
              <span>매일 10:00 ~ 23:00<br/>(점검일은 공지)</span>
            </div>
            <div className="row">
              <span className="key">교통</span>
              <span>주차 가능 · 행신역 차량 10분</span>
            </div>
            <div className="row">
              <span className="key">예약</span>
              <span>온라인 예약 시스템 <span style={{color: 'var(--mustard)'}}>(준비중)</span><br/>당분간 문의하기로 연락 주세요.</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <div className="section-num">／ 02 — SPACES</div>
            <h2 className="section-title">연습실 <em>안내</em></h2>
          </div>
        </div>
        <div className="eq-list">
          {rehearsalSpaces.map(space => (
            <div key={space.id} className="eq-item" style={{flexDirection:'column', alignItems:'flex-start', gap: 6}}>
              <div style={{display:'flex', width:'100%', alignItems:'center', gap:12}}>
                <div className="icon">{space.name.charAt(0)}</div>
                <span style={{fontWeight:700}}>{space.name}</span>
                <span className="qty">최대 {space.capacity}인</span>
              </div>
              <p style={{fontFamily:"'Noto Serif KR', serif", fontSize:13, opacity:0.8, paddingLeft:42}}>{space.desc}</p>
              <div style={{paddingLeft:42, display:'flex', flexWrap:'wrap', gap:6, marginTop:4}}>
                {space.equipment.map(eq => (
                  <span key={eq} style={{fontFamily:"'JetBrains Mono', monospace", fontSize:10, padding:'2px 8px', border:'1px solid rgba(244,236,216,0.25)', color:'var(--mustard)'}}>{eq}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <div className="section-num">／ 03 — PRICING</div>
            <h2 className="section-title">이용 <em>요금</em></h2>
          </div>
          <p className="section-aside">음진인 정회원은 50% 할인. 정기 멤버 할인 별도 협의.</p>
        </div>
        <div className="price-grid">
          <div className="price-card">
            <div className="name">／ HOURLY</div>
            <div className="amt">15,000<small>원/시</small></div>
            <div className="desc">합주실 단시간 이용. 장비 풀패키지 포함. 최소 2시간부터.</div>
          </div>
          <div className="price-card featured">
            <div className="name">／ DAY PASS</div>
            <div className="amt">60,000<small>원/일</small></div>
            <div className="desc">하루 종일 합주실 점유. 녹음 장비 사용 포함. 음진인 50% 할인.</div>
          </div>
          <div className="price-card">
            <div className="name">／ MONTHLY</div>
            <div className="amt">200,000<small>원/월</small></div>
            <div className="desc">정기 합주를 위한 월간 패스. 우선 예약 + 무료 녹음 1회.</div>
          </div>
        </div>
      </section>

      <section className="section" id="schedule">
        <div className="section-head">
          <div>
            <div className="section-num">／ 04 — SCHEDULE</div>
            <h2 className="section-title">예약 <em>가능 시간표</em></h2>
          </div>
          <p className="section-aside">
            {selected
              ? <span style={{color: 'var(--mustard)'}}>선택: {selected}</span>
              : '비어있는 칸을 클릭하세요. 빨간색은 이미 예약된 시간입니다.'}
          </p>
        </div>

        <div className="schedule">
          <div className="cell head">／</div>
          {days.map(d => <div key={d} className="cell head">{d}</div>)}
          {slots.map((slot, i) => (
            <Fragment key={slot}>
              <div className="cell head">{slot}</div>
              {grid[i].map((status, j) => (
                <div
                  key={j}
                  className={'cell ' + (status === 'B' ? 'booked' : 'free')}
                  onClick={() => status === 'F' && setSelected(`${days[j]} ${slot}`)}>
                  {status === 'B' ? 'BOOKED' : 'OPEN'}
                </div>
              ))}
            </Fragment>
          ))}
        </div>

        <div style={{display:'flex', gap: 12, marginTop: 28, flexWrap: 'wrap', alignItems: 'center'}}>
          <button className="btn btn-primary" disabled={!selected} onClick={handleReserve} style={{opacity: selected ? 1 : 0.5}}>
            예약 진행 <span className="arrow">▶</span>
          </button>
          <div className="notice" style={{flex: 1, minWidth: 280}}>
            <strong>／ REDIRECT</strong> &nbsp; 외부 예약 시스템으로 연결됩니다.
            현재는 운영진이 직접 응대하므로 <strong style={{color: 'var(--cream)'}}>'문의하기'</strong>로 연락 주세요.
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <div className="section-num">／ 05 — RULES</div>
            <h2 className="section-title">운영 <em>규칙</em></h2>
          </div>
        </div>
        <div className="manifesto">
          {[
            ['사용 후 정리','연주 후 장비는 원위치, 쓰레기는 본인이 가져가기.'],
            ['시간 엄수','예약 시간 5분 전 입실, 종료 5분 전 정리 시작.'],
            ['장비 보호','앰프/믹서 출력은 권장 범위 내, 손상 시 변상.'],
            ['음량 매너','지하라도 22시 이후엔 모니터링 우선.'],
            ['외부인 동반','동반 1인까지 무료, 그 이상은 사전 공지.'],
            ['녹음 가능','자체 녹음 자유, 외부 공유 시 출처 표기.'],
          ].map(([t, b], i) => (
            <div key={t} className="m-card">
              <div className="num">{String(i+1).padStart(2,'0')}</div>
              <h3>{t}</h3>
              <p>{b}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ===================== BANDS PAGE ===================== */
function BandsPage() {
  const bands = [
    { name: '진심로드', cover: '眞', genres: 'ROCK / GRUNGE', desc: '90년대 얼터너티브 사운드를 사랑하는 4인조. 결성 2년차, 가끔 신곡도 씁니다.', members: ['VOC', 'GTR', 'BASS', 'DR'] },
    { name: '음진살롱', cover: '音', genres: 'JAZZ / CITY-POP', desc: '일요일 저녁의 라운지를 노래합니다. 어쿠스틱 위주, 가끔 색소폰이 합류.', members: ['VOC', 'KEY', 'BASS', 'SAX'] },
    { name: 'B1 BOYS', cover: 'B1', genres: 'PUNK / GARAGE', desc: '지하실에서만 연주합니다. 빠르고 짧고 시끄럽게 — 그게 다입니다.', members: ['VOC', 'GTR', 'GTR', 'BASS', 'DR'] },
    { name: '한밤의 카세트', cover: '夜', genres: 'INDIE / DREAM-POP', desc: '늦은 밤 합주실을 가장 사랑하는 5인. 첫 EP 녹음 중.', members: ['VOC', 'GTR', 'KEY', 'BASS', 'DR'] },
    { name: '행주산성록스', cover: '行', genres: 'CLASSIC ROCK', desc: '60~70년대 클래식 록 커버 밴드. 멤버 평균 연주 경력 15년 이상.', members: ['VOC', 'GTR', 'GTR', 'BASS', 'KEY', 'DR'] },
    { name: '진심포크', cover: '心', genres: 'FOLK / BALLAD', desc: '어쿠스틱 기타와 목소리만으로. 카페 라이브 단골.', members: ['VOC', 'GTR', 'GTR'] },
  ];

  return (
    <div>
      <section className="hero" style={{padding: '64px 64px 48px'}}>
        <div className="hero-tag">／ MEMBER BANDS</div>
        <h1 className="hero-title" style={{fontSize: 'clamp(48px, 7vw, 96px)'}}>
          소속 <em>밴드</em>
          <span className="hanja">12 BANDS — AND COUNTING</span>
        </h1>
        <p className="hero-sub">현재 음진인에서 활동 중인 밴드들. 각자 다른 음악, 같은 진심.</p>
      </section>

      <section className="section">
        <div className="bands-grid">
          {bands.map(b => (
            <div key={b.name} className="band-card">
              <div className="cover">{b.cover}</div>
              <div className="info">
                <h3>{b.name}</h3>
                <div className="genres">{b.genres}</div>
                <p>{b.desc}</p>
                <div className="members">
                  {b.members.map((m, i) => <span key={i} className="pill">{m}</span>)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ===================== EVENTS PAGE ===================== */
function EventsPage() {
  const events = [
    { day: '17', mon: 'MAY', title: '음진인 봄 정기 라이브', loc: 'Art Hall K · B1', time: '19:00', tag: 'OPEN' },
    { day: '24', mon: 'MAY', title: '오픈데이 / 합주실 개방', loc: 'Art Hall K · B1', time: '14:00', tag: 'FREE' },
    { day: '07', mon: 'JUN', title: '진심포크 단독 공연', loc: 'Art Hall K · 무대', time: '20:00', tag: 'TICKET' },
    { day: '21', mon: 'JUN', title: 'B1 BOYS x 행주산성록스', loc: 'Art Hall K · 무대', time: '20:00', tag: 'TICKET' },
    { day: '12', mon: 'JUL', title: '여름 잼 세션', loc: 'Art Hall K · B1', time: '15:00', tag: 'OPEN' },
    { day: '02', mon: 'AUG', title: '음진인 신인 쇼케이스', loc: 'Art Hall K · 무대', time: '19:30', tag: 'OPEN' },
  ];

  return (
    <div>
      <section className="hero" style={{padding: '64px 64px 48px'}}>
        <div className="hero-tag">／ UPCOMING GIGS</div>
        <h1 className="hero-title" style={{fontSize: 'clamp(48px, 7vw, 96px)'}}>
          공연 <em>일정</em>
          <span className="hanja">SCHEDULE — 2026</span>
        </h1>
        <p className="hero-sub">정기 라이브와 오픈데이, 단독 공연 일정. 모두 Art Hall K에서 진행됩니다.</p>
      </section>

      <section className="section">
        {events.map((e, i) => (
          <div key={i} className="ticket">
            <div className="ticket-body">
              <div className="ticket-title">{e.title}</div>
              <div className="ticket-meta">
                <span>◆ {e.loc}</span>
                <span>◆ {e.time} 입장</span>
              </div>
              <span className="ticket-tag">{e.tag === 'OPEN' ? '자유 관람' : e.tag === 'FREE' ? '무료 개방' : '예매 필요'}</span>
            </div>
            <div className="ticket-stub">
              <div className="ticket-day">{e.day}</div>
              <div className="ticket-mon">{e.mon} 2026</div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

/* ===================== GALLERY PAGE ===================== */
function GalleryPage() {
  const items = [
    ['봄 라이브', '2026.03.21'],
    ['합주실 #2', '2026.02.14'],
    ['B1 BOYS 녹음', '2026.01.30'],
    ['오픈데이', '2026.04.12'],
    ['진심포크 카페', '2026.03.07'],
    ['음진살롱 리허설', '2026.02.28'],
    ['행주산성록스', '2026.04.05'],
    ['한밤의 카세트', '2026.03.18'],
    ['단체 사진', '2026.01.01'],
  ];

  return (
    <div>
      <section className="hero" style={{padding: '64px 64px 48px'}}>
        <div className="hero-tag">／ ARCHIVE</div>
        <h1 className="hero-title" style={{fontSize: 'clamp(48px, 7vw, 96px)'}}>
          갤러리 <em>& 기록</em>
          <span className="hanja">PHOTOGRAPHS</span>
        </h1>
        <p className="hero-sub">합주실, 무대, 그 사이의 모든 순간들. 카세트 한 면처럼 차곡차곡 쌓이는 기록.</p>
      </section>
      <section className="section">
        <div className="gallery-grid">
          {items.map(([cap, date], i) => (
            <div key={i} className="polaroid">
              <div className="photo">PHOTO<br/>{String(i+1).padStart(2,'0')}</div>
              <div className="caption">{cap}</div>
              <div className="meta">{date}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ===================== FAQ PAGE ===================== */
function FaqPage() {
  const [open, setOpen] = useState(0);
  const qs = [
    ['가입에 자격 제한이 있나요?', '없습니다. 음악을 진심으로 좋아하는 마음이면 충분합니다. 입문자부터 베테랑까지 환영합니다.'],
    ['오디션이 있나요?', '없습니다. 별도의 평가나 심사 없이, 가입 신청서를 검토하고 운영진이 연락드립니다.'],
    ['회비가 있나요?', '기본 가입비는 없습니다. 다만 연습실 / 공연 운영을 위해 최소한의 정기 회비를 협의할 수 있습니다.'],
    ['연습실은 누구나 쓸 수 있나요?', 'Art Hall K 합주실은 음진인 멤버 우선 예약 후, 외부 이용도 가능합니다. 멤버는 50% 할인.'],
    ['공연 참여는 의무인가요?', '아닙니다. 정기 라이브와 오픈데이는 자유 참여입니다. 무대에 서고 싶을 때 손 들어주세요.'],
    ['특정 장르가 있어야 하나요?', '없습니다. 록, 재즈, 인디, 포크, 발라드 등 모든 장르 환영. 같은 취향의 사람이 자연스레 모입니다.'],
    ['혼자 가입해도 합주가 가능한가요?', '네. 운영진이 다른 멤버와 매칭을 도와드리고, 정기 잼 세션을 통해 자연스럽게 합주 기회를 만들 수 있습니다.'],
    ['운영 주체는 누구인가요?', '뜻이 맞는 연주자들이 자발적으로 운영하는 비영리 모임입니다. 향후 법인화도 검토 중입니다.'],
  ];

  return (
    <div>
      <section className="hero" style={{padding: '64px 64px 48px'}}>
        <div className="hero-tag">／ FREQUENTLY ASKED</div>
        <h1 className="hero-title" style={{fontSize: 'clamp(48px, 7vw, 96px)'}}>
          자주 묻는 <em>질문</em>
          <span className="hanja">FAQ</span>
        </h1>
        <p className="hero-sub">가입과 활동, 연습실 이용에 대해 자주 묻는 것들.</p>
      </section>

      <section className="section">
        {qs.map(([q, a], i) => (
          <div key={i} className={'faq-item ' + (open === i ? 'open' : '')} onClick={() => setOpen(open === i ? -1 : i)}>
            <div className="faq-q">
              <span className="q-num">Q{String(i+1).padStart(2,'0')}</span>
              <span style={{flex: 1}}>{q}</span>
              <span className="toggle">+</span>
            </div>
            <div className="faq-a">{a}</div>
          </div>
        ))}
      </section>
    </div>
  );
}

/* ===================== CONTACT PAGE ===================== */
function ContactPage() {
  return (
    <div>
      <section className="hero" style={{padding: '64px 64px 48px'}}>
        <div className="hero-tag">／ GET IN TOUCH</div>
        <h1 className="hero-title" style={{fontSize: 'clamp(48px, 7vw, 96px)'}}>
          문의 <em>하기</em>
          <span className="hanja">CONTACT — 連絡</span>
        </h1>
        <p className="hero-sub">가입, 공연, 연습실, 협업 문의 등 무엇이든 환영합니다.</p>
      </section>

      <section className="section">
        <div className="contact-grid">
          <div className="contact-info">
            <div className="row">
              <span className="key">／ EMAIL</span>
              <span>contact@eumjinin.kr<br/>booking@eumjinin.kr</span>
            </div>
            <div className="row">
              <span className="key">／ KAKAO</span>
              <span>오픈채팅 〈음진인 라운지〉</span>
            </div>
            <div className="row">
              <span className="key">／ INSTAGRAM</span>
              <span>@eumjinin_official</span>
            </div>
            <div className="row">
              <span className="key">／ ADDRESS</span>
              <span>경기 고양시 행주산성<br/>해찬송학김 빌딩 B1<br/>Art Hall K</span>
            </div>
            <div className="row">
              <span className="key">／ HOURS</span>
              <span>평일 14:00 ~ 22:00<br/>주말 11:00 ~ 23:00</span>
            </div>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); alert('문의가 접수되었습니다. 곧 회신드릴게요.'); }}>
            <div className="field"><label>성함</label><input type="text" placeholder="홍길동" required/></div>
            <div className="field"><label>이메일</label><input type="email" placeholder="you@example.com" required/></div>
            <div className="field">
              <label>문의 종류</label>
              <select>
                <option>가입 문의</option>
                <option>연습실 예약</option>
                <option>공연 / 섭외</option>
                <option>협업 / 제휴</option>
                <option>기타</option>
              </select>
            </div>
            <div className="field"><label>내용</label><textarea placeholder="자유롭게 적어주세요." style={{minHeight: 130}}></textarea></div>
            <button type="submit" className="btn btn-primary">전송 <span className="arrow">▶</span></button>
          </form>
        </div>
      </section>
    </div>
  );
}

/* ===================== V1APP ROOT ===================== */
function V1App() {
  const [page, setPage] = useState('home');
  const { setDesign } = useDesign();

  useEffect(() => {
    document.body.classList.add('v1-active');
    return () => document.body.classList.remove('v1-active');
  }, []);

  return (
    <div className="v1-root">
      <div className="grain" />
      <div className="scanlines" />
      <div className="vignette" />
      <div className="app-shell">
        <Sidebar page={page} setPage={setPage} onChangeDesign={() => setDesign('default')} />
        <main className="main">
          {page === 'home' && <HomePage setPage={setPage} />}
          {page === 'join' && <JoinPage />}
          {page === 'practice' && <PracticePage />}
          {page === 'bands' && <BandsPage />}
          {page === 'events' && <EventsPage />}
          {page === 'gallery' && <GalleryPage />}
          {page === 'faq' && <FaqPage />}
          {page === 'contact' && <ContactPage />}
        </main>
      </div>
    </div>
  );
}

export default V1App;
