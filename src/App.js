import { useState, createContext } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
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
import DesignPilot from './pages/DesignPilot';
import Admin from './pages/Admin';
import ScrollManager from './components/ScrollManager';
import { DesignProvider, useDesign } from './contexts/DesignContext';
import V1App from './designs/v1/V1App';
import V2App from './designs/v2/V2App';
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

// 공개 사이트. 시안(v1/v2) 선택 시 통째로 교체됨
function Site() {
  const { design } = useDesign();
  const [loading, setLoading] = useState(true);

  if (design === 'v1') return <V1App />;
  if (design === 'v2') return <V2App />;

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
            <Route path="/designs" element={<DesignPilot />} />
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
    <DesignProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/admin/*" element={<Admin />} />
          <Route path="/*" element={<Site />} />
        </Routes>
      </BrowserRouter>
    </DesignProvider>
  );
}

export default App;
