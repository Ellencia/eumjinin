import { useState } from 'react';
import { Link } from 'react-router-dom';

const NAV_ITEMS = [
  {
    label: '소개',
    dropdown: [
      { label: '인사말',    href: '/about/greeting' },
      { label: '연혁',      href: '/about/history' },
      { label: '오시는 길', href: '/about/location' },
    ],
  },
  {
    label: '공간',
    dropdown: [
      { label: '공간 안내',  href: '/spaces' },
      { label: '자료실',     href: '/community/archive' },
    ],
  },
  {
    label: '커뮤니티',
    dropdown: [
      { label: '자유게시판', href: '/community/board' },
      { label: 'Q&A', href: '/community/qna' },
    ],
  },
  {
    label: '프로젝트',
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

  const megaOpen = activeMenu !== null;

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

      <nav className="navbar" onMouseLeave={() => setActiveMenu(null)}>
        <div className="navbar-inner">

          {/* 로고 */}
          <Link to="/" className="navbar-logo" onClick={closeAll}>
            🎵 Harmonia
          </Link>

          {/* 데스크톱 중앙 메뉴 */}
          <ul className="desktop-menu desktop-menu-center">
            {NAV_ITEMS.map((item) => (
              <li
                key={item.label}
                className={`nav-item ${activeMenu === item.label ? 'nav-active' : ''}`}
                onMouseEnter={() => setActiveMenu(item.label)}
              >
                <span className="nav-link">{item.label}</span>
              </li>
            ))}
          </ul>

          {/* 데스크톱 우측 메뉴 */}
          <ul className="desktop-menu desktop-menu-right">
            {RIGHT_ITEMS.map((item) => (
              <li key={item.label} className="nav-item" onMouseEnter={() => setActiveMenu(null)}>
                <Link to={item.href} className="nav-link nav-highlight" onClick={closeAll}>
                  🎸 {item.label}
                </Link>
              </li>
            ))}
            <li onMouseEnter={() => setActiveMenu(null)}>
              <Link to="/#join" className="navbar-cta" onClick={closeAll}>
                멤버 신청
              </Link>
            </li>
          </ul>

          {/* 모바일 햄버거 */}
          <button className="navbar-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? '✕' : '☰'}
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
        <div className="mobile-menu">
          {NAV_ITEMS.map((item) => (
            <div key={item.label} className="mobile-item">
              <button
                className="mobile-trigger"
                onClick={() =>
                  setMobileExpanded(mobileExpanded === item.label ? null : item.label)
                }
              >
                {item.label}
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
              <Link to={item.href} className="mobile-link mobile-highlight" onClick={closeAll}>
                🎸 {item.label}
              </Link>
            </div>
          ))}
          <div className="mobile-item">
            <Link to="/#join" className="mobile-cta" onClick={closeAll}>
              멤버 신청
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;