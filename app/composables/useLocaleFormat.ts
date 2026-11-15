/**
 * Locale-aware formatters bound to the active i18n locale.
 * ISO dates (YYYY-MM-DD) are formatted in UTC so the calendar day never shifts.
 */
export default function useLocaleFormat() {
  const { localeProperties } = useI18n()

  const language = computed(() => localeProperties.value.language ?? 'en-US')

  const formatDate = (isoDate: string, options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }) =>
    new Intl.DateTimeFormat(language.value, { ...options, timeZone: 'UTC' }).format(new Date(`${isoDate}T00:00:00Z`))

  const formatNumber = (value: number, options?: Intl.NumberFormatOptions) =>
    new Intl.NumberFormat(language.value, options).format(value)

  /** Month names of the active locale, index 0 = January. */
  const monthNames = (style: 'long' | 'short' = 'short') => {
    const formatter = new Intl.DateTimeFormat(language.value, { month: style, timeZone: 'UTC' })
    return Array.from({ length: 12 }, (_, month) => formatter.format(new Date(Date.UTC(2024, month, 1))))
  }

  return {
    language,
    formatDate,
    formatNumber,
    monthNames
  }
}
