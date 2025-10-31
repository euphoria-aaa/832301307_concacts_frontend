import axios from 'axios'

// Use environment variable or fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Response interceptor to handle standardized response format
apiClient.interceptors.response.use(
  response => {
    // Backend returns { code, msg, data? }
    // code: 0 = success, non-zero = error
    const { code, msg, data } = response.data

    if (code === 0) {
      // Success - show notification with success message (if provided)
      // Only show notification if msg is not empty to avoid showing empty messages
      if (msg && msg.trim() !== '') {
        // Import useNotification dynamically to avoid circular dependency
        import('../composables/useNotification')
          .then(({ useNotification }) => {
            const { success } = useNotification()
            success(msg)
          })
          .catch(() => {
            // Fallback: ignore notification if composable not available
          })
      }

      return Promise.resolve({
        success: true,
        code,
        msg,
        data,
      })
    } else {
      // Error - show error notification
      import('../composables/useNotification')
        .then(({ useNotification }) => {
          const { error } = useNotification()
          error(msg || 'An error occurred')
        })
        .catch(() => {
          // Fallback: ignore notification if composable not available
        })

      // Reject with standardized error
      return Promise.reject({
        success: false,
        code,
        msg,
        data,
      })
    }
  },
  error => {
    // Network or other errors - show error notification
    import('../composables/useNotification')
      .then(({ useNotification }) => {
        const { error: showError } = useNotification()
        const errorMsg = error.response?.data?.msg || error.message || 'Network error'
        showError(errorMsg)
      })
      .catch(() => {
        // Fallback: ignore notification if composable not available
      })

    return Promise.reject({
      success: false,
      code: -1,
      msg: error.message || 'Network error',
      data: null,
    })
  }
)

export default apiClient
