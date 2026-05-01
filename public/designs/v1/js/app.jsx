// 음진인 — App entry
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accentColor": "#D4A437",
  "burgundyDepth": "#5C0A14",
  "scanlines": true,
  "grain": true,
  "vignette": true,
  "spinSpeed": 14,
  "marqueeSpeed": 38,
  "reservationUrl": "",
  "heroVariant": "vinyl"
}/*EDITMODE-END*/;

function App() {
  const [page, setPage] = React.useState('home');
  const [tweaks, setTweak] = window.useTweaks(TWEAK_DEFAULTS);

  // Apply tweak CSS vars
  React.useEffect(() => {
    document.documentElement.style.setProperty('--mustard', tweaks.accentColor);
    document.documentElement.style.setProperty('--burgundy', tweaks.burgundyDepth);
  }, [tweaks.accentColor, tweaks.burgundyDepth]);

  // Spin / marquee speed
  React.useEffect(() => {
    const style = document.getElementById('dynamic-anim') || (() => {
      const s = document.createElement('style'); s.id = 'dynamic-anim'; document.head.appendChild(s); return s;
    })();
    style.textContent = `
      .hero-vinyl { animation-duration: ${tweaks.spinSpeed}s !important; }
      .marquee-track { animation-duration: ${tweaks.marqueeSpeed}s !important; }
    `;
  }, [tweaks.spinSpeed, tweaks.marqueeSpeed]);

  const renderPage = () => {
    switch (page) {
      case 'home': return <HomePage setPage={setPage} tweaks={tweaks}/>;
      case 'join': return <JoinPage/>;
      case 'practice': return <PracticePage tweaks={tweaks}/>;
      case 'bands': return <BandsPage/>;
      case 'events': return <EventsPage/>;
      case 'gallery': return <GalleryPage/>;
      case 'faq': return <FaqPage/>;
      case 'contact': return <ContactPage/>;
      default: return <HomePage setPage={setPage} tweaks={tweaks}/>;
    }
  };

  return (
    <>
      {tweaks.grain && <div className="grain"></div>}
      {tweaks.scanlines && <div className="scanlines"></div>}
      {tweaks.vignette && <div className="vignette"></div>}

      <div className="app-shell">
        <Sidebar page={page} setPage={setPage}/>
        <main className="main">{renderPage()}</main>
      </div>

      {window.TweaksPanel && (
        <TweaksPanel title="Tweaks">
          <TweakSection title="컬러">
            <TweakColor label="액센트 (머스타드)" value={tweaks.accentColor} onChange={v => setTweak('accentColor', v)}/>
            <TweakColor label="버건디 베이스" value={tweaks.burgundyDepth} onChange={v => setTweak('burgundyDepth', v)}/>
          </TweakSection>
          <TweakSection title="질감 / 무드">
            <TweakToggle label="필름 그레인" value={tweaks.grain} onChange={v => setTweak('grain', v)}/>
            <TweakToggle label="스캔라인" value={tweaks.scanlines} onChange={v => setTweak('scanlines', v)}/>
            <TweakToggle label="비네팅" value={tweaks.vignette} onChange={v => setTweak('vignette', v)}/>
          </TweakSection>
          <TweakSection title="애니메이션">
            <TweakSlider label="LP 회전 속도 (초)" value={tweaks.spinSpeed} min={2} max={40} step={1} onChange={v => setTweak('spinSpeed', v)}/>
            <TweakSlider label="마키 속도 (초)" value={tweaks.marqueeSpeed} min={10} max={120} step={2} onChange={v => setTweak('marqueeSpeed', v)}/>
          </TweakSection>
          <TweakSection title="연습실 예약">
            <TweakText label="외부 예약 URL" value={tweaks.reservationUrl} onChange={v => setTweak('reservationUrl', v)} placeholder="https://booking.example.com"/>
          </TweakSection>
        </TweaksPanel>
      )}
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
