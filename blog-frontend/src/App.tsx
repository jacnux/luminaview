import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';

import Navbar      from './components/blog/Navbar';
import Footer      from './components/blog/Footer';
import PostList    from './pages/blog/PostList';
import PostDetail  from './pages/blog/PostDetail';
import AboutPage   from './pages/blog/AboutPage';
import GalleryPage from './pages/blog/GalleryPage';
import ContactPage from './pages/blog/ContactPage';
import NouveautesPage from './pages/blog/NouveautesPage';
import CarnetPage from './pages/blog/CarnetPage';
import { getBlogSlug } from './utils/getBlogSlug';
import { API_PREFIX } from './utils/blogApi';

const AppContent: React.FC = () => {
  const location = useLocation();
  const blogSlug = getBlogSlug(location.search);
  const [themeClass, setThemeClass] = useState('theme-classic');
  const [chambreNoireUrl, setChambreNoireUrl] = useState('');

  useEffect(() => {
    if (!blogSlug) return;
    fetch(`${API_PREFIX}/user/${blogSlug}`)
      .then(res => res.json())
      .then(data => {
        if (data) {
          if (data.blogTheme === 'portfolio') {
            setThemeClass('theme-portfolio');
          } else {
            setThemeClass('theme-classic');
          }
          setChambreNoireUrl(data.chambreNoireUrl || '');
        }
      })
      .catch(err => {
        console.error("Error loading blog theme:", err);
        setThemeClass('theme-classic');
      });
  }, [blogSlug]);

  return (
    <div className={themeClass} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar themeClass={themeClass} chambreNoireUrl={chambreNoireUrl} />
      <main style={{ flex: 1, width: '100%' }}>
        <Routes>
          <Route path="/"          element={<PostList />}    />
          <Route path="/post/:slug" element={<PostDetail />}  />
          <Route path="/about"     element={<AboutPage />}   />
          <Route path="/nouveautes" element={<NouveautesPage />} />
          <Route path="/gallery"   element={<GalleryPage />} />
          <Route path="/carnet"    element={<CarnetPage />}  />
          <Route path="/contact"   element={<ContactPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

const App: React.FC = () => (
  <Router>
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  </Router>
);

export default App;
