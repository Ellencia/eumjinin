// Home page
function HomePage({ setPage, tweaks }) {
  const heroBg = tweaks.heroVariant;

  return (
    <div className="page-home">
      <section className="hero" data-screen-label="01 Home">
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

      <section className="section" data-screen-label="01 Home — Manifesto">
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

      <section className="section" data-screen-label="01 Home — Featured">
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

      <section className="section" data-screen-label="01 Home — Quote" style={{textAlign: 'center', padding: '80px 64px'}}>
        <div className="section-num" style={{marginBottom: 24}}>／ EPILOGUE</div>
        <div style={{fontFamily:"'Noto Serif KR', serif", fontStyle: 'italic', fontSize: 'clamp(22px, 3vw, 36px)', lineHeight: 1.5, maxWidth: 760, margin: '0 auto', color: 'var(--cream)'}}>
          “모여서 즐겁게 노는 것 — 그것이 우리가<br/>음악에 진심인 방식.”
        </div>
        <div style={{fontFamily:"'JetBrains Mono', monospace", fontSize: 11, letterSpacing: '0.3em', color: 'var(--mustard)', marginTop: 28}}>
          ／ 音眞人 OFFICIAL ／
        </div>
      </section>
    </div>
  );
}

window.HomePage = HomePage;
