import { createRemoteJWKSet, jwtVerify } from 'jose'
import { firebaseProjectId } from '~/shared/firebase.config'
import type { UserRecord } from '~/shared/types'
import { SESSION_COOKIE_NAME } from '~/server/utils/session-cookie'

const jwksCache = new Map<string, ReturnType<typeof createRemoteJWKSet>>()

function getJwks(projectId: string) {
  if (!jwksCache.has(projectId)) {
    jwksCache.set(
      projectId,
      createRemoteJWKSet(
        new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'),
      ),
    )
  }
  return jwksCache.get(projectId)!
}

export function bearerTokenFromEvent(event: H3Event): string | null {
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  return authHeader.slice(7)
}

export function authTokenFromEvent(event: H3Event): string | null {
  return bearerTokenFromEvent(event) || getCookie(event, SESSION_COOKIE_NAME) || null
}

export async function verifyFirebaseIdToken(token: string): Promise<{ uid: string; email?: string }> {
  const projectId = firebaseProjectId

  if (!projectId) {
    throw createError({ statusCode: 500, statusMessage: 'Firebase project not configured' })
  }

  try {
    const { payload } = await jwtVerify(token, getJwks(projectId), {
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
    })
    const uid = payload.sub
    if (!uid) throw new Error('No sub')
    return { uid, email: payload.email as string | undefined }
  }
  catch {
    throw createError({ statusCode: 401, statusMessage: 'Invalid or expired token' })
  }
}

export async function verifyFirebaseToken(event: H3Event): Promise<{ uid: string; email?: string }> {
  const token = authTokenFromEvent(event)
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Missing authorization token' })
  }
  return verifyFirebaseIdToken(token)
}

export async function requireAuth(event: H3Event): Promise<UserRecord> {
  const { uid } = await verifyFirebaseToken(event)
  const db = getDb(event)
  const user = await db
    .prepare('SELECT * FROM users WHERE firebase_uid = ?')
    .bind(uid)
    .first<UserRecord>()

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'User not found. Complete onboarding.' })
  }
  return user
}

export async function requireAuthOrCreate(event: H3Event): Promise<UserRecord> {
  const { uid } = await verifyFirebaseToken(event)
  const db = getDb(event)
  let user = await db
    .prepare('SELECT * FROM users WHERE firebase_uid = ?')
    .bind(uid)
    .first<UserRecord>()

  if (!user) {
    const id = crypto.randomUUID()
    await db
      .prepare(
        'INSERT INTO users (id, firebase_uid, is_public, storage_bytes) VALUES (?, ?, 1, 0)',
      )
      .bind(id, uid)
      .run()
    user = await db
      .prepare('SELECT * FROM users WHERE id = ?')
      .bind(id)
      .first<UserRecord>()
  }

  return user!
}
