import { useState, useEffect } from 'react';

function LoadingSplash({ onDone }) {
  const [progress, setProgress] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const duration = 1800;
    const start = Date.now();

    const tick = () => {
      const elapsed = Date.now() - start;
      const p = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - p, 2);
      setProgress(Math.floor(eased * 100));

      if (p < 1) {
        requestAnimationFrame(tick);
      } else {
        setProgress(100);
        setTimeout(() => setFading(true), 200);
        setTimeout(onDone, 800);
      }
    };

    requestAnimationFrame(tick);
  }, [onDone]);

  return (
    <div className={`splash${fading ? ' splash-fade' : ''}`}>
      <div className="splash-content">

        {/* 차오르는 텍스트 */}
        <div className="splash-text-wrapper">
          {/* 바닥 레이어 — 흐릿한 윤곽 */}
          <p className="splash-logo splash-logo-empty">音眞人</p>
          {/* 위 레이어 — 아래에서 위로 채워짐 */}
          <p
            className="splash-logo splash-logo-fill"
            style={{ clipPath: `inset(${100 - progress}% 0 0 0)` }}
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
