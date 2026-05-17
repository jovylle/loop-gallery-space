export default defineNuxtRouteMiddleware(async () => {
  const { loading, initAuthListener, isAuthenticated } = useAuth()

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

  if (!isAuthenticated.value) {
    return navigateTo('/login')
  }
})
