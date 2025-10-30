import { ref } from 'vue'

// Global notification state
const show = ref(false)
const color = ref('success')
const message = ref('')
const timeout = ref(3000)

/**
 * Composable for managing global notifications
 * @returns {Object} Notification methods and state
 */
export function useNotification() {
  /**
   * Show a notification message
   * @param {string} msg - Message to display
   * @param {string} type - Notification type: success, error, warning, info
   * @param {number} duration - Auto close duration in milliseconds (0 = no auto close)
   */
  const showNotification = (msg, type = 'success', duration = 3000) => {
    message.value = msg
    color.value = type
    timeout.value = duration
    show.value = true
  }

  /**
   * Show success message
   * @param {string} msg
   * @param {number} duration
   */
  const success = (msg, duration = 3000) => {
    showNotification(msg, 'success', duration)
  }

  /**
   * Show error message
   * @param {string} msg
   * @param {number} duration
   */
  const error = (msg, duration = 4000) => {
    showNotification(msg, 'error', duration)
  }

  /**
   * Show warning message
   * @param {string} msg
   * @param {number} duration
   */
  const warning = (msg, duration = 3000) => {
    showNotification(msg, 'warning', duration)
  }

  /**
   * Show info message
   * @param {string} msg
   * @param {number} duration
   */
  const info = (msg, duration = 3000) => {
    showNotification(msg, 'info', duration)
  }

  /**
   * Close notification manually
   */
  const close = () => {
    show.value = false
  }

  return {
    // State
    show,
    color,
    message,
    timeout,
    // Methods
    showNotification,
    success,
    error,
    warning,
    info,
    close,
  }
}
