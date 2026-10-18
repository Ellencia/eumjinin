import Reveal from '../components/Reveal';
import coopCert from '../assets/coop-cert.jpg';
import { MusicIcon, DoorOpenIcon, SproutIcon } from '../components/Icons';

const values = [
  {
    Icon: MusicIcon,
    title: '음악으로 연결',
    desc: '장르와 경력에 상관없이 음악을 사랑하는 사람이라면 누구나 환영합니다.',
  },
  {
    Icon: DoorOpenIcon,
    title: '공간을 나누다',
    desc: '개인이 갖기 어려운 무대와 연습실을 커뮤니티가 함께 공유합니다.',
  },
  {
    Icon: SproutIcon,
    title: '함께 성장',
    desc: '멤버 간 협업과 공연 기회를 통해 아티스트로 함께 성장합니다.',
  },
];

function About() {
  return (
    <section className="about" id="about">
      <div className="section-container">
        <Reveal>
          <h2 className="section-title">음진인 소개</h2>
          <p className="section-sub">
            저희는 뮤지션들이 더 쉽게 음악을 즐길 수 있도록,<br />
            공간과 커뮤니티를 제공하는 음악 법인입니다.
          </p>
        </Reveal>
        <div className="values-grid">
          {values.map((v, i) => (
            <Reveal key={v.title} delay={i * 120}>
              <div className="value-card">
                <span className="value-icon"><v.Icon /></span>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal>
          <figure className="about-cert">
            <img src={coopCert} alt="음진인 협동조합 설립 신고확인증 (고양시, 2026년 10월 8일)" loading="lazy" />
            <figcaption>
              <strong>음진인 협동조합</strong>
              <span>2026. 10. 08 고양시 설립 신고 · 「협동조합 기본법」</span>
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}

export default About;
