/** Circle backgrounds behind the thumb */
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

/** Thumb body colors (DiceBear shapeColor) */
export const AVATAR_SHAPE_COLORS = [
  '0a5b83',
  '1c799f',
  '69d2e7',
  'f88c49',
  'e74c3c',
  '9b59b6',
  '2ecc71',
  'f39c12',
  'e91e63',
  '34495e',
  '16a085',
  'd35400',
] as const

export const AVATAR_THUMB_PRESETS = [
  { id: 'glow-blue', seed: 'glow', backgroundColor: 'b6e3f4', shapeColor: 'f88c49' },
  { id: 'neon-lilac', seed: 'neon', backgroundColor: 'c0aede', shapeColor: '9b59b6' },
  { id: 'mood-indigo', seed: 'mood', backgroundColor: 'd1d4f9', shapeColor: '0a5b83' },
  { id: 'soft-pink', seed: 'soft', backgroundColor: 'ffd5dc', shapeColor: 'e91e63' },
  { id: 'warm-peach', seed: 'warm', backgroundColor: 'ffdfbf', shapeColor: 'd35400' },
  { id: 'mint', seed: 'mint', backgroundColor: 'a8e6cf', shapeColor: '16a085' },
  { id: 'coral', seed: 'coral', backgroundColor: 'ffb4a2', shapeColor: 'e74c3c' },
  { id: 'sky', seed: 'sky', backgroundColor: 'c9d6ff', shapeColor: '1c799f' },
  { id: 'rose', seed: 'rose', backgroundColor: 'f8b4d9', shapeColor: '9b59b6' },
  { id: 'lime', seed: 'lime', backgroundColor: '84fab0', shapeColor: '2ecc71' },
  { id: 'gold', seed: 'gold', backgroundColor: 'ffeaa7', shapeColor: 'f39c12' },
  { id: 'violet', seed: 'violet', backgroundColor: 'e0c3fc', shapeColor: '34495e' },
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

function pickFrom<T extends readonly string[]>(items: T, index: number): T[number] {
  return items[index % items.length]!
}

export function avatarBackgroundColor(seed: string): string {
  return pickFrom(AVATAR_BACKGROUND_COLORS, hashString(`${seed}:bg`))
}

export function avatarShapeColor(seed: string): string {
  return pickFrom(AVATAR_SHAPE_COLORS, hashString(`${seed}:shape`))
}

/** Random palette pair for new accounts (face still derived from seed). */
export function randomAvatarColors(): {
  backgroundColor: string
  shapeColor: string
} {
  const randomIndex = (max: number) => {
    const buf = new Uint32Array(1)
    crypto.getRandomValues(buf)
    return buf[0]! % max
  }
  return {
    backgroundColor: pickFrom(AVATAR_BACKGROUND_COLORS, randomIndex(AVATAR_BACKGROUND_COLORS.length)),
    shapeColor: pickFrom(AVATAR_SHAPE_COLORS, randomIndex(AVATAR_SHAPE_COLORS.length)),
  }
}

export function dicebearThumbsUrl(
  seed: string,
  options: {
    size?: number
    backgroundColor?: string
    shapeColor?: string
  } = {},
): string {
  const size = options.size ?? 256
  const backgroundColor = options.backgroundColor ?? avatarBackgroundColor(seed)
  const shapeColor = options.shapeColor ?? avatarShapeColor(seed)
  const params = new URLSearchParams({
    seed,
    size: String(size),
    backgroundColor,
    backgroundType: 'solid',
    shapeColor,
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
    shapeColor: preset.shapeColor,
  })
}

export function avatarPresetKey(
  preset: (typeof AVATAR_THUMB_PRESETS)[number],
): string {
  return dicebearThumbsUrl(preset.seed, {
    size: 256,
    backgroundColor: preset.backgroundColor,
    shapeColor: preset.shapeColor,
  })
}

export function dicebearThumbIdentity(key: string | null | undefined): string | null {
  if (!key?.includes('api.dicebear.com') || !key.includes('/thumbs/')) return null
  try {
    const url = new URL(key)
    const seed = url.searchParams.get('seed') ?? ''
    const backgroundColor = url.searchParams.get('backgroundColor') ?? ''
    const shapeColor = url.searchParams.get('shapeColor') ?? ''
    if (!seed) return null
    return `${seed}::${backgroundColor}::${shapeColor}`
  }
  catch {
    return null
  }
}

export function isUploadedAvatarKey(key: string | null | undefined): boolean {
  return !!key && !key.startsWith('http://') && !key.startsWith('https://')
}
