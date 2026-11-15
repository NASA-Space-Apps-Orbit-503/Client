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

  return {
    language,
    formatDate,
    formatNumber
  }
}
