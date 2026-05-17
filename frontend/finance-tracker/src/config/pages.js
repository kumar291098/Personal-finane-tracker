export const APP_PAGES = [
  { key: 'dashboard', path: '/dashboard', label: 'Dashboard' },
  { key: 'transactions', path: '/transactions', label: 'Transactions' },
  { key: 'analytics', path: '/analytics', label: 'Analytics' },
  { key: 'categories', path: '/categories', label: 'Categories' },
  { key: 'subscription', path: '/subscription', label: 'Subscription' },
  { key: 'profile', path: '/profile', label: 'Profile' },
  { key: 'access', path: '/access', label: 'Access' },
  { key: 'monitoring', path: '/monitoring', label: 'Monitoring' }
];

export const ALL_PAGE_KEYS = APP_PAGES.map(page => page.key);
