import React from 'react';
//import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { BrowserRouter, Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom';
import { getSubdomain } from './utils/domain';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import CommentModeration from './components/CommentModeration';

// Pages
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import AlbumView from './pages/AlbumView';
import EditProfile from './pages/EditProfile';
import PageEditor from './pages/PageEditor';
import PagesManager from './pages/PagesManager';
import PublicPage from './pages/PublicPage';
import Tools from './pages/Tools';
import AdminUsers from './pages/AdminUsers';
import CreateAlbum from './pages/CreateAlbum';
import AdminReports from './pages/AdminReports';
import LegalPage from './pages/LegalPage';
import VerifyEmail from './pages/VerifyEmail';
import BlogManager from './pages/BlogManager';
import PortfolioPage from './pages/PortfolioPage';

// --- MODE PORTFOLIO (SOUS-DOMAINE) ---
const SubdomainApp: React.FC = () => {
  const slug = getSubdomain();
  if (!slug) return <Navigate to="https://helioscope.fr" />;
  return (
    <Routes>
      <Route path="/" element={<PublicPage slug={slug} />} />
      <Route path="/legal" element={<LegalPage />} />
      <Route path="/album/:id" element={<AlbumView />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

// --- MODE NORMAL (APPLI / DASHBOARD) ---
const MainApp = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  // Détection du mode "viewer" (lien depuis portfolio)
  const isViewerMode = searchParams.get('mode') === 'viewer';

  // 1. Si mode Viewer (Album public) -> Pas de Layout, fond noir
  if (isViewerMode && location.pathname.startsWith('/album')) {
    return (
      <Routes>
        <Route path="/album/:id" element={<AlbumView />} />
      </Routes>
    );
  }

  // 2. Si on est sur le Portfolio -> Pas de Layout
  if (location.pathname.startsWith('/portfolio')) {
    return (
      <Routes>
        <Route path="/portfolio/:username" element={<PortfolioPage />} />
      </Routes>
    );
  }

  // 3. Sinon (Dashboard, Login, etc.) -> Avec Layout
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/galleries" element={<Dashboard />} />
        <Route path="/create-album" element={<CreateAlbum />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/manage-blog" element={<BlogManager />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/legal" element={<LegalPage />} />
        <Route path="/album/:id" element={<AlbumView />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/pages" element={<PagesManager />} />
        <Route path="/pages/edit/:id?" element={<PageEditor />} />
        <Route path="/p/:slug" element={<PublicPageWrapper />} />
        <Route path="/tools" element={<Tools />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/comments" element={<CommentModeration />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
};


const PublicPageWrapper = () => {
  const { slug } = useParams<{ slug: string }>();
  if (!slug) return <div>Page introuvable</div>;
  return <PublicPage slug={slug} />;
};

// --- COMPOSANT PRINCIPAL ---
const App: React.FC = () => {
  const subdomain = getSubdomain();

  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          {subdomain ? <SubdomainApp /> : <MainApp />}
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
