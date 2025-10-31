import apiClient from './api'

/**
 * Contact Service
 * Handles all API interactions for contact management
 */
export const contactService = {
  /**
   * Fetch all contacts from the backend
   * @returns {Promise} Promise resolving to API response
   */
  async getContacts() {
    return apiClient.get('/contacts')
  },

  /**
   * Fetch a single contact by its ID
   * @param {number} id - Contact ID
   * @returns {Promise} Promise resolving to API response
   */
  async getContact(id) {
    return apiClient.get(`/contacts/${id}`)
  },

  /**
   * Create a new contact
   * @param {Object} contactData - Contact information (name, phone, email, address)
   * @returns {Promise} Promise resolving to API response
   */
  async createContact(contactData) {
    return apiClient.post('/contacts', contactData)
  },

  /**
   * Update an existing contact
   * @param {number} id - Contact ID
   * @param {Object} contactData - Updated contact information
   * @returns {Promise} Promise resolving to API response
   */
  async updateContact(id, contactData) {
    return apiClient.put(`/contacts/${id}`, contactData)
  },

  /**
   * Delete a contact by ID
   * @param {number} id - Contact ID
   * @returns {Promise} Promise resolving to API response
   */
  async deleteContact(id) {
    return apiClient.delete(`/contacts/${id}`)
  },

  /**
   * Search contacts by query
   * @param {string} query - Search query string
   * @returns {Promise} Promise resolving to API response
   */
  async searchContacts(query) {
    return apiClient.get('/contacts/search', {
      params: { q: query },
    })
  },
}
