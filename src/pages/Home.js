import { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { SplashContext } from '../App';
import HeroSlider from '../components/HeroSlider';

function useCountUp(target, duration = 1800) {
  const [count, setCount] = useState(0);
  const splashLoading = useContext(SplashContext);

  useEffect(() => {
    if (splashLoading) return; // 스플래시가 끝날 때까지 대기
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
      else setCount(target);
    };
    requestAnimationFrame(step);
  }, [splashLoading, target, duration]);

  return count;
}

function AnimatedStat({ target, suffix, label }) {
  const count = useCountUp(target);
  return (
    <div className="stat">
      <span className="stat-num">{count}{suffix}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

function Home() {
  const location = useLocation();
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    if (location.state?.scrollTo) {
      const el = document.getElementById(location.state.scrollTo);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location.state]);

  // 스크롤 진행도 계산 (히어로 높이 기준 0~1)
  useEffect(() => {
    const handleScroll = () => {
      const hero = document.getElementById('home');
      if (!hero) return;
      const progress = Math.min(window.scrollY / hero.offsetHeight, 1);
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToJoin = (e) => {
    e.preventDefault();
    document.getElementById('join')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero" id="home">
      <HeroSlider />
      {/* 하단 그라데이션 - 스크롤하면 아래에서 올라옴 */}
      <div
        className="hero-bottom-gradient"
        style={{ transform: `translateY(${scrollProgress > 0 ? 0 : 100}%)` }}
      />
      {/* 스크롤 연동 전환 오버레이 */}
      <div
        className="hero-transition-overlay"
        style={{ opacity: scrollProgress }}
      />
      <div className="hero-content">
        <p className="hero-eyebrow">🎶 Music Community & Space</p>
        <h1 className="hero-title">
          음악을 사랑하는<br />모든 이들을 위한 공간
        </h1>
        <p className="hero-desc">
          음진인은 뮤지션들이 모이고, 연습하고, 무대에 서는<br />
          커뮤니티 기반 음악 모임입니다.
        </p>
        <div className="hero-actions">
          <a href="#spaces" className="btn btn-primary">공간 둘러보기</a>
          <a href="#join" className="btn btn-outline" onClick={scrollToJoin}>멤버 신청</a>
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
