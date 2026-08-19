import React, { memo, useState, useCallback } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogIn, Menu, X } from 'lucide-react';
import { APP_CONFIG, ROUTES } from '../config';

const NAV_ROUTE_KEYS = [
  { to: ROUTES.HOME, key: 'nav.home', end: true },
  { to: ROUTES.ABOUT, key: 'nav.about' },
  { to: ROUTES.SERVICES, key: 'nav.services' },
  { to: ROUTES.CONTACT, key: 'nav.contact' },
];

const navLinkClass = ({ isActive }) =>
  isActive
    ? 'px-3 py-2 rounded font-semibold bg-white/20'
    : 'px-3 py-2 rounded hover:bg-[#e07520] transition-colors duration-150';

const mobileNavLinkClass = ({ isActive }) =>
  isActive
    ? 'block px-4 py-2 rounded font-semibold bg-white/20'
    : 'block px-4 py-2 rounded hover:bg-[#e07520] transition-colors duration-150';

const Layout = memo(() => {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <div className='min-h-screen bg-gray-50'>
      <nav className='bg-[#F48525] text-white shadow-lg'>
        <div className='container mx-auto px-4'>
          <div className='flex items-center justify-between h-16'>
            {/* Brand */}
            <div className='flex items-center gap-8'>
              <Link
                to={ROUTES.HOME}
                className='text-xl font-bold tracking-tight'
              >
                {APP_CONFIG.NAME}
              </Link>

              {/* Desktop links */}
              <div className='hidden md:flex gap-1'>
                {NAV_ROUTE_KEYS.map(({ to, key, end }) => (
                  <NavLink key={to} to={to} end={end} className={navLinkClass}>
                    {t(key)}
                  </NavLink>
                ))}
              </div>
            </div>

            <div className='flex items-center gap-2'>
              <Link
                to={ROUTES.LOGIN}
                className='hidden md:flex items-center gap-2 bg-white text-[#F48525] hover:bg-orange-50 px-4 py-2 rounded-lg font-semibold text-sm transition-colors duration-200 shadow-sm'
              >
                <LogIn size={16} aria-hidden='true' />
                {t('nav.login')}
              </Link>

              {/* Mobile hamburger */}
              <button
                type='button'
                onClick={() => setMenuOpen((v) => !v)}
                aria-label={menuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
                aria-expanded={menuOpen}
                aria-controls='mobile-menu'
                className='md:hidden p-2 rounded hover:bg-[#e07520] transition-colors'
              >
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div
            id='mobile-menu'
            className='md:hidden border-t border-[#F48525] px-4 py-3 flex flex-col gap-1'
          >
            {NAV_ROUTE_KEYS.map(({ to, key, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={closeMenu}
                className={mobileNavLinkClass}
              >
                {t(key)}
              </NavLink>
            ))}
            <Link
              to={ROUTES.LOGIN}
              onClick={closeMenu}
              className='mt-2 flex items-center gap-2 bg-white text-[#F48525] hover:bg-orange-50 px-4 py-2 rounded-lg font-semibold text-sm transition-colors duration-200 self-start'
            >
              <LogIn size={16} aria-hidden='true' />
              {t('nav.login')}
            </Link>
          </div>
        )}
      </nav>

      <main className='container mx-auto px-4 py-8'>
        <Outlet />
      </main>
    </div>
  );
});

Layout.displayName = 'Layout';

export default Layout;
