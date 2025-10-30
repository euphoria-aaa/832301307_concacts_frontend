<script setup>
  import { ref, onMounted } from 'vue'
  import { contactService } from '../services/contactService'
  import ContactForm from './ContactForm.vue'

  const contacts = ref([])
  const loading = ref(false)
  const showForm = ref(false)
  const editingContact = ref(null)
  const showDeleteDialog = ref(false)
  const contactToDelete = ref(null)

  const loadContacts = async () => {
    loading.value = true
    try {
      const response = await contactService.getContacts()
      contacts.value = response.data || []
    } catch (err) {
      // Error handling is now done in the API interceptor
      console.error('Failed to load contacts:', err)
    } finally {
      loading.value = false
    }
  }

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

    <v-table v-if="!showForm && contacts.length > 0" class="contacts-table">
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
        <tr v-for="contact in contacts" :key="contact.id">
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
      v-if="!showForm && !loading && contacts.length === 0"
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

  .contacts-table {
    margin-top: 20px;
  }
</style>
