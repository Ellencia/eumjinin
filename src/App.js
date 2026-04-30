import { useState, createContext } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
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

function App() {
  const [loading, setLoading] = useState(true);

  return (
    <SplashContext.Provider value={loading}>
      {loading && <LoadingSplash onDone={() => setLoading(false)} />}
      <HashRouter>
        <div className="App">
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
            </Routes>
          </main>
          <Footer />
        </div>
      </HashRouter>
    </SplashContext.Provider>
  );
}

export default App;
