import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '../../../../config';
import { logout, selectUser } from '../../../../store/slices/authSlice';
import {
  LayoutDashboard,
  Users,
  LogOut,
  X,
  ChevronRight,
  ChevronsRight,
  ChevronsLeft,
  Gift,
  Ticket,
  Tag,
  Briefcase,
  Settings,
} from 'lucide-react';

const NAV_ITEMS = [
  {
    labelKey: 'admin.sidebar.dashboard',
    path: ROUTES.ADMIN_DASHBOARD,
    icon: LayoutDashboard,
  },
  { labelKey: 'admin.sidebar.leads', path: ROUTES.ADMIN_EMAILS, icon: Users },
  {
    labelKey: 'admin.sidebar.giveaways',
    path: ROUTES.ADMIN_LEADS,
    icon: Gift,
  },
  {
    labelKey: 'admin.sidebar.coupons',
    path: ROUTES.ADMIN_ORDERS,
    icon: Ticket,
  },
  {
    labelKey: 'admin.sidebar.vouchers',
    path: ROUTES.ADMIN_MARKETPLACE_ORDERS,
    icon: Tag,
    iconSize: 18,
  },
  {
    labelKey: 'admin.sidebar.services',
    path: ROUTES.ADMIN_SERVICES,
    icon: Briefcase,
  },
  {
    labelKey: 'admin.sidebar.institutions',
    path: ROUTES.ADMIN_CASE_STUDIES,
    icon: Settings,
  },
];

// Border stays in NAV_BASE so layout never shifts between states.
const NAV_BASE =
  'group flex items-center gap-3 rounded-lg text-base font-medium transition-all duration-200 pl-3.25 pr-3 py-2.5 hover:-translate-y-0.5';
const NAV_ACTIVE =
  'bg-[#F48525] text-white ';
const NAV_INACTIVE =
  'text-gray-700 border-gray-100 hover:bg-orange-50/40 hover:text-gray-900 hover:border-orange-100';

const PUBLIC_ASSET_BASE = (process.env.REACT_APP_PUBLIC_PATH || '').replace(/\/$/, '');
const LOGO_SRC = `${PUBLIC_ASSET_BASE}/logo.webp`;
const LOGO_FALLBACK_SRC = `${PUBLIC_ASSET_BASE}/logoBrowser.png`;

const getNavClass = ({ isActive }) =>
  `${NAV_BASE} ${isActive ? NAV_ACTIVE : NAV_INACTIVE}`;

const Sidebar = ({
  onClose,
  onDesktopClose,
  onAutoCollapse,
  isCollapsed,
  onExpand,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const { t } = useTranslation();

  const activeNavOverride =
    location.pathname === ROUTES.ADMIN_CASE_STUDIES
      ? location.state?.activeNav
      : null;

  const overridePath =
    activeNavOverride === 'vouchers'
      ? ROUTES.ADMIN_MARKETPLACE_ORDERS
      : activeNavOverride === 'services'
        ? ROUTES.ADMIN_SERVICES
        : activeNavOverride === 'giveaways'
          ? ROUTES.ADMIN_LEADS
          : null;

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Signed out successfully');
    setTimeout(() => navigate(ROUTES.HOME, { replace: true }), 300);
  };

  if (isCollapsed) {
    return (
      <div className='h-full w-full bg-white flex flex-col items-center border-r border-gray-100 py-3 gap-1'>
        <button
          type='button'
          onClick={onExpand}
          title={t('nav.expandSidebar')}
          aria-label={t('nav.expandSidebar')}
          className='w-10 h-10 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-800 hover:bg-orange-50/40 transition-colors duration-200 mb-2 shrink-0'
        >
          <ChevronsRight size={20} aria-hidden='true' />
        </button>

        <nav
          className='flex-1 flex flex-col items-center gap-1 w-full px-2 overflow-y-auto'
          aria-label={t('nav.mainNavigation')}
        >
          {NAV_ITEMS.map(({ labelKey, path, icon: Icon, autoCollapse, iconSize = 20 }) => (
            <NavLink
              key={path}
              to={path}
              end={path === ROUTES.ADMIN_DASHBOARD}
              title={t(labelKey)}
              onClick={() => {
                onClose();
                if (autoCollapse && onAutoCollapse) onAutoCollapse();
              }}
              className={({ isActive }) => {
                const isOverrideActive = overridePath && path === overridePath;
                const shouldSuppressSettings =
                  Boolean(overridePath) && path === ROUTES.ADMIN_CASE_STUDIES;
                const resolvedActive =
                  (isActive && !shouldSuppressSettings) || isOverrideActive;

                return `w-10 h-10 flex items-center justify-center rounded-lg transition-colors duration-200 ${
                  resolvedActive
                    ? 'bg-[#F48525] text-white'
                    : 'text-gray-400 hover:text-gray-900 hover:bg-orange-50/40'
                }`;
              }}
            >
              <Icon size={iconSize} aria-hidden='true' />
            </NavLink>
          ))}
        </nav>

        <button
          type='button'
          onClick={handleLogout}
          title={t('nav.signOut')}
          aria-label={t('nav.signOut')}
          className='mt-1 w-10 h-10 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors duration-200 shrink-0 cursor-pointer'
        >
          <LogOut size={20} aria-hidden='true' />
        </button>
      </div>
    );
  }

  return (
    <div className='h-full w-full bg-white flex flex-col border-r border-gray-100'>
      <div className='flex items-start justify-between px-5 pt-5 pb-4  shrink-0'>
        <div>
         <Link to={"/"}>
          <img
              src={LOGO_SRC}
            alt='Maktech'
            width={120}
            height={32}
            className='h-16 w-auto object-contain'
            onError={(e) => {
                if (e.currentTarget.dataset.fallbackApplied !== 'true') {
                  e.currentTarget.dataset.fallbackApplied = 'true';
                  e.currentTarget.src = LOGO_FALLBACK_SRC;
                  return;
                }
                e.currentTarget.style.display = 'none';
            }}
          />
         </Link>
        </div>
        <button
          type='button'
          onClick={onClose}
          className='lg:hidden mt-0.5 p-1.5 -mr-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors'
          aria-label={t('nav.closeNavigation')}
        >
          <X size={20} aria-hidden='true' />
        </button>
        <button
          type='button'
          onClick={onDesktopClose}
          className='hidden lg:flex items-center justify-center mt-0.5 p-1.5 -mr-1 rounded-md text-gray-500 hover:text-gray-900 hover:bg-orange-50/40 transition-colors'
          aria-label={t('nav.collapseSidebar')}
        >
          <ChevronsLeft size={20} aria-hidden='true' />
        </button>
      </div>

      <nav
        className='flex-1 overflow-y-auto px-3 py-5'
        aria-label={t('nav.mainNavigation')}
      >
   
        <ul className='space-y-1.5' role='list'>
          {NAV_ITEMS.map(({ labelKey, path, icon: Icon, autoCollapse, iconSize = 20 }) => (
            <li key={path}>
              <NavLink
                to={path}
                end={path === ROUTES.ADMIN_DASHBOARD}
                onClick={() => {
                  onClose();
                  if (autoCollapse && onAutoCollapse) onAutoCollapse();
                }}
                className={({ isActive }) => {
                  const isOverrideActive = overridePath && path === overridePath;
                  const shouldSuppressSettings =
                    Boolean(overridePath) && path === ROUTES.ADMIN_CASE_STUDIES;
                  const resolvedActive =
                    (isActive && !shouldSuppressSettings) || isOverrideActive;
                  return getNavClass({ isActive: resolvedActive });
                }}
              >
                {({ isActive }) => {
                  const isOverrideActive = overridePath && path === overridePath;
                  const shouldSuppressSettings =
                    Boolean(overridePath) && path === ROUTES.ADMIN_CASE_STUDIES;
                  const resolvedActive =
                    (isActive && !shouldSuppressSettings) || isOverrideActive;

                  return (
                  <>
                    <Icon
                      size={iconSize}
                      aria-hidden='true'
                      className={`shrink-0 transition-colors ${
                        resolvedActive
                          ? 'text-white'
                          : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    />
                    <span className='truncate flex-1'>{t(labelKey)}</span>
                    <ChevronRight
                      size={18}
                      aria-hidden='true'
                      className={`shrink-0 mr-0.5 text-white drop-shadow-[0_0_6px_#f97316] ${
                        resolvedActive ? 'animate-nav-arrow' : 'opacity-0'
                      }`}
                    />
                  </>
                );
                }}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className='shrink-0 border-t border-gray-100 px-3 py-3 space-y-1.5'>
        <div className='flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gray-50'>
          <div className='shrink-0 w-9 h-9 rounded-full bg-linear-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-base font-bold select-none'>
            M
          </div>
          <div className='min-w-0 flex-1'>
            <p className='text-base font-semibold text-gray-900 leading-snug truncate'>
              {user?.name || 'Admin'}
            </p>
            <p className='text-sm text-gray-400 leading-snug truncate'>
              {user?.email || ''}
            </p>
          </div>
        </div>

        <button
          type='button'
          onClick={handleLogout}
          className={`${NAV_BASE} w-full text-gray-600 border-transparent hover:bg-red-50 hover:text-red-600 hover:shadow-[inset_3px_0_0_0_#ef4444] cursor-pointer`}
        >
          <LogOut
            size={20}
            aria-hidden='true'
            className='shrink-0 text-gray-400 group-hover:text-red-500 transition-colors'
          />
          <span>{t('Uitloggen')}</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
