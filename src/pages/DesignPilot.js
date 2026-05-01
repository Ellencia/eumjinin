import { useState } from 'react';

const DESIGNS = [
  { id: 'v1', name: 'Vinyl & Zine',    tone: '빈티지 바이닐 · 펑크 진',   folder: 'v1' },
  { id: 'v2', name: 'DIY Punk',        tone: 'DIY 펑크 포스터',            folder: 'v2' },
  { id: 'v3', name: 'Editorial',       tone: '에디토리얼 매거진',          folder: 'v3' },
  { id: 'v4', name: 'Indie Folk',      tone: '인디 · 포크 · 따뜻한 감성', folder: 'v4' },
  { id: 'v5', name: 'Live Club',       tone: '라이브 클럽 · 네온 분위기',  folder: 'v5' },
  { id: 'v6', name: 'Korean Modern',   tone: '한국 모던 · 전통 감성',      folder: 'v6' },
  { id: 'v7', name: 'Organic',         tone: '자연 · 한지 · 나무 질감',    folder: 'v7' },
];

function DesignPilot() {
  const [selectedId, setSelectedId] = useState(DESIGNS[0].id);
  const selected = DESIGNS.find((d) => d.id === selectedId) || DESIGNS[0];
  const src = `${process.env.PUBLIC_URL}/designs/${selected.folder}/index.html`;

  return (
    <section className="design-page">
      <div className="design-shell">

        <div className="design-toolbar">
          <div>
            <p className="page-eyebrow">Pilot</p>
            <h1>홈페이지 디자인 시안</h1>
          </div>
          <p>파일럿 기간 동안 한 주소에서 {DESIGNS.length}개 방향을 전환해 비교합니다.</p>
        </div>

        <div className="design-tabs" aria-label="디자인 시안 선택">
          {DESIGNS.map((d, i) => (
            <button
              key={d.id}
              className={`design-tab ${selected.id === d.id ? 'active' : ''}`}
              onClick={() => setSelectedId(d.id)}
            >
              <span>{String(i + 1).padStart(2, '0')}</span>
              {d.name}
            </button>
          ))}
        </div>

        <div className="design-iframe-wrap">
          <p className="design-iframe-label">{selected.tone}</p>
          {DESIGNS.map((d) => (
            <iframe
              key={d.id}
              src={`${process.env.PUBLIC_URL}/designs/${d.folder}/index.html`}
              title={d.name}
              className="design-iframe"
              sandbox="allow-scripts allow-same-origin"
              style={{ display: d.id === selectedId ? 'block' : 'none' }}
            />
          ))}
        </div>

      </div>
    </section>
  );
}

export default DesignPilot;
