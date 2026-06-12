const readEnv = (key, fallback = '') => {
  const value = import.meta.env[key]
  return value === undefined || value === '' ? fallback : value
}

// Local backend default. For remote API set VITE_API_BASE_URL in .env (e.g. http://88.88.5.15:8000/api).
const defaultApiBaseUrl = 'http://localhost:8000/api'

export const env = {
  apiBaseUrl: readEnv('VITE_API_BASE_URL', defaultApiBaseUrl),
  wsUrl: readEnv('VITE_WS_URL', ''),
  appName: readEnv('VITE_APP_NAME', 'ZAXIRA'),
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
}
