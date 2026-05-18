export default defineNuxtPlugin(async () => {
  if (!import.meta.client) return

  const { Capacitor } = await import('@capacitor/core')
  if (!Capacitor.isNativePlatform()) return

  document.documentElement.classList.add('capacitor-native')

  const { StatusBar, Style } = await import('@capacitor/status-bar')
  await StatusBar.setOverlaysWebView({ overlay: false })
  await StatusBar.setStyle({ style: Style.Dark })
  await StatusBar.setBackgroundColor({ color: '#0a0a0f' })
})
