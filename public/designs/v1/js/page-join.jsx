// Join page — 연주자 가입 폼
function JoinPage() {
  const [parts, setParts] = React.useState([]);
  const [genres, setGenres] = React.useState([]);
  const [days, setDays] = React.useState([]);
  const [submitted, setSubmitted] = React.useState(false);

  const togglePart = (p) => setParts(parts.includes(p) ? parts.filter(x => x !== p) : [...parts, p]);
  const toggleGenre = (g) => setGenres(genres.includes(g) ? genres.filter(x => x !== g) : [...genres, g]);
  const toggleDay = (d) => setDays(days.includes(d) ? days.filter(x => x !== d) : [...days, d]);

  const partList = ['보컬', '기타', '베이스', '드럼', '키보드', '신디', '색소폰', '트럼펫', '바이올린', '기타 ETC'];
  const genreList = ['록', '메탈', '재즈', '인디', '포크', '팝', '발라드', '펑크', '블루스', '시티팝', 'R&B'];
  const dayList = ['월', '화', '수', '목', '금', '토', '일'];

  return (
    <div className="form-shell" data-screen-label="02 Join">
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
          “음악은 혼자보다 함께 할 때 더 아름답습니다.<br/>
          진심으로 연주하는 모든 순간이 무대입니다.”
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

window.JoinPage = JoinPage;
