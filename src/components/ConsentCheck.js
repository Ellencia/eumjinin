// 개인정보 수집·이용 동의. 서버도 consent === true 를 요구함 (server.js)
function ConsentCheck({ checked, onChange, items, purpose }) {
  return (
    <label className="consent-row">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>
        <strong>[필수] 개인정보 수집·이용 동의</strong><br />
        수집 항목: {items} · 이용 목적: {purpose} · 보유 기간: 탈퇴 또는 동의 철회 시까지(철회는 담당자에게 요청).
        동의하지 않을 수 있으나, 그 경우 신청을 접수할 수 없습니다.
      </span>
    </label>
  );
}

export default ConsentCheck;
