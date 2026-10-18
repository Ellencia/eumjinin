import { useState, useEffect, useRef } from 'react';
import { SLIDES } from './HeroSlider';

// 스플래시 체류: 히어로 첫 사진 디코드 + 폰트 준비를 기다리되 MIN~MAX 사이로 묶는다. 준비 전엔 90%까지만 시간 기반으로 오른다.
const MIN_MS = 500;
const MAX_MS = 3000;

function getWaveClipPath(progress, offset, isMobile) {
  const amplitude = isMobile ? 14 : 8;
  const cycles   = isMobile ? 2.4 : 4;   // 모바일: 주기 줄여서 ~30% 압축률
  const yCenter  = (100 + amplitude) - progress * (100 + amplitude * 2) / 100;
  const steps    = 40;

  const points = ['0% 100%', '100% 100%'];

  for (let i = steps; i >= 0; i--) {
    const x = (i / steps) * 100;
    const y = yCenter + Math.sin((i / steps) * Math.PI * cycles + offset) * amplitude;
    points.push(`${x}% ${Math.max(0, Math.min(100, y))}%`);
  }

  return `polygon(${points.join(', ')})`;
}

function LoadingSplash({ onDone }) {
  const [progress, setProgress] = useState(0);
  const [waveOffset, setWaveOffset] = useState(0);
  const [fading, setFading] = useState(false);
  const waveRafRef = useRef(null);
  const isMobile = useRef(window.innerWidth <= 640).current;

  // 물결 수평 이동 애니메이션 (독립적으로 계속 실행)
  useEffect(() => {
    const animateWave = () => {
      setWaveOffset((prev) => prev + 0.06);
      waveRafRef.current = requestAnimationFrame(animateWave);
    };
    waveRafRef.current = requestAnimationFrame(animateWave);
    return () => cancelAnimationFrame(waveRafRef.current);
  }, []);

  // 로딩 진행도: 실제 준비(첫 히어로 사진·폰트)를 기다림
  useEffect(() => {
    const start = Date.now();
    let ready = false;
    let raf = null;

    const img = new Image();
    img.src = SLIDES[0].src;
    const waits = [img.decode().catch(() => {}), document.fonts ? document.fonts.ready : Promise.resolve()];
    Promise.race([Promise.all(waits), new Promise((r) => setTimeout(r, MAX_MS))]).then(() => { ready = true; });

    const tick = () => {
      const elapsed = Date.now() - start;
      if (ready && elapsed >= MIN_MS) {
        setProgress(100);
        setTimeout(() => setFading(true), 200);
        setTimeout(onDone, 800);
        return;
      }
      const p = Math.min(elapsed / 1500, 1);
      setProgress(Math.floor((1 - Math.pow(1 - p, 2)) * 90));
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  return (
    <div className={`splash${fading ? ' splash-fade' : ''}`}>
      <div className="splash-content">
        <div className="splash-text-wrapper">
          <p className="splash-logo splash-logo-empty">音眞人</p>
          <p
            className="splash-logo splash-logo-fill"
            style={{ clipPath: getWaveClipPath(progress, waveOffset, isMobile) }}
          >
            音眞人
          </p>
        </div>
        <p className="splash-tagline">Music Community & Space</p>
        <p className="splash-percent">{progress}%</p>
      </div>
    </div>
  );
}

export default LoadingSplash;
