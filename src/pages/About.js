import { useState } from 'react';
import Reveal from '../components/Reveal';
import { Lightbox } from './SpaceDetail';
import coopCert from '../assets/coop-cert.jpg';

const values = [
  {
    title: '음악으로 연결',
    desc: '장르와 경력에 상관없이 음악을 사랑하는 사람이라면 누구나 환영합니다.',
  },
  {
    title: '공간을 나누다',
    desc: '개인이 갖기 어려운 무대와 연습실을 커뮤니티가 함께 공유합니다.',
  },
  {
    title: '함께 성장',
    desc: '멤버 간 협업과 공연 기회를 통해 아티스트로 함께 성장합니다.',
  },
];

// 시안 A: 소개 문장 하나를 크게, 세 가치와 확인증은 아래 한 줄
function About() {
  const [certOpen, setCertOpen] = useState(false);
  return (
    <section className="about" id="about">
      <div className="ab-inner">
        <Reveal>
          <p className="ab-kicker">ABOUT · 음진인 소개</p>
          <h2 className="ab-title">
            뮤지션이 음악을 더 쉽게 즐기도록, <em>공간과 커뮤니티</em>를 만드는 음악 법인입니다.
          </h2>
        </Reveal>
        <div className="ab-row">
          {values.map((v, i) => (
            <Reveal key={v.title} delay={i * 120}>
              <h3>{v.title}</h3>
              <p>{v.desc}</p>
            </Reveal>
          ))}
          <Reveal delay={360}>
            <figure className="ab-cert">
              <button type="button" onClick={() => setCertOpen(true)} aria-label="설립 신고확인증 크게 보기">
                <img src={coopCert} alt="음진인 협동조합 설립 신고확인증 (고양시, 2026년 10월 8일)" loading="lazy" />
              </button>
              <figcaption>음진인 협동조합<br />2026. 10. 08 고양시 설립 신고</figcaption>
            </figure>
          </Reveal>
        </div>
      </div>
      {certOpen && <Lightbox images={[coopCert]} index={0} onClose={() => setCertOpen(false)} />}
    </section>
  );
}

export default About;
