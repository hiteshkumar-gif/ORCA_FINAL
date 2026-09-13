export const getApiBase = (): string => {
  // 1. If explicit environment variable is set (Vercel / Netlify / Production), prioritize it
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, '');
  }

  // 2. Fallback for local development
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:8000';
    }
  }

  return 'http://localhost:8000';
};
