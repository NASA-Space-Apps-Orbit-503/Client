/**
 * Forwards `/api/**` to the backend and attaches `x-api-key` on the server,
 * so the key never reaches the browser bundle.
 * Logs each request (method, path, status, duration); the key is never logged.
 * In development it also logs the response body, truncated to MAX_LOGGED_BODY characters.
 */
const MAX_LOGGED_BODY = 2000

export default defineEventHandler((event) => {
  const { apiBaseUrl, apiKey } = useRuntimeConfig(event)

  if (!apiBaseUrl || !apiKey) {
    throw createError({ statusCode: 500, statusMessage: 'NUXT_API_BASE_URL and NUXT_API_KEY must be set' })
  }

  const path = event.path.slice('/api'.length)
  const target = apiBaseUrl.replace(/\/+$/, '') + path
  const startedAt = performance.now()

  return proxyRequest(event, target, {
    headers: { 'x-api-key': apiKey },
    onResponse: (_event, response) => {
      const ms = Math.round(performance.now() - startedAt)
      const line = `[api] ${event.method} ${path} -> ${response.status} (${ms} ms)`

      if (!import.meta.dev) {
        console.info(line)
        return
      }

      // Read a clone so the original stream is still sent to the browser untouched.
      response.clone().text()
        .then((body) => {
          const shown = body.length > MAX_LOGGED_BODY
            ? `${body.slice(0, MAX_LOGGED_BODY)}… (${body.length} chars)`
            : body
          console.info(`${line}\n${shown}`)
        })
        .catch(() => console.info(`${line}\n<body unavailable>`))
    }
  }).catch((error: unknown) => {
    const ms = Math.round(performance.now() - startedAt)
    console.error(`[api] ${event.method} ${path} -> failed (${ms} ms)`, error instanceof Error ? error.message : error)
    throw error
  })
})
