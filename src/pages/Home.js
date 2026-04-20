import { useState, useEffect, useRef } from 'react';

function useCountUp(target, duration = 1800) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStarted(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
      else setCount(target);
    };
    requestAnimationFrame(step);
  }, [started, target, duration]);

  return { count, ref };
}

function AnimatedStat({ target, suffix, label }) {
  const { count, ref } = useCountUp(target);
  return (
    <div className="stat" ref={ref}>
      <span className="stat-num">{count}{suffix}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

function Home() {
  return (
    <section className="hero" id="home">
      <div className="hero-content">
        <p className="hero-eyebrow">🎶 Music Community & Space</p>
        <h1 className="hero-title">
          음악을 사랑하는<br />모든 이들을 위한 공간
        </h1>
        <p className="hero-desc">
          음진인은 뮤지션들이 모이고, 연습하고, 무대에 서는<br />
          커뮤니티 기반 음악 법인입니다.
        </p>
        <div className="hero-actions">
          <a href="#spaces" className="btn btn-primary">공간 둘러보기</a>
          <a href="#join" className="btn btn-outline">멤버 신청</a>
        </div>
      </div>
      <div className="hero-stats">
        <AnimatedStat target={100} suffix="+" label="소속 밴드 수" />
        <AnimatedStat target={3} suffix="+" label="연습 공간" />
        <div className="stat">
          <span className="stat-num">∞</span>
          <span className="stat-label">음악의 가능성</span>
        </div>
      </div>
    </section>
  );
}

export default Home;
