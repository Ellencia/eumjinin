import { useState } from 'react';
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
import './App.css';

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
    <>
      {loading && <LoadingSplash onDone={() => setLoading(false)} />}
      <HashRouter>
        <div className="App">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<MainLayout />} />
              <Route path="/reservation" element={<Reservation />} />
              <Route path="/reservation/:roomId" element={<ReservationDetail />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </HashRouter>
    </>
  );
}

export default App;
