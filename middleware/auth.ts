export default defineNuxtRouteMiddleware(async () => {
  const { user, loading, initAuthListener } = useAuth()

  if (import.meta.client && loading.value) {
    initAuthListener()
    await new Promise<void>((resolve) => {
      const stop = watch(loading, (v) => {
        if (!v) {
          stop()
          resolve()
        }
      })
    })
  }

  if (!user.value) {
    return navigateTo('/login')
  }
})
