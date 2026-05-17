/** Distinct solid backgrounds for DiceBear thumbs avatars */
export const AVATAR_BACKGROUND_COLORS = [
  'b6e3f4',
  'c0aede',
  'd1d4f9',
  'ffd5dc',
  'ffdfbf',
  'a8e6cf',
  'ffb4a2',
  'c9d6ff',
  'f8b4d9',
  '84fab0',
  'ffeaa7',
  'e0c3fc',
] as const

export const AVATAR_THUMB_PRESETS = [
  { id: 'glow-blue', seed: 'glow', backgroundColor: 'b6e3f4' },
  { id: 'neon-lilac', seed: 'neon', backgroundColor: 'c0aede' },
  { id: 'mood-indigo', seed: 'mood', backgroundColor: 'd1d4f9' },
  { id: 'soft-pink', seed: 'soft', backgroundColor: 'ffd5dc' },
  { id: 'warm-peach', seed: 'warm', backgroundColor: 'ffdfbf' },
  { id: 'mint', seed: 'mint', backgroundColor: 'a8e6cf' },
  { id: 'coral', seed: 'coral', backgroundColor: 'ffb4a2' },
  { id: 'sky', seed: 'sky', backgroundColor: 'c9d6ff' },
  { id: 'rose', seed: 'rose', backgroundColor: 'f8b4d9' },
  { id: 'lime', seed: 'lime', backgroundColor: '84fab0' },
  { id: 'gold', seed: 'gold', backgroundColor: 'ffeaa7' },
  { id: 'violet', seed: 'violet', backgroundColor: 'e0c3fc' },
] as const

const DICEBEAR_THUMBS_HOST = 'https://api.dicebear.com/9.x/thumbs/png'

function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

export function avatarBackgroundColor(seed: string): string {
  const index = hashString(seed) % AVATAR_BACKGROUND_COLORS.length
  return AVATAR_BACKGROUND_COLORS[index]!
}

export function dicebearThumbsUrl(
  seed: string,
  options: { size?: number; backgroundColor?: string } = {},
): string {
  const size = options.size ?? 256
  const backgroundColor = options.backgroundColor ?? avatarBackgroundColor(seed)
  const params = new URLSearchParams({
    seed,
    size: String(size),
    backgroundColor,
    backgroundType: 'solid',
  })
  return `${DICEBEAR_THUMBS_HOST}?${params}`
}

export function avatarPresetUrl(
  preset: (typeof AVATAR_THUMB_PRESETS)[number],
  size = 128,
): string {
  return dicebearThumbsUrl(preset.seed, {
    size,
    backgroundColor: preset.backgroundColor,
  })
}

export function avatarPresetKey(
  preset: (typeof AVATAR_THUMB_PRESETS)[number],
): string {
  return dicebearThumbsUrl(preset.seed, {
    size: 256,
    backgroundColor: preset.backgroundColor,
  })
}

export function dicebearThumbIdentity(key: string | null | undefined): string | null {
  if (!key?.includes('api.dicebear.com') || !key.includes('/thumbs/')) return null
  try {
    const url = new URL(key)
    const seed = url.searchParams.get('seed') ?? ''
    const backgroundColor = url.searchParams.get('backgroundColor') ?? ''
    if (!seed) return null
    return `${seed}::${backgroundColor}`
  }
  catch {
    return null
  }
}

export function isUploadedAvatarKey(key: string | null | undefined): boolean {
  return !!key && !key.startsWith('http://') && !key.startsWith('https://')
}
