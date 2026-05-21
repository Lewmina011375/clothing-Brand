import { useLocation } from 'react-router-dom';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import AppRoutes from './routes';
import './App.css';

function App() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      <Navbar />
      <main className="relative flex-1">
        <div
          className={`absolute inset-0 z-0 ${
            isHomePage ? 'bg-gradient-to-b from-white via-white to-white' : 'bg-white'
          }`}
          aria-hidden
        />
        <div className="relative z-10 min-h-full">
          <AppRoutes />
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default App;
