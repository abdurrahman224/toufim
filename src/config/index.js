export const APP_CONFIG = {
  NAME: process.env.REACT_APP_NAME || 'Left Lane',
  VERSION: process.env.REACT_APP_VERSION || '1.0.0',
};

export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  SERVICES: '/services',
  SERVICES_DETAIL: '/services/:id',
  SERVICES_SANITAIR: '/services/sanitair',
  GIVEAWAY: '/giveaway',
  CHECKOUT: '/giveaway/checkout',
  PAYMENT_SUCCESS: '/payment-success',
  PAYMENT_CANCEL: '/payment-cancel',
  CONTACT: '/contact',
  LOGIN: '/login',
  ADMIN: '/admin',
  REDUX_DEMO: '/redux-demo',
  // Admin sub-routes
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_EMAILS: '/admin/leads',
  ADMIN_LEADS: '/admin/giveaways',
  ADMIN_ORDERS: '/admin/coupons',
  ADMIN_MARKETPLACE_ORDERS: '/admin/vouchers',
  ADMIN_SERVICES: '/admin/services',
  ADMIN_CASE_STUDIES: '/admin/settings',
};

export const API_CONFIG = {
  // Use the backend base URL directly for all environments.
  BASE_URL: process.env.REACT_APP_API_BASE_URL || '',
  VITALS_ENDPOINT: process.env.REACT_APP_VITALS_ENDPOINT || '',
  TIMEOUT: parseInt(process.env.REACT_APP_API_TIMEOUT || '10000', 10),
  RETRY_ATTEMPTS: parseInt(process.env.REACT_APP_API_RETRY_ATTEMPTS || '3', 10),
  RETRY_DELAY: parseInt(process.env.REACT_APP_API_RETRY_DELAY || '1000', 10),
};

export const SEO_CONFIG = {
  DEFAULT_TITLE: process.env.REACT_APP_SEO_TITLE || 'Left Lane',
  DEFAULT_DESCRIPTION:
    process.env.REACT_APP_SEO_DESCRIPTION || 'A professional React application',
  DEFAULT_KEYWORDS: (
    process.env.REACT_APP_SEO_KEYWORDS || 'react,webpack,tailwind'
  ).split(','),
  SITE_URL: typeof window !== 'undefined' ? window.location.origin : '',
};

export const PERFORMANCE_BUDGETS = {
  LCP: 2500,
  FCP: 1800,
  CLS: 0.1,
  INP: 200,
  TTFB: 800,
};

export const TOAST_CONFIG = {
  POSITION: 'top-center',
  DURATION: 3000,
};

export const I18N_CONFIG = {
  DEFAULT_LOCALE: 'nl',
  FALLBACK_LOCALE: 'nl',
  SUPPORTED_LOCALES: ['nl'],
  STORAGE_KEY: 'app_language',
};
