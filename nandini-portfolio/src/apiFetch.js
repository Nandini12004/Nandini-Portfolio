const RETRY_STATUSES = [429, 502, 503, 504]

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export async function fetchWithRetry(url, options = {}, { retries = 10, delayMs = 4000 } = {}) {
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, options)
      const contentType = response.headers.get('content-type') || ''
      const serverNotReady =
        RETRY_STATUSES.includes(response.status) || !contentType.includes('application/json')

      if (!serverNotReady) {
        return response
      }
    } catch {
      // network error while the server is waking up: try again
    }

    if (attempt < retries) {
      await wait(delayMs)
    }
  }

  throw new Error('The server is taking longer than usual to wake up. Please try again in a minute.')
}