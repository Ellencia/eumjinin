// 선 아이콘. 출처: Lucide(ISC) music·door-open·sprout, Heroicons(MIT) wrench-screwdriver, Tabler(MIT) map-2.
// 라이선스 전문: public/third-party-licenses.txt. 색은 currentColor, 크기는 부모 font-size(1em).
const base = { width: '1em', height: '1em', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };

// 아래 두 도형은 이 프로젝트에서 직접 작성.
export const CalendarIcon = () => (
  <svg {...base} strokeWidth="2">
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M7 3v4m10-4v4M3 10h18m-14 5h3m4 0h3" />
  </svg>
);

export const CommunityIcon = () => (
  <svg {...base} strokeWidth="2">
    <circle cx="9" cy="8" r="3" /><circle cx="18" cy="9" r="2" />
    <path d="M3 21v-2a6 6 0 0 1 12 0v2m2-6a4 4 0 0 1 4 4v2" />
  </svg>
);

export const MusicIcon = () => (
  <svg {...base} strokeWidth="2">
    <path d="M21 16V3a1 1 0 0 0-1.28-.96l-10 2.917a1 1 0 0 0-.72.96V19" />
    <circle cx="18" cy="16" r="3" />
    <circle cx="6" cy="19" r="3" />
  </svg>
);

export const DoorOpenIcon = () => (
  <svg {...base} strokeWidth="2">
    <path d="M10 21H2" />
    <path d="M10 3H7a2 2 0 00-2 2v16" />
    <path d="M14 12h.01" />
    <path d="M19 21V5a2 2 0 00-1.675-1.974l-6.163-1.013A1 1 0 0010 3v18a1 1 0 001.124.992z" />
    <path d="M22 21h-3" />
  </svg>
);

export const SproutIcon = () => (
  <svg {...base} strokeWidth="2">
    <path d="M14 9.536V7a4 4 0 0 1 4-4h1.5a.5.5 0 0 1 .5.5V5a4 4 0 0 1-4 4 4 4 0 0 0-4 4c0 2 1 3 1 5a5 5 0 0 1-1 3" />
    <path d="M4 9a5 5 0 0 1 8 4 5 5 0 0 1-8-4" />
    <path d="M5 21h14" />
  </svg>
);

export const WrenchIcon = () => (
  <svg {...base} strokeWidth="1.5">
    <path d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
  </svg>
);

export const MapIcon = () => (
  <svg {...base} strokeWidth="2">
    <path d="M12 18.5l-3 -1.5l-6 3v-13l6 -3l6 3l6 -3v7.5" />
    <path d="M9 4v13" />
    <path d="M15 7v5.5" />
    <path d="M21.121 20.121a3 3 0 1 0 -4.242 0c.418 .419 1.125 1.045 2.121 1.879c1.051 -.89 1.759 -1.516 2.121 -1.879" />
    <path d="M19 18v.01" />
  </svg>
);

// 완료 체크: 원이 튀어 들어오고 체크가 그려지는 애니메이션 (App.css .check-anim*)
export const AnimatedCheck = () => (
  <svg className="check-anim" viewBox="0 0 96 96" aria-hidden="true">
    <circle className="check-anim-ring" cx="48" cy="48" r="44" />
    <circle className="check-anim-bg" cx="48" cy="48" r="44" />
    <path className="check-anim-mark" d="M30 49l13 13 24-26" />
  </svg>
);
