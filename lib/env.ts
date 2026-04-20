export const env = {
  apiBaseUrl:
    (import.meta.env.VITE_API_BASE_URL as string)?.replace(/\/$/, '') ||
    'http://localhost:3001',
};
