<script setup>
  import { onMounted } from 'vue'
  import ContactList from './components/ContactList.vue'
  import { useNotification } from './composables/useNotification'

  const { show, color, message, timeout, close } = useNotification()

  onMounted(() => {
    // Accessibility: close notification on Escape key
    const handleEscape = e => {
      if (e.key === 'Escape') {
        close()
      }
    }
    document.addEventListener('keydown', handleEscape)
  })
</script>

<template>
  <v-app>
    <v-main>
      <ContactList />
    </v-main>

    <!-- Global Notification Snackbar -->
    <v-snackbar
      v-model="show"
      :color="color"
      :timeout="timeout"
      location="top"
      :multi-line="message.length > 50"
    >
      {{ message }}

      <template v-slot:actions>
        <v-btn variant="text" @click="close"> Close </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<style scoped></style>
