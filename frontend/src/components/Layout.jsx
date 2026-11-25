import { Link, Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import Preloader from './Preloader.jsx';
import ScrollTop from './ScrollTop.jsx';
import ScrollManager from './ScrollManager.jsx';

export default function Layout() {
  return (
    <>
      <Preloader />
      <ScrollManager />
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
      <div className="mobile-donate-bar">
        <Link to="/join" className="btn-hw-primary">
          Join the Lab <i className="bi bi-code-slash" />
        </Link>
      </div>
      <ScrollTop />
    </>
  );
}
