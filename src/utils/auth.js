// utils/auth.js

// ------------------
// CSRF TOKEN
// ------------------
function getCSRFToken() {
  return document.cookie
    .split('; ')
    .find(row => row.startsWith('csrftoken='))
    ?.split('=')[1]
}

// ------------------
// BASE FETCH (SAFE)
// ------------------
async function authFetch(url, options = {}) {
  let response

  try {
    response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        ...(options.headers || {}),
        'X-CSRFToken': getCSRFToken(),
      },
    })
  } catch (err) {
    console.error('Fetch error:', err)
    return null
  }

  // 🔁 Refresh ONLY when allowed
  if (response.status === 401 && options.auth !== false) {
    try {
      await fetch('/api/auth/refresh/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'X-CSRFToken': getCSRFToken(),
        },
      })

      response = await fetch(url, {
        ...options,
        credentials: 'include',
        headers: {
          ...(options.headers || {}),
          'X-CSRFToken': getCSRFToken(),
        },
      })
    } catch (err) {
      console.error('Refresh failed:', err)
      return null
    }
  }

  return response
}

// ------------------
// INIT CSRF
// ------------------
export async function initCSRF() {
  await fetch('/api/auth/csrf/', {
    credentials: 'include',
  })
}

// ------------------
// LOGIN
// ------------------
export async function loginApi(username, password) {
  await initCSRF()

  const response = await authFetch('/api/auth/login/', {
    method: 'POST',
    auth: false, // 🚀 VERY IMPORTANT
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  })

  if (!response) {
    throw new Error('No response from server')
  }

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Login failed')
  }

  return data.user
}

// ------------------
// LOGOUT
// ------------------
export async function logoutApi() {
  await authFetch('/api/auth/logout/', {
    method: 'POST',
  })
}

// ------------------
// CURRENT USER
// ------------------
export async function getCurrentUserApi() {
  try {
    const response = await authFetch('/api/auth/user/')

    if (!response || !response.ok) {
      return null
    }

    const data = await response.json()
    return data.user
  } catch {
    return null
  }
}

// ------------------
// ROLE CHECK
// ------------------
export function isSuperAdmin(user) {
  return user?.is_superuser
}