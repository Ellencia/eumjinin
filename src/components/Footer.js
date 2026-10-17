import { Link } from 'react-router-dom';

// 홈 섹션으로 이동. 다른 페이지에서는 홈으로 간 뒤 Home.js가 state.scrollTo로 스크롤
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <span className="footer-logo">🎵 음진인</span>
        <p className="footer-tagline">음악을 사랑하는 모든 이들을 위한 공간</p>
        <div className="footer-links">
          <Link to="/" state={{ scrollTo: 'about' }}>소개</Link>
          <Link to="/" state={{ scrollTo: 'spaces' }}>공간</Link>
          <Link to="/" state={{ scrollTo: 'join' }}>참여하기</Link>
        </div>
        <p className="footer-copy">© 2026 음진인. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;