import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getBlogSlug } from '../../utils/getBlogSlug';
import { getMainAppUrl } from '../../utils/blogApi';
import DarkModeToggle from './DarkModeToggle';

const Navbar: React.FC = () => {
  const location = useLocation();
  const blogName = getBlogSlug(location.search);
  const s = location.search; // raccourci pour les query strings

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 sticky top-0 z-50 shadow-sm">
      <div className="container flex justify-between items-center mx-auto">
        <Link to={`/${s}`} className="text-xl font-bold text-gray-900 dark:text-white hover:text-yellow-500 transition">
          Blog de {blogName.toUpperCase()}
        </Link>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Link to={`/${s}`}                                              className="nav-link">Articles</Link>
          <Link to={`/about${s}`}                                        className="nav-link">Bio</Link>
          <Link to={`/gallery${s}`}                                      className="nav-link">Galeries</Link>
          <a href={`${getMainAppUrl()}/portfolio/${blogName}`} target="_blank" rel="noopener noreferrer" className="nav-link">Portfolio</a>
          <Link to={`/contact${s}`}                                      className="nav-link">Contact</Link>
          <DarkModeToggle />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
