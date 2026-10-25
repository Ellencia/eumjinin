import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MapIcon } from '../components/Icons';
import { Lightbox } from './SpaceDetail';
import PAGES from '../data/pages.json';
import spaces from '../data/spaces';

// 'YYYY-MM-DD'(방문자 현지 날짜). 날짜 붙은 일정은 이걸로 "(예정)"·진행 중 여부가 저절로 바뀜
const today = () => new Date().toLocaleDateString('sv-SE');

// 연혁 사진: src/assets/namiNN.webp(원본) + thumbs/(make_thumbs.py). 파일만 추가하면 번호순으로 들어감
const photoSet = (ctx) => {
  const set = { full: [], thumb: [] };
  ctx.keys().sort().forEach((k) => (k.includes('/thumbs/') ? set.thumb : set.full).push(ctx(k)));
  return set;
};
const NAMI = {
  // 기사 카드. image는 기사 og:image를 320px로 줄인 것(외부 요청 0 유지)
  link: {
    href: 'https://n.news.naver.com/article/008/0005431254',
    title: "'2026 남이섬 가을 음악 페스티벌' 성황...록밴드 '무모한사람들' 대상",
    source: '머니투데이', date: '2026. 10. 25',
    image: require('../assets/nami-news.webp'),
  },
  photos: photoSet(require.context('../assets', true, /nami\d+\.webp$/)),
};

// 프로젝트 연혁(/projects/overview) 항목. 5번째 칸 slug가 앵커(#slug)가 되고, 소개 연혁·공연 일정은 그리로 링크
const NAMI_TEXT = '2026 남이섬 가을 음악 페스티벌 주최 (남이섬 에코스테이지, 10팀 경연 · 대상 무모한사람들)';
const PROJECT_TIMELINE = [
  ['매월', 'Art Hall K 정기 공연'],
  ['2026. 06 ~ 08', '머니투데이 도전! 청춘가요제 예선·본선 Art Hall K 개최 (6.20 / 7.18 / 8.29)', undefined, undefined, 'youth2026'],
  ['2026. 10. 24', NAMI_TEXT, '2026-10-24', NAMI, 'nami2026'],
  ['2026. 10. 30', '마곡나루 공연', '2026-10-30', undefined, 'magok2026'],
];
// 공연 일정(Schedule.js)이 공연 날짜로 찾는 링크표 { 'YYYY-MM-DD': '/projects/overview#slug' }
export const PROJECT_LINKS = Object.fromEntries(
  PROJECT_TIMELINE.filter(([, , date, , slug]) => date && slug).map(([, , date, , slug]) => [date, `/projects/overview#${slug}`]),
);

/* ── Q&A 데이터 ── */
// 예약·연습실·장비 항목은 연습실 확정 때까지 뺌(10-25)
const FAQ = [
  { q: '멤버 신청 후 승인까지 얼마나 걸리나요?', a: '신청 접수 후 담당자가 검토하여 연락드립니다. 보통 2~3일 이내에 안내가 전달됩니다.' },
  { q: 'Art Hall K 대관 문의를 할 수 있나요?', a: '대관 여부는 공간 운영 측에서 결정하며, 음진인은 요청을 전달해 드리는 위치입니다. 희망 일정과 함께 담당자(김인현 010-3099-6929)에게 문의해 주시면 확인 후 연락드립니다.' },
];

// 제목·설명(title·desc)은 src/data/pages.json — 서버가 검색·공유 미리보기용 <title>·meta에도 씀
const pages = {
  '/about/greeting': {
    eyebrow: 'About',
    lead: '각자의 방에서 혼자 연습하던 시간이 함께 합주하고 무대에 서는 시간으로 이어지도록 — 접근 가능한 공간과 느슨하지만 지속적인 관계를 만들어가고 있습니다.',
    extra: '초보자와 경험자가 자연스럽게 섞이는 열린 커뮤니티를 지향합니다. 레벨을 묻지 않고, 장르를 가리지 않으며, 함께 소리를 만드는 과정 자체를 즐기는 모든 사람을 환영합니다.',
    points: [
      '초보자와 경험자가 자연스럽게 섞이는 열린 커뮤니티',
      '연습실, 공연장, 녹음 공간을 함께 활용하는 공유 모델',
      '정기 공연과 프로젝트를 통한 실제 무대 경험',
    ],
  },
  '/about/history': {
    eyebrow: 'About',
    // 셋째 칸 날짜가 있으면 그날까지 "(예정)"이 붙음
    timeline: [
      ['2021. 12', '밴드 모임 끼놀 시작, 안양 평촌에서 매월 정기 공연 개시'],
      ['2022. 12', '첫 송년 모임'],
      ['2023. 11', '끼놀 2주년, 타 음악 모임과 조인트 공연 시작'],
      ['2024. 10 ~', '자선 공연·위문 공연 정례화 (병원, 수녀회, 무료급식소 등)'],
      ['2025. 07', '제1회 횡성 여름 음악 캠프'],
      ['2026. 01. 24', '행주산성 Art Hall K로 거점 이전, 첫 공연 (이후 매월 정기 모임 공연)'],
      ['2026. 06 ~ 08', '머니투데이 도전! 청춘가요제 예선·본선 Art Hall K 개최 (6.20 / 7.18 / 8.29)', undefined, undefined, 'youth2026'],
      ['2026. 08', '제2회 횡성 여름 음악 캠프'],
      ['2026. 10. 08', '음진인 협동조합 설립 신고 (고양시)'],
      ['2026. 10. 17', '공식 홈페이지 kband.co.kr 개통'],
      ['2026. 10. 24', NAMI_TEXT, '2026-10-24', NAMI, 'nami2026'],
      ['2026. 10. 30', '마곡나루 공연', '2026-10-30', undefined, 'magok2026'],
    ],
  },
  '/about/location': {
    eyebrow: 'About',
    lead: '공연장 Art Hall K는 행주산성 해찬송학김 건물 지하 1층에 있습니다. 연습실 주소와 교통 안내는 운영지가 확정되는 즉시 업데이트됩니다.',
    location: true,
    points: [
      '연습실: 대중교통 접근성을 우선 고려해 선정 진행 중',
      '악기 반입과 장비 이동이 쉬운 동선 확보 예정',
      '공연·연습 시간대별 출입 안내 확정 후 공지 예정',
    ],
  },
  '/community/archive': {
    eyebrow: 'Community',
    lead: '준비 중입니다. 정기 공연 영상부터 차례로 올라갑니다.',
    points: [
      '공연 포스터 및 현장 사진 아카이브',
      '합주곡 악보 및 참고 음원 링크',
      '공간 이용 규칙과 장비 사용 가이드',
    ],
  },
  '/community/board': {
    eyebrow: 'Community',
    lead: '준비 중입니다. 열리기 전까지 합주·공연 모집은 정기 공연 현장에서 안내드립니다.',
    points: [
      '합주·공연 멤버 모집',
      '장비 대여 및 추천 정보 공유',
      '지역 음악 행사 소식 공유',
    ],
  },
  '/community/qna': {
    eyebrow: 'Community',
    faq: true,
  },
  '/projects/overview': {
    eyebrow: 'Projects',
    timeline: PROJECT_TIMELINE,
  },
  '/projects/ongoing': {
    eyebrow: 'Projects',
    // [문구, 마지막 날]. 그날이 지나면 목록에서 빠짐(연혁에는 남음)
    points: [
      ['매월 Art Hall K 정기 공연'],
      ['2026. 10. 24 2026 남이섬 가을 음악 페스티벌 (주최·주관, 남이섬 야외공연장 13~16시, 10팀, 무료 관람)', '2026-10-24'],
      ['2026. 10. 30 마곡나루 공연', '2026-10-30'],
    ],
  },
};

function FaqAccordion() {
  const [openIdx, setOpenIdx] = useState(null);
  return (
    <div className="faq-list">
      {FAQ.map((item, i) => (
        <div key={i} className={`faq-item ${openIdx === i ? 'faq-open' : ''}`}>
          <button
            className="faq-question"
            onClick={() => setOpenIdx(openIdx === i ? null : i)}
          >
            <span>{item.q}</span>
            <span className="faq-arrow">{openIdx === i ? '▲' : '▼'}</span>
          </button>
          {openIdx === i && <p className="faq-answer">{item.a}</p>}
        </div>
      ))}
    </div>
  );
}

// 기사 링크 미리보기 카드(썸네일·제목·출처)
function NewsCard({ link }) {
  return (
    <a className="news-card" href={link.href} target="_blank" rel="noopener noreferrer">
      <img src={link.image} alt="" loading="lazy" />
      <span>
        <span className="news-card-title">{link.title}</span>
        <span className="news-card-meta">{link.source} · {link.date} · 기사 보기 ↗</span>
      </span>
    </a>
  );
}

// 앨범: 표지 한 장 크게 + 작은 4장, 마지막 칸에 "+n". 누르면 SpaceDetail의 라이트박스로 전부
const ALBUM_SHOW = 5;
function Album({ images, label }) {
  const [idx, setIdx] = useState(null);
  const hidden = images.thumb.length - ALBUM_SHOW;
  return (
    <>
      <div className="album">
        {images.thumb.slice(0, ALBUM_SHOW).map((src, k) => (
          <button key={k} type="button" className={k === 0 ? 'album-cover' : undefined} aria-label={`${label} 사진 ${k + 1} 크게 보기`} onClick={() => setIdx(k)}>
            <img src={src} alt="" loading="lazy" />
            {k === ALBUM_SHOW - 1 && hidden > 0 && <span className="album-more">+{hidden}</span>}
          </button>
        ))}
      </div>
      {idx !== null && <Lightbox images={images.full} index={idx} onClose={() => setIdx(null)} />}
    </>
  );
}

// 지도 임베드는 네이버 지도 API 키+외부 스크립트가 필요해서(외부 요청 0 원칙) 링크 카드로. 주소·지도 URL은 spaces.js의 Art Hall K가 단일 출처
const hall = spaces.find((s) => s.id === 6);
function LocationBlock() {
  return (
    <div className="location-block">
      <a className="location-map" href={hall.mapUrl} target="_blank" rel="noopener noreferrer">
        <span className="location-map-icon"><MapIcon /></span>
        <strong>Art Hall K</strong>
        <p>{hall.location}</p>
        <span className="location-map-cta">네이버 지도에서 열기 ↗</span>
      </a>
      <div className="location-info">
        <div className="location-row">
          <strong>공연장</strong>
          <span>Art Hall K — {hall.location}</span>
        </div>
        <div className="location-row">
          <strong>주차</strong>
          <span>건물 주차장 이용 가능 (약 60–70대)</span>
        </div>
        <div className="location-row">
          <strong>대중교통</strong>
          <span>확인 후 안내</span>
        </div>
        <div className="location-row">
          <strong>연습실</strong>
          <span>운영지 확정 후 공개 예정</span>
        </div>
        <div className="location-row">
          <strong>입장</strong>
          <span>예약자 사전 안내 문자 발송 예정</span>
        </div>
      </div>
    </div>
  );
}

function InfoPage() {
  const location = useLocation();
  const path = pages[location.pathname] ? location.pathname : '/about/greeting';
  const page = { ...PAGES[path], ...pages[path] };
  const isOverview = path === '/projects/overview'; // 여기선 slug가 앵커, 다른 페이지에선 이리로 오는 링크
  const now = today();
  const points = page.points
    ?.map((p) => (typeof p === 'string' ? [p] : p))
    .filter(([, until]) => !until || until >= now);

  return (
    <section className="info-page">
      <div className="section-container">
        <Link to="/" className="back-link">← 홈으로</Link>
        <p className="page-eyebrow">{page.eyebrow}</p>
        <h1 className="section-title">{page.title}</h1>
        <p className="section-sub">{page.desc}</p>

        {page.lead && <p className="info-lead">{page.lead}</p>}
        {page.extra && <p className="info-lead" style={{ marginTop: 16 }}>{page.extra}</p>}

        {page.faq && <FaqAccordion />}
        {page.location && <LocationBlock />}

        {points && (
          <div className="info-grid">
            {points.map(([point]) => (
              <article className="info-card" key={point}>
                <span className="info-card-mark" />
                <p>{point}</p>
              </article>
            ))}
          </div>
        )}

        {page.timeline && (
          <div className="timeline-list">
            {page.timeline.map(([time, text, date, extra, slug]) => (
              <article className="timeline-item" key={time} id={isOverview ? slug : undefined}>
                <strong>{time}</strong>
                <div>
                  <p>
                    {slug && !isOverview ? <Link to={`/projects/overview#${slug}`} className="timeline-link">{text}</Link> : text}
                    {date >= now && ' (예정)'}
                  </p>
                  {extra?.link && <NewsCard link={extra.link} />}
                  {extra?.photos && <Album images={extra.photos} label={text} />}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default InfoPage;
