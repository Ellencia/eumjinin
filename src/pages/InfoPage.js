import { Link, useLocation } from 'react-router-dom';

const pages = {
  '/about/greeting': {
    eyebrow: 'About',
    title: '인사말',
    desc: '음진인은 음악을 좋아하는 사람들이 서로 만나고, 연습하고, 무대에 설 수 있는 지역 기반 음악 커뮤니티입니다.',
    lead: '각자의 방에서 혼자 연습하던 시간이 함께 합주하고 공연하는 시간으로 이어지도록, 접근 가능한 공간과 느슨하지만 지속적인 관계를 만들어가고 있습니다.',
    points: [
      '초보자와 경험자가 자연스럽게 섞이는 열린 커뮤니티',
      '연습실, 공연장, 녹음 공간을 함께 활용하는 공유 모델',
      '정기 공연과 프로젝트를 통한 실제 무대 경험',
    ],
  },
  '/about/history': {
    eyebrow: 'About',
    title: '연혁',
    desc: '음진인이 준비해 온 공간, 커뮤니티, 공연 활동의 흐름입니다.',
    timeline: [
      ['2024', '지역 뮤지션 네트워크 기획 및 공간 운영 모델 검토'],
      ['2025', '연습실 예약, 멤버 신청, 공간 안내 파일럿 웹사이트 구축'],
      ['2026', '정식 도메인, 백엔드, 커뮤니티 기능 확장을 목표로 서비스 고도화'],
    ],
  },
  '/about/location': {
    eyebrow: 'About',
    title: '오시는 길',
    desc: '정식 운영 공간 확정 전까지는 파일럿 안내 페이지로 운영됩니다.',
    lead: '공간 주소, 주차, 대중교통, 입장 안내는 운영지가 확정되는 시점에 업데이트할 예정입니다. 현재는 예약 테스트와 공간 소개 중심으로 확인해 주세요.',
    points: [
      '대중교통 접근성을 우선 고려한 공간 선정',
      '악기 반입과 장비 이동이 쉬운 동선 검토',
      '공연 및 연습 시간대별 출입 안내 제공 예정',
    ],
  },
  '/community/archive': {
    eyebrow: 'Community',
    title: '자료실',
    desc: '공연 자료, 합주 음원, 운영 공지, 멤버 가이드를 모아둘 예정입니다.',
    lead: '파일럿 기간에는 정적 페이지로 방향만 제시하고, 백엔드 확정 후 게시물/첨부파일 관리 기능으로 확장하는 것이 적합합니다.',
    points: [
      '공연 포스터와 사진 아카이브',
      '합주곡 악보 및 참고 음원 링크',
      '공간 이용 규칙과 장비 사용 가이드',
    ],
  },
  '/community/board': {
    eyebrow: 'Community',
    title: '자유게시판',
    desc: '멤버들이 합주 제안, 공연 모집, 장비 정보를 나눌 수 있는 게시판입니다.',
    lead: '게시판은 로그인, 신고, 관리자 삭제 같은 운영 정책과 함께 설계되어야 하므로 백엔드 확정 후 구현하는 편이 안전합니다.',
    points: [
      '합주/공연 멤버 모집',
      '장비 대여 및 추천 정보 공유',
      '지역 음악 행사 소식 공유',
    ],
  },
  '/community/qna': {
    eyebrow: 'Community',
    title: 'Q&A',
    desc: '공간 이용, 예약, 멤버 신청과 관련된 질문을 정리합니다.',
    lead: '자주 묻는 질문은 정적 콘텐츠로 먼저 운영하고, 문의 접수는 추후 메일 또는 관리자 페이지와 연결하는 구조가 좋습니다.',
    points: [
      '예약 변경 및 취소 기준',
      '연습실 이용 가능 시간',
      '멤버 신청 후 승인 절차',
    ],
  },
  '/projects/overview': {
    eyebrow: 'Projects',
    title: '프로젝트 연혁',
    desc: '음진인에서 진행한 공연, 합주, 창작 프로젝트를 기록하는 공간입니다.',
    timeline: [
      ['파일럿', '멤버 모집과 공간 예약 흐름 검증'],
      ['운영 준비', '공연장/연습실 소개 콘텐츠 정리'],
      ['정식 운영', '정기 공연과 협업 프로젝트 아카이브 구축 예정'],
    ],
  },
  '/projects/ongoing': {
    eyebrow: 'Projects',
    title: '진행 중 프로젝트',
    desc: '현재 준비 중인 음악 활동과 커뮤니티 프로그램입니다.',
    lead: '파일럿 단계에서는 실제 프로젝트가 확정될 때마다 이 페이지를 카드형 목록으로 확장하면 됩니다.',
    points: [
      '정기 합주 모임 기획',
      '초보 밴드 멤버 매칭',
      '소규모 쇼케이스 공연 준비',
    ],
  },
};

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
