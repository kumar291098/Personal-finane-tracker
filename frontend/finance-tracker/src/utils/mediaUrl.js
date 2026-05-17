import { API_BASE_URL } from '../config/api';

export const resolveMediaUrl = (url) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith('/api/')) {
    return `${API_BASE_URL.replace(/\/api$/, '')}${url}`;
  }
  return url;
};
