import { useState, useEffect, createContext } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import PAGES from './data/pages.json';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingSplash from './components/LoadingSplash';
import Home from './pages/Home';
import About from './pages/About';
import Spaces from './pages/Spaces';
import Join from './pages/Join';
import Reservation from './pages/Reservation';
import ReservationDetail from './pages/ReservationDetail';
import SpaceList from './pages/SpaceList';
import SpaceDetail from './pages/SpaceDetail';
import InfoPage from './pages/InfoPage';
import Privacy from './pages/Privacy';
import Schedule from './pages/Schedule';
import { TeamPage, TeamEdit } from './pages/Team';
import Admin from './pages/Admin';
import ScrollManager from './components/ScrollManager';
import './App.css';

export const SplashContext = createContext(true);

function MainLayout() {
  return (
    <>
      <Home />
      <About />
      <Spaces />
      <Join />
    </>
  );
}

function NotFound() {
  return (
    <section className="info-page">
      <div className="section-container" style={{ textAlign: 'center', padding: '80px 24px' }}>
        <h1 className="section-title">페이지를 찾을 수 없습니다</h1>
        <p className="section-sub">주소가 잘못되었거나 삭제된 페이지입니다.</p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: 24, display: 'inline-block' }}>홈으로</Link>
      </div>
    </section>
  );
}

// 탭 제목. 서버(server.js pageTitle)도 같은 규칙으로 첫 HTML에 넣음
function pageTitle(path) {
  const k = path.replace(/\/+$/, '') || '/';
  if (k.startsWith('/teams/') || k.startsWith('/team-edit/')) return null; // 팀 이름은 Team.js가 불러온 뒤 넣음
  if (!PAGES[k]) return '페이지를 찾을 수 없습니다 — 음진인 협동조합';
  return k === '/' ? PAGES[k].title : `${PAGES[k].title} — 음진인 협동조합`;
}

function Site() {
  const [loading, setLoading] = useState(true);
  const { pathname } = useLocation();
  useEffect(() => { const t = pageTitle(pathname); if (t) document.title = t; }, [pathname]);

  return (
    <SplashContext.Provider value={loading}>
      {loading && <LoadingSplash onDone={() => setLoading(false)} />}
      <div className="App">
        <ScrollManager />
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<MainLayout />} />
            <Route path="/spaces" element={<SpaceList />} />
            <Route path="/spaces/:id" element={<SpaceDetail />} />
            <Route path="/reservation" element={<Reservation />} />
            <Route path="/reservation/:roomId" element={<ReservationDetail />} />
            <Route path="/about/greeting" element={<InfoPage />} />
            <Route path="/about/history" element={<InfoPage />} />
            <Route path="/about/location" element={<InfoPage />} />
            <Route path="/community/archive" element={<InfoPage />} />
            <Route path="/community/board" element={<InfoPage />} />
            <Route path="/community/qna" element={<InfoPage />} />
            <Route path="/projects/overview" element={<InfoPage />} />
            <Route path="/projects/ongoing" element={<InfoPage />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/teams/:id" element={<TeamPage />} />
            <Route path="/team-edit/:key" element={<TeamEdit />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </SplashContext.Provider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/*" element={<Admin />} />
        <Route path="/*" element={<Site />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
