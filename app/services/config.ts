export function useMocksEnabled(): boolean {
  return Boolean(useRuntimeConfig().public.useMocks)
}
