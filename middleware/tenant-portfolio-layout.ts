export default defineNuxtRouteMiddleware(() => {
  const tenant = useTenantUsername()
  if (tenant.value) {
    setPageLayout('portfolio')
  }
})
