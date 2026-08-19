import React, { memo, useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Menu, X } from 'lucide-react';
import { ROUTES } from '../../config';
import { selectIsAuthenticated, selectUser } from '../../store/slices/authSlice';
import { IMG_LOGO } from './assets';

const NAV_LINKS = [
  { key: 'home.nav.home', route: ROUTES.HOME },
  { key: 'home.nav.services', route: ROUTES.SERVICES },
  { key: 'home.nav.giveaway', route: ROUTES.GIVEAWAY },
  { key: 'home.nav.about', route: ROUTES.ABOUT },
];

const HomeNav = memo(() => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen((v) => !v), []);
  const close = useCallback(() => setOpen(false), []);
  const isAdminLoggedIn =
    isAuthenticated && user?.role?.toLowerCase() === 'admin';

  const isActive = useCallback(
    (route) => {
      if (route === null) return false;
      // For services route, check if pathname starts with /services
      if (route === ROUTES.SERVICES) {
        return pathname === ROUTES.SERVICES || pathname.startsWith('/services/');
      }
      return pathname === route;
    },
    [pathname],
  );

  return (
    <nav className='sticky top-0 z-50 backdrop-blur-[6px] bg-[rgba(248,247,245,0.8)] border-b border-[rgba(244,133,37,0.1)] px-6 xl:px-20'>
      <div className='container mx-auto flex items-center justify-between h-20'>
        {/* Logo */}
        <Link to={ROUTES.HOME} onClick={close}>
          <img
            src='/logo.webp'
            alt='EliteBuild'
            className='h-16 w-auto lg:h-18 object-contain'
          />
        </Link>

        {/* Desktop nav links */}
        <div className='hidden md:flex items-center gap-10'>
          {NAV_LINKS.map(({ key, route }) => (
            <Link
              key={key}
              to={route}
              onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}
              className={`font-['Work_Sans',sans-serif] text-sm font-semibold transition-colors ${
                isActive(route)
                  ? 'text-[#ff6533]'
                  : 'text-heading hover:text-primary'
              }`}
            >
              {t(key)}
            </Link>
          ))}
        </div>

        <div className='hidden md:flex items-center gap-4'>
          {isAdminLoggedIn && (
            <Link
              to={ROUTES.ADMIN_DASHBOARD}
              onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}
              className="inline-flex items-center justify-center font-['Work_Sans',sans-serif] font-semibold text-sm text-primary border border-primary rounded-lg px-5 py-2.5 hover:bg-[#fff3e8] transition-colors"
            >
              {t('home.nav.dashboard')}
            </Link>
          )}

          {/* Desktop CTA */}
          <Link
            to={ROUTES.CONTACT}
            onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}
            className="btn inline-flex font-['Work_Sans',sans-serif] font-bold text-sm text-white bg-primary rounded-lg px-6 py-2.5 shadow-[0_4px_14px_rgba(244,133,37,0.35)] hover:bg-[#e07418] transition-colors"
          >
            {t('home.nav.contactUs')}
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          type='button'
          onClick={toggle}
          aria-label={open ? t('nav.closeMenu') : t('nav.openMenu')}
          aria-expanded={open}
          className='md:hidden p-2 rounded text-heading hover:text-primary transition-colors'
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className='md:hidden bg-[rgba(248,247,245,0.97)] border-t border-[rgba(244,133,37,0.1)] px-6 py-4 flex flex-col gap-3'>
          {NAV_LINKS.map(({ key, route }) => (
            <Link
              key={key}
              to={route}
              onClick={() => {
                close();
                window.scrollTo({ top: 0, behavior: 'instant' });
              }}
              className={`font-['Work_Sans',sans-serif] text-[15px] font-semibold py-2 ${
                isActive(route) ? 'text-[#ff6533]' : 'text-heading'
              }`}
            >
              {t(key)}
            </Link>
          ))}
          {isAdminLoggedIn && (
            <Link
              to={ROUTES.ADMIN_DASHBOARD}
              onClick={() => {
                close();
                window.scrollTo({ top: 0, behavior: 'instant' });
              }}
              className="font-['Work_Sans',sans-serif] text-[15px] font-semibold py-2 text-primary"
            >
              {t('home.nav.dashboard')}
            </Link>
          )}
          <Link
            to={ROUTES.CONTACT}
            onClick={() => {
              close();
              window.scrollTo({ top: 0, behavior: 'instant' });
            }}
            className="btn mt-2 font-['Work_Sans',sans-serif] font-bold text-sm text-white bg-primary rounded-lg px-6 py-2.5 text-center"
          >
            {t('home.nav.contactUs')}
          </Link>
        </div>
      )}
    </nav>
  );
});

HomeNav.displayName = 'HomeNav';

export default HomeNav;
