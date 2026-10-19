// 개인정보 수집·이용 동의. 서버도 consent === true 를 요구함 (server.js)
// retention은 개인정보처리방침 3절·server.js purgeExpired와 같은 기간이어야 함
function ConsentCheck({ checked, onChange, items, purpose, retention }) {
  return (
    <label className="consent-row">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>
        <strong>[필수] 개인정보 수집·이용 동의</strong><br />
        수집 항목: {items} · 이용 목적: {purpose} · 보유 기간: {retention}(철회는 담당자에게 요청).
        동의하지 않을 수 있으나, 그 경우 신청을 접수할 수 없습니다.{' '}
        <a href="/privacy" target="_blank" rel="noopener noreferrer">개인정보처리방침 보기</a>
      </span>
    </label>
  );
}

// 만 14세 미만은 법정대리인 동의가 필요해 받지 않음. 서버도 age14 === true 를 요구함
export function AgeCheck({ checked, onChange }) {
  return (
    <label className="consent-row">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span><strong>[필수] 만 14세 이상입니다</strong></span>
    </label>
  );
}

export default ConsentCheck;
