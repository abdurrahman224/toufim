import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu } from 'lucide-react';
import Sidebar from './adminSidebar/Sidebar';

const PUBLIC_ASSET_BASE = (process.env.REACT_APP_PUBLIC_PATH || '').replace(/\/$/, '');
const LOGO_SRC = `${PUBLIC_ASSET_BASE}/logo.webp`;
const LOGO_FALLBACK_SRC = `${PUBLIC_ASSET_BASE}/logoBrowser.png`;

const Layout = () => {
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopOpen, setDesktopOpen] = useState(true);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  return (
    <div className='flex h-dvh overflow-hidden bg-gray-50'>
      <div
        className={`fixed inset-0 z-20 bg-black/40 backdrop-blur-sm lg:hidden transition-opacity duration-300 ${
          sidebarOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden='true'
      />

      <aside
        id='sidebar'
        aria-label='Sidebar navigation'
        className={`
          fixed inset-y-0 left-0 z-30 w-72 transform transition-all duration-300 ease-in-out
          lg:relative lg:z-auto lg:shrink-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          ${desktopOpen ? 'lg:translate-x-0 lg:w-72' : 'lg:translate-x-0 lg:w-16'}
        `}
      >
        <Sidebar
          onClose={() => setSidebarOpen(false)}
          onDesktopClose={() => setDesktopOpen(false)}
          onAutoCollapse={() => setDesktopOpen(false)}
          isCollapsed={!desktopOpen}
          onExpand={() => setDesktopOpen(true)}
        />
      </aside>

      <main className='flex-1 flex flex-col min-w-0 overflow-hidden'>
        <header className='lg:hidden flex items-center gap-3 h-14 px-4 bg-white border-b border-gray-100 shrink-0'>
          <button
            type='button'
            onClick={() => setSidebarOpen(true)}
            aria-expanded={sidebarOpen}
            aria-controls='sidebar'
            aria-label={t('nav.openMenu')}
            className='p-2 -ml-1 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors'
          >
            <Menu size={20} aria-hidden='true' />
          </button>
          <img
            src={LOGO_SRC}
            alt='Maktech'
            width={120}
            height={28}
            className='h-7 w-auto object-contain'
            onError={(e) => {
              if (e.currentTarget.dataset.fallbackApplied !== 'true') {
                e.currentTarget.dataset.fallbackApplied = 'true';
                e.currentTarget.src = LOGO_FALLBACK_SRC;
                return;
              }
              e.currentTarget.style.display = 'none';
            }}
          />
        </header>

        {/* Scrollable page area — data-lenis-prevent stops Lenis hijacking this scroll container */}
        <div className='flex-1 min-h-0 overflow-y-auto' data-lenis-prevent>
          <div className='w-full px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8'>
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
