import { dicebearThumbIdentity } from '~/shared/avatars'

const DICEBEAR_THUMBS_PREFIX = 'https://api.dicebear.com/9.x/thumbs/'

export function isValidAvatarKey(key: string, userId: string): boolean {
  if (key.startsWith(DICEBEAR_THUMBS_PREFIX) && dicebearThumbIdentity(key)) {
    return true
  }
  return key.startsWith(`u/${userId}/avatar.`)
}
