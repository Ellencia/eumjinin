// Practice page — 연습실 안내 / 예약 (Art Hall K, B1)
function PracticePage({ tweaks }) {
  const [selected, setSelected] = React.useState(null);
  const reservationUrl = tweaks.reservationUrl || '';

  const days = ['월', '화', '수', '목', '금', '토', '일'];
  const slots = ['10-12', '13-15', '15-17', '17-19', '19-21', '21-23'];
  // sample availability (B = booked, F = free)
  const grid = [
    ['F','F','B','F','F','B','F'],
    ['B','F','F','B','F','F','F'],
    ['F','B','F','F','F','B','B'],
    ['F','F','F','B','B','F','F'],
    ['B','B','F','F','F','B','F'],
    ['F','F','B','F','F','F','F'],
  ];

  const handleReserve = () => {
    if (reservationUrl) {
      window.open(reservationUrl, '_blank', 'noopener');
    } else {
      alert('현재 외부 예약 링크가 설정되어 있지 않습니다.\n곧 연결됩니다 — 문의하기 페이지로 연락 주세요.');
    }
  };

  return (
    <div data-screen-label="03 Practice Studio">
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
          <a className="btn btn-ghost" href="#schedule">
            시간표 보기 <span className="arrow">↓</span>
          </a>
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
            <div className="section-num">／ 02 — EQUIPMENT</div>
            <h2 className="section-title">시설 <em>& 장비</em></h2>
          </div>
        </div>
        <div className="eq-list">
          {[
            ['DR','Pearl 5피스 드럼 세트','x2'],
            ['BS','베이스 앰프 (Ampeg)','x2'],
            ['GT','기타 앰프 (Marshall, Fender)','x3'],
            ['KB','키보드 (Nord Stage 3)','x1'],
            ['MC','보컬 마이크 (SM58)','x6'],
            ['MX','믹서 / PA 시스템','풀세트'],
            ['MN','모니터 스피커','x4'],
            ['RC','녹음 인터페이스 (UA)','x1'],
          ].map(([ic, name, qty]) => (
            <div key={name} className="eq-item">
              <div className="icon">{ic}</div>
              <span>{name}</span>
              <span className="qty">{qty}</span>
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
            <React.Fragment key={slot}>
              <div className="cell head">{slot}</div>
              {grid[i].map((status, j) => (
                <div
                  key={j}
                  className={'cell ' + (status === 'B' ? 'booked' : 'free')}
                  onClick={() => status === 'F' && setSelected(`${days[j]} ${slot}`)}>
                  {status === 'B' ? 'BOOKED' : 'OPEN'}
                </div>
              ))}
            </React.Fragment>
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

window.PracticePage = PracticePage;
