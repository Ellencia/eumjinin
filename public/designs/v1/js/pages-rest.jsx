// Bands / Events / Gallery / FAQ / Contact pages

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
    <div data-screen-label="04 Bands">
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
    <div data-screen-label="05 Events">
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
    <div data-screen-label="06 Gallery">
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

function FaqPage() {
  const [open, setOpen] = React.useState(0);
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
    <div data-screen-label="07 FAQ">
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

function ContactPage() {
  return (
    <div data-screen-label="08 Contact">
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

window.BandsPage = BandsPage;
window.EventsPage = EventsPage;
window.GalleryPage = GalleryPage;
window.FaqPage = FaqPage;
window.ContactPage = ContactPage;
