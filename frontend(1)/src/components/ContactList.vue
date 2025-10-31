<script setup>
  import { ref, onMounted, watch, computed } from 'vue'
  import { contactService } from '../services/contactService'
  import ContactForm from './ContactForm.vue'
  import { useNotification } from '../composables/useNotification'

  const contacts = ref([])
  const loading = ref(false)
  const showForm = ref(false)
  const editingContact = ref(null)
  const showDeleteDialog = ref(false)
  const contactToDelete = ref(null)
  const searchQuery = ref('')
  const searchResults = ref([])
  const isSearching = ref(false)
  const { success, info } = useNotification()

  const loadContacts = async () => {
    loading.value = true
    try {
      const response = await contactService.getContacts()
      contacts.value = response.data || []
      // Update search results if currently searching
      if (searchQuery.value.trim()) {
        searchResults.value = response.data || []
      }
    } catch (err) {
      // Error handling is now done in the API interceptor
      console.error('Failed to load contacts:', err)
    } finally {
      loading.value = false
    }
  }

  // Search contacts with debouncing
  let searchTimeout = null
  const performSearch = async () => {
    const query = searchQuery.value.trim()

    if (!query) {
      // If search is cleared, show all contacts
      searchResults.value = []
      await loadContacts()
      return
    }

    isSearching.value = true
    try {
      const response = await contactService.searchContacts(query)
      searchResults.value = response.data || []

      // Show notification with search results count
      if (searchResults.value.length > 0) {
        info(`Found ${searchResults.value.length} contact(s) matching "${query}"`)
      } else {
        info(`No contacts found matching "${query}"`)
      }
    } catch (err) {
      // Error handling is now done in the API interceptor
      console.error('Failed to search contacts:', err)
    } finally {
      isSearching.value = false
    }
  }

  // Watch for search query changes with debounce
  watch(searchQuery, (newQuery, oldQuery) => {
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    // If query is empty, reset immediately
    if (!newQuery || newQuery.trim() === '') {
      searchResults.value = []
      loadContacts()
      return
    }

    // Debounce search by 300ms
    searchTimeout = setTimeout(() => {
      if (newQuery.trim()) {
        performSearch()
      }
    }, 300)
  })

  // Computed property to get displayed contacts
  const displayedContacts = computed(() => {
    return searchQuery.value.trim() ? searchResults.value : contacts.value
  })

  const handleAddClick = () => {
    editingContact.value = null
    showForm.value = true
  }

  const handleEditClick = async contact => {
    try {
      const response = await contactService.getContact(contact.id)
      editingContact.value = response.data
      showForm.value = true
    } catch (err) {
      // Error handling is now done in the API interceptor
      console.error('Failed to load contact:', err)
    }
  }

  const handleDeleteClick = contact => {
    contactToDelete.value = contact
    showDeleteDialog.value = true
  }

  const confirmDelete = async () => {
    try {
      await contactService.deleteContact(contactToDelete.value.id)
      await loadContacts()
      showDeleteDialog.value = false
      contactToDelete.value = null
    } catch (err) {
      // Error handling is now done in the API interceptor
      console.error('Failed to delete contact:', err)
    }
  }

  const cancelDelete = () => {
    showDeleteDialog.value = false
    contactToDelete.value = null
  }

  const handleFormClose = () => {
    showForm.value = false
    editingContact.value = null
  }

  const handleFormSubmit = async () => {
    await loadContacts()
    handleFormClose()
  }

  onMounted(() => {
    loadContacts()
  })
</script>

<template>
  <div class="contact-list">
    <div class="header">
      <h1>Contact Management</h1>
      <v-btn color="primary" @click="handleAddClick">
        <v-icon>mdi-plus</v-icon>
        Add Contact
      </v-btn>
    </div>

    <!-- Search Section -->
    <v-card class="search-card">
      <v-card-text>
        <v-text-field
          v-model="searchQuery"
          label="Search Contacts"
          placeholder="Search by name, phone, email, or address"
          prepend-inner-icon="mdi-magnify"
          clearable
          :loading="isSearching"
          variant="outlined"
          hide-details
        ></v-text-field>
        <div v-if="searchQuery.trim() && !isSearching" class="search-results-info">
          <v-icon size="small" color="info">mdi-information</v-icon>
          <span>
            {{ searchResults.length }} contact(s) found
          </span>
        </div>
      </v-card-text>
    </v-card>

    <v-progress-linear v-if="loading" indeterminate color="primary"></v-progress-linear>

    <ContactForm
      v-if="showForm"
      :contact="editingContact"
      @close="handleFormClose"
      @submit="handleFormSubmit"
    />

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h5"> Confirm Delete </v-card-title>

        <v-card-text>
          Are you sure you want to delete
          <strong>{{ contactToDelete?.name }}</strong
          >? This action cannot be undone.
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="cancelDelete"> Cancel </v-btn>
          <v-btn color="error" variant="flat" @click="confirmDelete"> Delete </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-table v-if="!showForm && displayedContacts.length > 0" class="contacts-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Phone</th>
          <th>Email</th>
          <th>Address</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="contact in displayedContacts" :key="contact.id">
          <td>{{ contact.name }}</td>
          <td>{{ contact.phone }}</td>
          <td>{{ contact.email || '-' }}</td>
          <td>{{ contact.address || '-' }}</td>
          <td>
            <v-btn size="small" variant="text" color="primary" @click="handleEditClick(contact)">
              Edit
            </v-btn>
            <v-btn size="small" variant="text" color="error" @click="handleDeleteClick(contact)">
              Delete
            </v-btn>
          </td>
        </tr>
      </tbody>
    </v-table>

    <v-empty-state
      v-if="!showForm && !loading && displayedContacts.length === 0 && searchQuery.trim()"
      headline="No results found"
      text="Try adjusting your search terms"
    ></v-empty-state>

    <v-empty-state
      v-if="!showForm && !loading && displayedContacts.length === 0 && !searchQuery.trim()"
      headline="No contacts yet"
      text="Add your first contact to get started"
    ></v-empty-state>
  </div>
</template>

<style scoped>
  .contact-list {
    padding: 20px;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .header h1 {
    margin: 0;
  }

  .search-card {
    margin-bottom: 20px;
  }

  .search-results-info {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 12px;
    color: rgba(var(--v-theme-info), 0.8);
    font-size: 0.875rem;
  }

  .contacts-table {
    margin-top: 20px;
  }
</style>
