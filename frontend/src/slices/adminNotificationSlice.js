import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  notificationCounts: {
    reviews: 0,
    accessRequests: 0,
    bundleRequests: 0,
    careers: 0,
    notifications: 0,
    contactMessages: 0,
    faqs: 0,
    chats: 0
  },
  loading: false,
  error: null,
  lastFetched: null
}

const adminNotificationSlice = createSlice({
  name: "adminNotification",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload
    },
    setNotificationCounts: (state, action) => {
      state.notificationCounts = { ...state.notificationCounts, ...action.payload }
      state.lastFetched = Date.now()
      state.error = null
    },
    clearNotificationCount: (state, action) => {
      const sectionId = action.payload
      if (state.notificationCounts[sectionId] !== undefined) {
        state.notificationCounts[sectionId] = 0
      }
    },
    setError: (state, action) => {
      state.error = action.payload
      state.loading = false
    },
    clearError: (state) => {
      state.error = null
    },
    resetNotificationCounts: (state) => {
      state.notificationCounts = initialState.notificationCounts
      state.lastFetched = null
      state.error = null
    }
  }
})

export const {
  setLoading,
  setNotificationCounts,
  clearNotificationCount,
  setError,
  clearError,
  resetNotificationCounts
} = adminNotificationSlice.actions

export default adminNotificationSlice.reducer
