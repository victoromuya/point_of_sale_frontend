import { initCSRF } from './auth'

export function getCookie(name) {
  let cookieValue = null

  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';')

    for (let cookie of cookies) {
      cookie = cookie.trim()
      if (cookie.startsWith(name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1))
        break
      }
    }
  }

  return cookieValue
}

export async function apiFetch(url, options = {}) {

  await initCSRF()

  const csrftoken = getCookie('csrftoken')

  return fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrftoken,
      ...(options.headers || {}),
    },
    ...options,
  })
}