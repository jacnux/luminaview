import React from 'react';
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
//import PageEditor from './pages/PageEditor'; // Ancien éditeur (Showcase) - à garder si tu l'utilises encore
//import PublicPage from './pages/PublicPage';
import Tools from './pages/Tools';
import AdminUsers from './pages/AdminUsers';
import CreateAlbum from './pages/CreateAlbum';
import AdminReports from './pages/AdminReports';
import LegalPage from './pages/LegalPage';
import VerifyEmail from './pages/VerifyEmail';
import BlogManager from './pages/BlogManager';
import PortfolioPage from './pages/PortfolioPage';
import UserPageEditor from './pages/UserPageEditor';
import UserPageView from './pages/UserPageView';
import UserPagesManager from './pages/UserPagesManager'; // Le bon manager
import DashboardAbout from './pages/DashboardAbout';
import DashboardHelp from './pages/DashboardHelp';


// --- MODE PORTFOLIO (SOUS-DOMAINE) ---
/*const SubdomainApp: React.FC = () => {
  const slug = getSubdomain();
  if (!slug) return <Navigate to="https://helioscope.fr" />;
  return (
    <Routes>
      <Route path="/" element={<PortfolioPage username={slug} />} />
      <Route path="/legal" element={<LegalPage />} />
      <Route path="/album/:id" element={<AlbumView />} />
      <Route path="/:slug" element={<UserPageView />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};*/

const SubdomainApp: React.FC = () => {
  const slug = getSubdomain();
  if (!slug) return <Navigate to="https://helioscope.fr" />;
  return (
    <Routes>
      {/* ✅ On passe par un chemin fictif pour que useParams fonctionne */}
      <Route path="/" element={<Navigate to={`/portfolio/${slug}`} replace />} />
      <Route path="/portfolio/:username" element={<PortfolioPage />} />
      <Route path="/portfolio/:username/:slug" element={<UserPageView />} />
      <Route path="/legal" element={<LegalPage />} />
      <Route path="/album/:id" element={<AlbumView />} />
      <Route path="*" element={<Navigate to={`/portfolio/${slug}`} replace />} />
    </Routes>
  );
};

// --- MODE NORMAL (APPLI / DASHBOARD) ---
const MainApp = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isViewerMode = searchParams.get('mode') === 'viewer';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    );
  }

  if (isViewerMode && location.pathname.startsWith('/album')) {
    return (
      <Routes>
        <Route path="/album/:id" element={<AlbumView />} />
      </Routes>
    );
  }

  if (location.pathname.startsWith('/portfolio')) {
    return (
      <Routes>
        <Route path="/portfolio/:username/:slug" element={<UserPageView />} />
        <Route path="/portfolio/:username" element={<PortfolioPage />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard/about" element={<DashboardAbout />} />
        <Route path="/dashboard/help" element={<DashboardHelp />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/galleries" element={<Dashboard />} />

        <Route path="/create-album" element={<CreateAlbum />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/legal" element={<LegalPage />} />

        <Route path="/album/:id" element={<AlbumView />} />

        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/tools" element={<Tools />} />

        {/* ANCIEN SYSTEME (Si tu veux le garder pour les "Showcase" pages) */}
        {/* Si tu ne l'utilises plus, tu peux supprimer ces 2 lignes */}
        <Route path="/pages" element={<UserPagesManager />} />
      {/*  <Route path="/pages/edit/:id?" element={<PageEditor />} />  */}

        {/* NOUVEAU SYSTEME (Portfolio Utilisateur) */}
        <Route path="/dashboard/pages" element={<UserPagesManager />} />
        <Route path="/dashboard/user-page-editor" element={<UserPageEditor />} />
        <Route path="/dashboard/user-page-editor/:id" element={<UserPageEditor />} />

        <Route path="/manage-blog" element={<BlogManager />} />
    {/*   <Route path="/p/:slug" element={<PublicPageWrapper />} />  */}

        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/comments" element={<CommentModeration />} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
};

/* const PublicPageWrapper = () => {
  const { slug } = useParams<{ slug: string }>();
  if (!slug) return <div>Page introuvable</div>;
  return <PublicPage slug={slug} />;
};  */

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
