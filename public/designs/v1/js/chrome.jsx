// Sidebar component
function Sidebar({ page, setPage }) {
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
      </div>
    </aside>
  );
}

// Marquee
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

window.Sidebar = Sidebar;
window.Marquee = Marquee;
