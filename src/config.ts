export const APP_URL =
  typeof process.env.ELECTRON_WEBPACK_APP_URL === 'string' && process.env.ELECTRON_WEBPACK_APP_URL.length > 0
    ? process.env.ELECTRON_WEBPACK_APP_URL
    : 'http://localhost:3000'

export const TOKEN_URL =
  typeof process.env.ELECTRON_WEBPACK_TOKEN_URL === 'string' && process.env.ELECTRON_WEBPACK_TOKEN_URL.length > 0
  ? process.env.ELECTRON_WEBPACK_TOKEN_URL
  : 'http://localhost:3000'

export const LOGOUT_URL =
  typeof process.env.ELECTRON_WEBPACK_LOGOUT_URL === 'string' && process.env.ELECTRON_WEBPACK_LOGOUT_URL.length > 0
  ? process.env.ELECTRON_WEBPACK_LOGOUT_URL
  : 'http://localhost:3000'
