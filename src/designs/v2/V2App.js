import { useEffect } from 'react';
import { useDesign } from '../../contexts/DesignContext';
import spaces from '../../data/spaces';
import stage1 from '../../assets/stage1.webp';
import stage2 from '../../assets/stage2.webp';
import stage3 from '../../assets/stage3.webp';
import hallk1 from '../../assets/hallk1.webp';
import './v2.css';

function V2App() {
  const { setDesign } = useDesign();

  useEffect(() => {
    document.body.classList.add('v2-active');
    return () => document.body.classList.remove('v2-active');
  }, []);

  const practiceSpaces = spaces.filter(s => s.type === 'rehearsal' && s.name !== '준비중');

  return (
    <div className="v2-root">
      {/* 디자인 전환 버튼 */}
      <button
        onClick={() => setDesign('default')}
        style={{position:'fixed',top:12,right:12,zIndex:9999,background:'rgba(0,0,0,0.7)',color:'#ffd000',border:'2px solid #ffd000',padding:'6px 12px',fontFamily:'monospace',fontSize:12,cursor:'pointer',letterSpacing:'0.1em'}}
      >
        ← PILOT
      </button>

      {/* TOP BAR */}
      <div className="topbar">
        <div className="logo">音眞人</div>
        <nav>
          <a href="#hero">홈</a>
          <a href="#manifesto">매니페스토</a>
          <a href="#bands">밴드</a>
          <a href="#shows">공연</a>
          <a href="#practice">연습실</a>
          <a href="#join">가입</a>
        </nav>
      </div>

      {/* MARQUEE */}
      <div className="marquee-strip">
        <div className="track">
          <span>NEW MEMBERS WANTED</span>
          <span>2026 SPRING SHOWCASE 05.17</span>
          <span>ART HALL K B1 OPEN</span>
          <span>NO POSERS</span>
          <span>음악에 진심인 사람들</span>
          <span>NEW MEMBERS WANTED</span>
          <span>2026 SPRING SHOWCASE 05.17</span>
          <span>ART HALL K B1 OPEN</span>
          <span>NO POSERS</span>
          <span>음악에 진심인 사람들</span>
        </div>
      </div>

      {/* HERO */}
      <section className="hero" id="hero">
        <div className="hero-grid">
          <div className="poster">
            <span className="tape tape-1"></span>
            <span className="tape tape-2"></span>
            <div className="stamp">EST. 2024 · GOYANG</div>
            <h1>
              음악에<br/>
              <span className="strike">대충</span> <span className="accent">진심</span>인<br/>
              사람들
            </h1>
            <div className="subtitle">音 眞 人 · MUSIC FREAKS</div>
            <p className="lede">
              연습이 끝나도 합주실에서 못 나가는 사람들. 새벽 3시에 가사 한 줄 때문에<br/>
              채팅창을 도배하는 사람들. 우리는 그런 사람들을 찾고 있습니다.
            </p>
            <div className="cta-row">
              <a className="btn alt" href="#join">→ 가입 신청</a>
              <a className="btn" href="#shows">공연 보러가기</a>
              <a className="btn ink" href="#practice">연습실 예약</a>
            </div>
          </div>

          <div className="collage">
            <div className="photo photo-1">
              <img src={stage1} alt="stage" style={{objectFit:'cover', width:'100%', height:'100%', filter:'contrast(1.4) grayscale(1)'}} />
            </div>
            <div className="photo photo-2">
              <img src={stage2} alt="amp" style={{objectFit:'cover', width:'100%', height:'100%', filter:'contrast(1.4) grayscale(1)'}} />
            </div>
            <div className="photo photo-3">
              <img src={stage3} alt="crowd" style={{objectFit:'cover', width:'100%', height:'100%', filter:'contrast(1.4) grayscale(1)'}} />
            </div>
            <div className="photo photo-4">
              <img src={hallk1} alt="hallk" style={{objectFit:'cover', width:'100%', height:'100%', filter:'contrast(1.4) grayscale(1)'}} />
            </div>
            <div className="ransom ransom-1">LOUD!!</div>
            <div className="ransom ransom-2">진짜만<br/>모여라</div>
            <div className="ransom ransom-3">SINCE '24</div>
          </div>
        </div>
      </section>

      {/* MANIFESTO */}
      <section className="block" id="manifesto" style={{padding:'40px 0'}}>
        <div className="manifesto">
          <h3>OUR<br/>MANIFESTO</h3>
          <ul>
            <li>잘하지 않아도 좋다. 진심이면 된다.</li>
            <li>장르를 가리지 않는다. 좋으면 한다.</li>
            <li>합주는 회식보다 자주, 회식은 안 해도 된다.</li>
            <li>새 멤버에게 텃세 없음. 시작은 모두 처음.</li>
            <li>음악 외 정치 토론 금지. 음악 정치는 허용.</li>
          </ul>
          <div className="sig">— 음진인 운영진 일동</div>
        </div>
      </section>

      {/* BANDS */}
      <section className="block" id="bands">
        <div className="section-head">
          <div className="section-no">01</div>
          <div className="section-title">소속<br/>밴드</div>
          <p className="section-sub">현재 6개 밴드가 활동 중. 매월 합동 합주, 분기별 자체 쇼케이스 진행.</p>
        </div>
        <div className="bands-grid">
          <div className="flyer">
            <div className="band-no">#01</div>
            <h4>녹음실 도둑</h4>
            <div className="meta">결성 2019 · 5인조</div>
            <div className="tags"><span className="tag">INDIE</span><span className="tag">ROCK</span></div>
          </div>
          <div className="flyer">
            <div className="band-no">#02</div>
            <h4>새벽 3시</h4>
            <div className="meta">결성 2020 · 4인조</div>
            <div className="tags"><span className="tag">DREAM POP</span></div>
          </div>
          <div className="flyer">
            <div className="band-no">#03</div>
            <h4>BANG!BANG!</h4>
            <div className="meta">결성 2021 · 3인조</div>
            <div className="tags"><span className="tag">PUNK</span><span className="tag">HARDCORE</span></div>
          </div>
          <div className="flyer">
            <div className="band-no">#04</div>
            <h4>월요일 우울증</h4>
            <div className="meta">결성 2022 · 4인조</div>
            <div className="tags"><span className="tag">EMO</span><span className="tag">ALT</span></div>
          </div>
          <div className="flyer">
            <div className="band-no">#05</div>
            <h4>고양이 발자국</h4>
            <div className="meta">결성 2023 · 3인조</div>
            <div className="tags"><span className="tag">FOLK</span></div>
          </div>
          <div className="flyer">
            <div className="band-no">#06</div>
            <h4>HEAVY 김치</h4>
            <div className="meta">결성 2024 · 5인조</div>
            <div className="tags"><span className="tag">METAL</span><span className="tag">FUSION</span></div>
          </div>
        </div>
      </section>

      {/* SHOWS */}
      <section className="block" id="shows">
        <div className="section-head">
          <div className="section-no">02</div>
          <div className="section-title">다가오는<br/>공연</div>
          <p className="section-sub">티켓 예매는 각 밴드 SNS 또는 운영진 DM. 회원은 30% 할인.</p>
        </div>
        <div className="shows">
          <div className="show">
            <div className="date">05.17<small>SAT 19:00</small></div>
            <div className="info">
              <h5>음진인 봄 정기 라이브</h5>
              <p>Art Hall K · B1 · 5팀 합동</p>
            </div>
            <div className="price">자유 관람<small>OPEN</small></div>
          </div>
          <div className="show">
            <div className="date">06.07<small>SAT 20:00</small></div>
            <div className="info">
              <h5>진심포크 단독 공연</h5>
              <p>Art Hall K · 무대 · 어쿠스틱</p>
            </div>
            <div className="price">₩15,000<small>회원 ₩10,500</small></div>
          </div>
          <div className="show">
            <div className="date">07.12<small>SUN 15:00</small></div>
            <div className="info">
              <h5>여름 잼 세션</h5>
              <p>Art Hall K · B1 · 자유 참여</p>
            </div>
            <div className="price">무료<small>FREE</small></div>
          </div>
        </div>
      </section>

      {/* PRACTICE */}
      <section className="block" id="practice" style={{padding:'40px 0'}}>
        <div className="practice">
          <div className="stencil">ART<br/>HALL<br/><span>K</span></div>
          <div className="info">
            <p>지하 1층, 60평. 풀세트 합주실 + 보컬 부스 + 작은 공연장 겸용.<br/>
            회원은 시간당 ₩8,000, 비회원은 ₩15,000.</p>
            <ul>
              <li>드럼 / 베이스앰프 / 기타앰프 풀세팅</li>
              <li>마이크 6채널 / 모니터 4기</li>
              <li>합주 녹음 무료 (USB 지참)</li>
              <li>심야 운영 (23:00까지)</li>
            </ul>

            <div className="practice-spaces-grid" style={{marginTop: 24}}>
              {practiceSpaces.map(space => (
                <div key={space.id} className="practice-space-card">
                  <h4>{space.name}</h4>
                  <p>최대 {space.capacity}인 · {space.desc}</p>
                  <ul>
                    {space.equipment.map(eq => <li key={eq}>{eq}</li>)}
                  </ul>
                </div>
              ))}
            </div>

            <a className="btn ink" href="#join" style={{marginTop:24,display:'inline-block'}}>예약 문의하기 →</a>
          </div>
        </div>
      </section>

      {/* JOIN CTA */}
      <section className="block" id="join" style={{textAlign:'center'}}>
        <div style={{fontFamily:'"Bungee Shade",sans-serif',fontSize:'clamp(48px,8vw,120px)',lineHeight:.9,color:'var(--red)',marginBottom:24}}>
          JOIN<br/>THE NOISE
        </div>
        <p style={{fontFamily:'"Special Elite",monospace',fontSize:18,maxWidth:600,margin:'0 auto 32px',lineHeight:1.7}}>
          악기 한번이라도 잡아본 사람, 노래방에서 안 자고 끝까지 부르는 사람,<br/>
          합주실 빌리려고 적금 깨본 사람 — 다 환영합니다.
        </p>
        <a className="btn alt" href="mailto:contact@eumjinin.kr" style={{fontSize:24,padding:'20px 32px',display:'inline-block'}}>→ 신청서 작성하기</a>
      </section>

      {/* FOOTER */}
      <footer className="zine">
        <div className="row">
          <div>
            <div className="big">音眞人</div>
            <p>음악에 진심인 사람들의 모임<br/>since 2024, Goyang</p>
          </div>
          <div>
            <h6>CONTACT</h6>
            <ul>
              <li>contact@eumjinin.kr</li>
              <li>@eumjinin_official</li>
              <li>오픈채팅 〈음진인 라운지〉</li>
            </ul>
          </div>
          <div>
            <h6>HOURS</h6>
            <ul>
              <li>MON–FRI 14:00–22:00</li>
              <li>SAT–SUN 11:00–23:00</li>
              <li>예약 우선</li>
            </ul>
          </div>
        </div>
        <div className="end">© 2026 EUMJININ · NO MASTERS, NO SLAVES, JUST MUSIC ★</div>
      </footer>
    </div>
  );
}

export default V2App;
