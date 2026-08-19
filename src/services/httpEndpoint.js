export const API_ENDPOINTS = {
  // AUTH: {
  //   LOGIN: '/auth/login',
  //   REGISTER: '/auth/register',
  //   LOGOUT: '/auth/logout',
  //   REFRESH: '/auth/refresh',
  //   ME: '/auth/me',
  //   FORGOT_PASSWORD: '/auth/forgot-password',
  //   RESET_PASSWORD: '/auth/reset-password',
  //   VERIFY_EMAIL: '/auth/verify-email',
  // },

  ADMIN_AUTH: {
    LOGIN: '/admin/auth/login',
  },

  ADMIN_DASHBOARD: {
    STATS: '/admin/dashboard',
    EXPORT: '/admin/dashboard/leads/export',
    ACTIVE_GIVEAWAY: '/admin/dashboard/giveaways/active',
  },

  ADMIN_GIVEAWAYS: {
    STATS_OVERVIEW: '/admin/giveaways/stats/overview',
    CREATE: '/admin/giveaways',
    LIST: '/admin/giveaways',
    BY_ID: (id) => `/admin/giveaways/${id}`,
    DRAW_WINNER: (id) => `/admin/giveaways/${id}/draw-winner`,
    SELECT_WINNER: (id) => `/admin/giveaways/${id}/select-winner`,
    NOTIFY_WINNER: (id) => `/admin/giveaways/${id}/notify-winner`,
  },

  ADMIN_VOUCHERS: {
    OVERVIEW: '/admin/vouchers/overview',
    CREATE: '/admin/vouchers',
    LIST: '/admin/vouchers',
    UPDATE: (id) => `/admin/vouchers/${id}`,
    DELETE: (id) => `/admin/vouchers/${id}`,
  },

  ADMIN_SERVICES: {
    CREATE: '/admin/services',
    UPDATE: (id) => `/admin/services/${id}`,
    DELETE: (id) => `/admin/services/${id}`,
  },

  ADMIN_COUPONS: {
    OVERVIEW: '/admin/coupons/overview',
    LIST: '/admin/coupons',
    BY_EMAIL: (email) => `/admin/coupons/${encodeURIComponent(email)}`,
  },

  // USERS: {
  //   PROFILE: '/users/profile',
  //   UPDATE_PROFILE: '/users/profile',
  //   CHANGE_PASSWORD: '/users/change-password',
  //   LIST: '/users',
  //   BY_ID: (id) => `/users/${id}`,
  // },

  // CONTACT: {
  //   SEND: '/contact',
  // },

  LEADS: {
    CREATE: '/leads',
  },

  ADMIN_LEADS: {
    LIST: '/admin/leads',
    BY_ID: (id) => `/admin/leads/${id}`,
    UPDATE_STATUS: (id) => `/admin/leads/${id}/status`,
    DELETE: (id) => `/admin/leads/${id}`,
    EXPORT: '/admin/leads/export',
    UPLOAD_CSV: '/admin/leads/upload-csv',
  },

  SERVICES: {
    LIST: '/services',
    BY_ID: (id) => `/services/${id}`,
  },

  GIVEAWAY: {
    ACTIVE: '/active-giveaway',
  },

  ORDERS: {
    CREATE: '/orders',
    CONFIRM: '/orders/confirm',
    BY_ID: (id) => `/orders/${id}`,
  },
};

export default API_ENDPOINTS;
