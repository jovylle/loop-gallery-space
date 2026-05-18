function readIsNative(): boolean {
  if (!import.meta.client) return false
  const cap = (window as Window & { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor
  return cap?.isNativePlatform?.() ?? false
}

/** True when running inside the Capacitor native shell (Android/iOS), not in a normal browser tab. */
export function useCapacitor() {
  const isNative = useState('capacitor-native', readIsNative)

  onMounted(() => {
    isNative.value = readIsNative()
  })

  return { isNative, isCapacitorNative: readIsNative }
}
