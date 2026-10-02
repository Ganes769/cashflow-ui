/** Dashboard lives under `/app` so `/` can be the public marketing homepage. */
export const APP = '/app' as const
export const LOGIN = '/login' as const
export const LOGIN_XERO = '/login/xero' as const

export const appPath = (path = '') => `${APP}${path.startsWith('/') || path.startsWith('?') || path === '' ? path : `/${path}`}`
