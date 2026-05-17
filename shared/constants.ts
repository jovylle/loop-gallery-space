export const QUOTAS = {
  maxStorageBytes: 100 * 1024 * 1024,
  maxUploadBytes: 8 * 1024 * 1024,
  maxItemsPerGallery: 100,
  maxUploadsPerDay: 20,
} as const

export const RESERVED_USERNAMES = new Set([
  'api',
  'app',
  'admin',
  'dashboard',
  'login',
  'www',
  'static',
  'assets',
  'media',
  'help',
  'support',
  'settings',
  'null',
  'undefined',
])

export const USERNAME_REGEX = /^[a-z0-9_]{3,24}$/
