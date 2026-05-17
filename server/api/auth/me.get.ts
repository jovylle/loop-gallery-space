import { toAuthUser } from '~/server/utils/user-response'

export default defineEventHandler(async (event) => {
  const user = await requireAuthOrCreate(event)
  return toAuthUser(user)
})
