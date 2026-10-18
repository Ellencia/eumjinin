import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/Logo1.png';
import { MusicIcon, DoorOpenIcon, SproutIcon, CalendarIcon, CommunityIcon } from './Icons';

const NAV_ITEMS = [
  {
    label: '소개',
    Icon: MusicIcon,
    dropdown: [
      { label: '인사말',    href: '/about/greeting' },
      { label: '연혁',      href: '/about/history' },
      { label: '오시는 길', href: '/about/location' },
    ],
  },
  {
    label: '공간',
    Icon: DoorOpenIcon,
    dropdown: [
      { label: '공간 안내',  href: '/spaces' },
      { label: '자료실',     href: '/community/archive' },
    ],
  },
  {
    label: '커뮤니티',
    Icon: CommunityIcon,
    dropdown: [
      { label: '자유게시판', href: '/community/board' },
      { label: 'Q&A', href: '/community/qna' },
    ],
  },
  {
    label: '프로젝트',
    Icon: SproutIcon,
    dropdown: [
      { label: '프로젝트 연혁', href: '/projects/overview' },
      { label: '진행 중 프로젝트', href: '/projects/ongoing' },
    ],
  }
];

const RIGHT_ITEMS = [
  { label: '연습실 예약', href: '/reservation', highlight: true },
];

const dropdownItems = NAV_ITEMS.filter((item) => item.dropdown);

function Navbar() {
  const [activeMenu, setActiveMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 10);
      if (currentY > lastScrollY.current && currentY > 80) {
        setHidden(true);
      } else {
        setHidden(false);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigate = useNavigate();
  const megaOpen = activeMenu !== null;

  const handleJoinClick = () => {
    closeAll();
    navigate('/', { state: { scrollTo: 'join' } });
  };

  const closeAll = () => {
    setActiveMenu(null);
    setMobileOpen(false);
    setMobileExpanded(null);
  };

  return (
    <>
      {/* 메가 메뉴 오버레이 */}
      {megaOpen && (
        <div className="mega-overlay" onMouseEnter={() => setActiveMenu(null)} />
      )}

      <nav className={`navbar${scrolled ? ' navbar-scrolled' : ''}${hidden && !mobileOpen ? ' navbar-hidden' : ''}`} onMouseLeave={() => setActiveMenu(null)}>
        <div className="navbar-inner">

          {/* 로고 */}
          <Link to="/" className="navbar-logo" onClick={closeAll}>
            <img src={logo} alt="音眞人" className="navbar-logo-img" />
          </Link>

          {/* 데스크톱 중앙 메뉴 */}
          <ul className="desktop-menu desktop-menu-center">
            {NAV_ITEMS.map((item) => (
              <li
                key={item.label}
                className={`nav-item ${activeMenu === item.label ? 'nav-active' : ''}`}
                onMouseEnter={() => setActiveMenu(item.label)}
              >
                <button type="button" className="nav-link nav-menu-button"
                  aria-expanded={activeMenu === item.label}
                  onClick={() => setActiveMenu(activeMenu === item.label ? null : item.label)}>
                  <span className="menu-icon"><item.Icon /></span>{item.label}
                </button>
              </li>
            ))}
          </ul>

          {/* 데스크톱 우측 메뉴 */}
          <ul className="desktop-menu desktop-menu-right">
            {RIGHT_ITEMS.map((item) => (
              <li key={item.label} className="nav-item" onMouseEnter={() => setActiveMenu(null)}>
                <Link
                  to={item.href}
                  className={`nav-link ${item.highlight ? 'nav-highlight' : 'nav-preview-link'}`}
                  onClick={closeAll}
                >
                  <span className="menu-icon"><CalendarIcon /></span>{item.label}
                </Link>
              </li>
            ))}
            <li onMouseEnter={() => setActiveMenu(null)}>
              <button className="navbar-cta" onClick={handleJoinClick}>
                멤버 신청
              </button>
            </li>
          </ul>

          {/* 모바일 햄버거 */}
          <button className={`navbar-toggle${mobileOpen ? ' is-open' : ''}`}
            aria-label={mobileOpen ? '메뉴 닫기' : '메뉴 열기'} aria-expanded={mobileOpen}
            aria-controls="mobile-navigation" onClick={() => setMobileOpen(!mobileOpen)}>
            <span /><span /><span />
          </button>
        </div>

        {/* 메가 메뉴 패널 */}
        <div className={`mega-menu ${megaOpen ? 'mega-open' : ''}`}>
          <div className="mega-menu-inner">
            {dropdownItems.map((item) => (
              <div
                key={item.label}
                className={`mega-column ${activeMenu === item.label ? 'mega-column-active' : ''}`}
                onMouseEnter={() => setActiveMenu(item.label)}
              >
                <p className="mega-column-title">{item.label}</p>
                <ul className="mega-column-list">
                  {item.dropdown.map((sub) => (
                    <li key={sub.label}>
                      <Link
                        to={sub.href}
                        className="mega-link"
                        onClick={closeAll}
                      >
                        {sub.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </nav>

      {/* 모바일 메뉴 */}
      {mobileOpen && (
        <div className="mobile-menu" id="mobile-navigation">
          {NAV_ITEMS.map((item) => (
            <div key={item.label} className="mobile-item">
              <button
                className="mobile-trigger"
                aria-expanded={mobileExpanded === item.label}
                onClick={() =>
                  setMobileExpanded(mobileExpanded === item.label ? null : item.label)
                }
              >
                <span className="menu-label"><span className="menu-icon"><item.Icon /></span>{item.label}</span>
                <span className={`mobile-arrow ${mobileExpanded === item.label ? 'up' : ''}`}>▾</span>
              </button>
              {mobileExpanded === item.label && (
                <ul className="mobile-dropdown">
                  {item.dropdown.map((sub) => (
                    <li key={sub.label}>
                      <Link to={sub.href} className="mobile-sub-link" onClick={closeAll}>
                        {sub.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
          {RIGHT_ITEMS.map((item) => (
            <div key={item.label} className="mobile-item">
              <Link
                to={item.href}
                className={`mobile-link ${item.highlight ? 'mobile-highlight' : ''}`}
                onClick={closeAll}
              >
                <span className="menu-icon"><CalendarIcon /></span>{item.label}
              </Link>
            </div>
          ))}
          <div className="mobile-item">
            <button className="mobile-cta" onClick={handleJoinClick}>
              멤버 신청
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
