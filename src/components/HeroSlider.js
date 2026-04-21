import { useState, useEffect, useRef, useCallback } from 'react';
import stage1 from '../assets/stage1.webp';
import stage2 from '../assets/stage2.webp';
import stage3 from '../assets/stage3.webp';

export const SLIDES = [
  { type: 'image', src: stage1 },
  { type: 'image', src: stage2 },
  { type: 'image', src: stage3 },
];

const IMAGE_DURATION = 5000;

const FILL = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 };

function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);
  const videoRefs = useRef([]);

  const goNext = useCallback(() => {
    setCurrent((c) => (c + 1) % SLIDES.length);
  }, []);

  const goPrev = () => {
    setCurrent((c) => (c - 1 + SLIDES.length) % SLIDES.length);
  };

  useEffect(() => {
    clearTimeout(timerRef.current);
    const slide = SLIDES[current];
    if (slide.type === 'video') {
      const v = videoRefs.current[current];
      if (v) { v.currentTime = 0; v.play().catch(() => {}); }
    } else {
      timerRef.current = setTimeout(goNext, IMAGE_DURATION);
    }
    return () => clearTimeout(timerRef.current);
  }, [current, goNext]);

  return (
    <>
      {/* 슬라이드 이미지/영상 */}
      {SLIDES.map((slide, i) => {
        const active = i === current;
        const style = {
          ...FILL,
          objectFit: 'cover',
          opacity: active ? 1 : 0,
          transition: 'opacity 0.8s ease',
          zIndex: 0,
          animation: active && slide.type === 'image' ? 'ken-burns 6s ease-out forwards' : 'none',
        };

        if (slide.type === 'video') {
          return (
            <video
              key={i}
              ref={(el) => { videoRefs.current[i] = el; }}
              src={slide.src}
              muted playsInline preload="auto"
              onEnded={goNext}
              style={style}
            />
          );
        }
        return (
          <img key={i} src={slide.src} alt="" style={style} />
        );
      })}

      {/* 다크 오버레이 */}
      <div style={{
        ...FILL,
        zIndex: 1,
        background: 'linear-gradient(to bottom, rgba(10,5,30,0.5) 0%, rgba(10,5,30,0.3) 60%, rgba(10,5,30,0.55) 100%)',
      }} />

      {/* 화살표 */}
      <button className="slider-arrow slider-arrow-prev" style={{ zIndex: 2 }} onClick={goPrev} aria-label="이전">&#8249;</button>
      <button className="slider-arrow slider-arrow-next" style={{ zIndex: 2 }} onClick={goNext} aria-label="다음">&#8250;</button>

      {/* 점 인디케이터 */}
      <div className="slider-dots" style={{ zIndex: 2 }}>
        {SLIDES.map((_, i) => (
          <button
            key={i}
            className={`slider-dot${i === current ? ' slider-dot-active' : ''}`}
            onClick={() => setCurrent(i)}
            aria-label={`슬라이드 ${i + 1}`}
          />
        ))}
      </div>
    </>
  );
}

export default HeroSlider;
