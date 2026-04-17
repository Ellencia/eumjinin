import { useState, useRef } from 'react';
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
      { label: '공간 안내',   href: '/spaces' },
      { label: '자료실',      href: '/community/archive' },
      { label: '자유게시판',  href: '/community/board' },
      { label: 'Q&A',         href: '/community/qna' },
    ],
  },
  {
    label: '연습실 예약',
    href: '/reservation',
    highlight: true,
  },
];

function DropdownItem({ item, onClose }) {
  const [hovered, setHovered] = useState(false);
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current);
    setHovered(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setHovered(false), 120);
  };

  if (item.dropdown) {
    return (
      <li
        className={`nav-item has-dropdown ${hovered ? 'dropdown-open' : ''}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <span className="nav-link nav-dropdown-trigger">
          {item.label}
          <svg className="dropdown-arrow" width="10" height="6" viewBox="0 0 10 6">
            <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
        <ul className="dropdown-menu">
          {item.dropdown.map((sub) => (
            <li key={sub.label}>
              <Link to={sub.href} className="dropdown-link" onClick={onClose}>
                {sub.label}
              </Link>
            </li>
          ))}
        </ul>
      </li>
    );
  }

  return (
    <li className="nav-item">
      <Link
        to={item.href}
        className={`nav-link ${item.highlight ? 'nav-highlight' : ''}`}
        onClick={onClose}
      >
        {item.highlight && '🎸 '}{item.label}
      </Link>
    </li>
  );
}

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState(null);

  const close = () => {
    setMobileOpen(false);
    setMobileExpanded(null);
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo" onClick={close}>
          🎵 Harmonia
        </Link>

        {/* 데스크톱 중앙 메뉴 (소개, 공간) */}
        <ul className="desktop-menu desktop-menu-center">
          {NAV_ITEMS.filter((item) => !item.highlight).map((item) => (
            <DropdownItem key={item.label} item={item} onClose={close} />
          ))}
        </ul>

        {/* 데스크톱 우측 메뉴 (연습실 예약, 멤버 신청) */}
        <ul className="desktop-menu desktop-menu-right">
          {NAV_ITEMS.filter((item) => item.highlight).map((item) => (
            <DropdownItem key={item.label} item={item} onClose={close} />
          ))}
          <li>
            <Link to="/#join" className="navbar-cta" onClick={close}>
              멤버 신청
            </Link>
          </li>
        </ul>

        {/* 모바일 햄버거 */}
        <button className="navbar-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* 모바일 메뉴 */}
      {mobileOpen && (
        <div className="mobile-menu">
          {NAV_ITEMS.map((item) => (
            <div key={item.label} className="mobile-item">
              {item.dropdown ? (
                <>
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
                          <Link to={sub.href} className="mobile-sub-link" onClick={close}>
                            {sub.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <Link
                  to={item.href}
                  className={`mobile-link ${item.highlight ? 'mobile-highlight' : ''}`}
                  onClick={close}
                >
                  {item.highlight && '🎸 '}{item.label}
                </Link>
              )}
            </div>
          ))}
          <div className="mobile-item">
            <Link to="/#join" className="mobile-cta" onClick={close}>
              멤버 신청
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
