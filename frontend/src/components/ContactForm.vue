<script setup>
  import { ref, watch } from 'vue'
  import { contactService } from '../services/contactService'

  const props = defineProps({
    contact: {
      type: Object,
      default: null,
    },
  })

  const emit = defineEmits(['close', 'submit'])

  const form = ref({
    name: '',
    phone: '',
    email: '',
    address: '',
  })

  const loading = ref(false)
  const isEditing = ref(false)
  const validationErrors = ref({})

  watch(
    () => props.contact,
    newContact => {
      if (newContact) {
        form.value = {
          name: newContact.name || '',
          phone: newContact.phone || '',
          email: newContact.email || '',
          address: newContact.address || '',
        }
        isEditing.value = true
      } else {
        form.value = {
          name: '',
          phone: '',
          email: '',
          address: '',
        }
        isEditing.value = false
      }
      // Clear validation errors when contact changes
      validationErrors.value = {}
    },
    { immediate: true }
  )

  const handleSubmit = async () => {
    // Clear previous validation errors
    validationErrors.value = {}

    // Validate fields
    if (!form.value.name.trim()) {
      validationErrors.value.name = 'Name is required'
      return
    }

    if (!form.value.phone.trim()) {
      validationErrors.value.phone = 'Phone is required'
      return
    }

    loading.value = true

    try {
      if (isEditing.value) {
        await contactService.updateContact(props.contact.id, form.value)
      } else {
        await contactService.createContact(form.value)
      }
      emit('submit')
    } catch (err) {
      // Error handling is now done in the API interceptor
      console.error('Failed to save contact:', err)
    } finally {
      loading.value = false
    }
  }

  const handleCancel = () => {
    emit('close')
  }
</script>

<template>
  <v-card class="contact-form">
    <v-card-title>
      {{ isEditing ? 'Edit Contact' : 'Add New Contact' }}
    </v-card-title>

    <v-card-text>
      <v-form @submit.prevent="handleSubmit">
        <v-text-field
          v-model="form.name"
          label="Name"
          placeholder="Enter contact name"
          required
          :disabled="loading"
          :error-messages="validationErrors.name"
        ></v-text-field>

        <v-text-field
          v-model="form.phone"
          label="Phone"
          placeholder="Enter phone number"
          required
          :disabled="loading"
          :error-messages="validationErrors.phone"
        ></v-text-field>

        <v-text-field
          v-model="form.email"
          label="Email"
          type="email"
          placeholder="Enter email address"
          :disabled="loading"
        ></v-text-field>

        <v-text-field
          v-model="form.address"
          label="Address"
          placeholder="Enter address"
          :disabled="loading"
        ></v-text-field>

        <div class="form-actions">
          <v-btn type="submit" color="primary" :loading="loading">
            {{ isEditing ? 'Update' : 'Create' }}
          </v-btn>
          <v-btn variant="outlined" @click="handleCancel" :disabled="loading"> Cancel </v-btn>
        </div>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<style scoped>
  .contact-form {
    margin-bottom: 20px;
  }

  .form-actions {
    display: flex;
    gap: 10px;
    margin-top: 20px;
  }
</style>
