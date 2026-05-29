import { createSlice } from '@reduxjs/toolkit'

const TOKEN_KEY = 'zaxira_access_token'
const USER_KEY = 'zaxira_user'

const readStoredToken = () => localStorage.getItem(TOKEN_KEY)

const normalizeAuthUser = (user) => {
  if (!user) return null

  if (user.role === 'SUPER_ADMIN') {
    return user.isSuperAdmin ? user : { ...user, isSuperAdmin: true }
  }

  return user
}

const readStoredUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? normalizeAuthUser(JSON.parse(raw)) : null
  } catch {
    return null
  }
}

const persistUser = (user) => {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(USER_KEY)
  }
}

const initialState = {
  accessToken: readStoredToken(),
  user: readStoredUser(),
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const token = action.payload.accessToken ?? null
      state.accessToken = token

      if (token) {
        localStorage.setItem(TOKEN_KEY, token)
      } else {
        localStorage.removeItem(TOKEN_KEY)
      }

      if (action.payload.user) {
        const user = normalizeAuthUser(action.payload.user)
        state.user = user
        persistUser(user)
      }
    },
    setUser: (state, action) => {
      const user = normalizeAuthUser(action.payload)
      state.user = user
      persistUser(user)
    },
    clearCredentials: (state) => {
      state.accessToken = null
      state.user = null
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    },
  },
})

export const { setCredentials, setUser, clearCredentials } = authSlice.actions

export const selectAccessToken = (state) => state.auth.accessToken

export const selectAuthUser = (state) => state.auth.user

export const selectIsAuthenticated = (state) => Boolean(state.auth.accessToken)

export default authSlice.reducer
