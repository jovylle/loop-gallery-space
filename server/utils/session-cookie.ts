import { sessionCookieDomain } from '~/shared/host'

export const SESSION_COOKIE_NAME = 'lg_session'

/** ~55m; Firebase ID tokens expire after 1h. */
export const SESSION_COOKIE_MAX_AGE = 55 * 60

export function setSessionCookie(event: H3Event, token: string, galleryHost: string) {
  const domain = sessionCookieDomain(galleryHost)
  if (!domain) return

  setCookie(event, SESSION_COOKIE_NAME, token, {
    domain,
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: SESSION_COOKIE_MAX_AGE,
    path: '/',
  })
}

export function clearSessionCookie(event: H3Event, galleryHost: string) {
  const domain = sessionCookieDomain(galleryHost)
  if (!domain) return

  setCookie(event, SESSION_COOKIE_NAME, '', {
    domain,
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
}
