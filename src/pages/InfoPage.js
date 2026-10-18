import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MapIcon } from '../components/Icons';

/* ── Q&A 데이터 ── */
const FAQ = [
  { q: '예약은 누구나 할 수 있나요?', a: '현재 파일럿 기간에는 신청서를 제출한 멤버를 대상으로 예약을 운영합니다. 멤버 신청은 홈 화면 하단에서 가능합니다.' },
  { q: '예약 취소·변경은 어떻게 하나요?', a: '담당자가 확인 연락을 드릴 때 연락처를 함께 안내드립니다. 이용 24시간 전까지 그 연락처로 취소 또는 변경을 요청하실 수 있으며, 이후에는 취소가 어려울 수 있습니다.' },
  { q: '연습실 이용 가능 시간이 어떻게 되나요?', a: '00:00 ~ 29:00(익일 05:00) 슬롯으로 운영합니다. 자정을 넘기는 경우 +1 표시로 익일 새벽 시간을 선택할 수 있습니다.' },
  { q: '장비를 직접 가져와서 쓸 수 있나요?', a: '개인 장비 반입은 기본적으로 허용됩니다. 단, 공간 내 기존 장비와 충돌이 없도록 담당자 확인 연락 때 미리 말씀해 주세요.' },
  { q: '멤버 신청 후 승인까지 얼마나 걸리나요?', a: '신청 접수 후 담당자가 검토하여 연락드립니다. 보통 2~3일 이내에 안내가 전달됩니다.' },
  { q: 'Art Hall K는 개인도 대관할 수 있나요?', a: '현재 파일럿 단계로, 공식 대관 신청은 추후 안내 예정입니다.' },
];

const pages = {
  '/about/greeting': {
    eyebrow: 'About',
    title: '인사말',
    desc: '음악에 진심인 사람들이 모이는 공간, 음진인입니다.',
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
    title: '연혁',
    desc: '음진인이 걸어온 시간과 앞으로 나아갈 방향입니다.',
    timeline: [
      ['2026. 09', '청춘가요제'],
      ['2026. 10. 08', '음진인 협동조합 설립 신고 (고양시)'],
      ['2026. 10. 17', '공식 홈페이지 kband.co.kr 개통'],
      ['2026. 10. 24', '남이섬 공연 (예정)'],
      ['매월', 'Art Hall K 정기 공연'],
    ],
  },
  '/about/location': {
    eyebrow: 'About',
    title: '오시는 길',
    desc: '정기 공연은 Art Hall K에서 열립니다. 연습실은 공간 확정 후 안내드립니다.',
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
    title: '자료실',
    desc: '공연 자료, 합주 음원, 운영 공지, 멤버 가이드를 모아둘 공간입니다.',
    lead: '파일럿 기간에는 방향을 먼저 제시하고, 백엔드 연결 후 게시물·첨부파일 관리 기능으로 확장할 예정입니다.',
    points: [
      '공연 포스터 및 현장 사진 아카이브',
      '합주곡 악보 및 참고 음원 링크',
      '공간 이용 규칙과 장비 사용 가이드',
    ],
  },
  '/community/board': {
    eyebrow: 'Community',
    title: '자유게시판',
    desc: '멤버들이 합주 제안, 공연 모집, 장비 정보를 나눌 수 있는 게시판입니다.',
    lead: '게시판은 로그인·신고·관리자 삭제 등의 운영 정책과 함께 설계되어야 합니다. 백엔드 확정 후 구현 예정입니다.',
    points: [
      '합주·공연 멤버 모집',
      '장비 대여 및 추천 정보 공유',
      '지역 음악 행사 소식 공유',
    ],
  },
  '/community/qna': {
    eyebrow: 'Community',
    title: 'Q&A',
    desc: '공간 이용, 예약, 멤버 신청에 대한 자주 묻는 질문을 정리했습니다.',
    faq: true,
  },
  '/projects/overview': {
    eyebrow: 'Projects',
    title: '프로젝트 연혁',
    desc: '음진인에서 진행한 공연, 합주, 창작 프로젝트를 기록하는 공간입니다.',
    timeline: [
      ['매월', 'Art Hall K 정기 공연'],
      ['2026. 09', '청춘가요제'],
    ],
  },
  '/projects/ongoing': {
    eyebrow: 'Projects',
    title: '진행 중 프로젝트',
    desc: '현재 진행 중이거나 확정된 공연입니다.',
    points: [
      '매월 Art Hall K 정기 공연',
      '2026. 10. 24 남이섬 공연',
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

function LocationBlock() {
  return (
    <div className="location-block">
      <div className="location-map-placeholder">
        <span><MapIcon /></span>
        <p>지도는 연습실 확정 후 함께 표시됩니다</p>
      </div>
      <div className="location-info">
        <div className="location-row">
          <strong>공연장</strong>
          <span>Art Hall K — 경기도 고양시 덕양구 행주산성로 38, 해찬송학김 B1</span>
        </div>
        <div className="location-row">
          <strong>연습실</strong>
          <span>운영지 확정 후 공개 예정</span>
        </div>
        <div className="location-row">
          <strong>대중교통·주차</strong>
          <span>확정 후 안내</span>
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
  const page = pages[location.pathname] || pages['/about/greeting'];

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

        {page.points && (
          <div className="info-grid">
            {page.points.map((point) => (
              <article className="info-card" key={point}>
                <span className="info-card-mark" />
                <p>{point}</p>
              </article>
            ))}
          </div>
        )}

        {page.timeline && (
          <div className="timeline-list">
            {page.timeline.map(([time, text]) => (
              <article className="timeline-item" key={time}>
                <strong>{time}</strong>
                <p>{text}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default InfoPage;
