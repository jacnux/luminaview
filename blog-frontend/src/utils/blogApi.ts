export const API_PREFIX = '/api/blog';

export const getMainAppUrl = (): string => {
  const hostname = window.location.hostname;
  if (hostname === 'localhost') return 'http://localhost';
  return `https://${hostname.replace(/^(blog\.|.*?-blog\.)/, '')}`;
};
