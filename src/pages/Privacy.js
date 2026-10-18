import { Link } from 'react-router-dom';

// 개인정보처리방침. 수집 항목·목적은 Join.js / ReservationDetail.js의 ConsentCheck 문구, 보관 방식은 server.js·deploy/backup.sh와 맞춰야 함.
const SECTIONS = [
  ['1. 수집하는 개인정보와 목적', [
    '멤버 신청: 이름, 이메일, 연락처(필수) / 소속 밴드, 역할, 거주지, 생년월일, 장르, 자기소개(선택) — 멤버 신청 접수 및 연락',
    '연습실 예약: 이름, 연락처, 예약 일시 — 예약 접수 및 연락',
    '서비스 이용 과정에서 접속 기록(IP 주소, 접속 일시)이 보안 목적으로 서버에 남을 수 있습니다.',
    '방문자에게 쿠키를 사용하지 않습니다. 관리자 로그인에만 세션 쿠키를 사용합니다.',
  ]],
  ['2. 보유 및 이용 기간', [
    '동의 철회 또는 탈퇴 시까지 보유하며, 요청을 받으면 지체 없이 삭제합니다.',
    '서버 백업본은 생성 후 30일이 지나면 자동 삭제됩니다.',
  ]],
  ['3. 제3자 제공 및 처리 위탁', [
    '개인정보를 제3자에게 제공하거나 외부에 위탁하지 않습니다.',
    '모든 개인정보는 음진인 협동조합이 직접 운영하는 서버에만 저장됩니다. 신청 접수 알림에는 개인정보를 포함하지 않습니다.',
  ]],
  ['4. 정보주체의 권리', [
    '언제든지 본인 개인정보의 열람, 정정, 삭제, 처리정지를 요청할 수 있습니다.',
    '요청은 아래 개인정보 보호책임자에게 하시면 되며, 본인 확인 후 처리합니다.',
  ]],
  ['5. 안전성 확보 조치', [
    '전 구간 HTTPS 암호화 전송, 관리자 외 접근 차단, 서버 접근 권한 최소화.',
  ]],
  ['6. 개인정보 보호책임자', [
    '성명: 김성진',
    '연락처: 010-9947-6929',
  ]],
  ['7. 시행일', [
    '이 방침은 2026년 10월 18일부터 시행합니다.',
  ]],
];

function Privacy() {
  return (
    <section className="info-page">
      <div className="section-container">
        <Link to="/" className="back-link">← 홈으로</Link>
        <p className="page-eyebrow">Policy</p>
        <h1 className="section-title">개인정보처리방침</h1>
        <p className="section-sub">음진인 협동조합은 개인정보 보호법에 따라 이용자의 개인정보를 보호하고, 관련 고충을 처리하기 위해 다음과 같이 방침을 둡니다.</p>
        {SECTIONS.map(([title, lines]) => (
          <div key={title} className="info-lead" style={{ textAlign: 'left' }}>
            <strong>{title}</strong>
            {lines.map((l) => <p key={l} style={{ margin: '6px 0 0' }}>{l}</p>)}
          </div>
        ))}
      </div>
    </section>
  );
}

export default Privacy;
