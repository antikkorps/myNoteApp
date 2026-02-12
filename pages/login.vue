<template>
  <UCard class="w-full max-w-md">
    <template #header>
      <h1 class="text-2xl font-bold text-center">Sign In</h1>
    </template>

    <form @submit.prevent="handleSignIn" class="space-y-4">
      <UInput v-model="email" type="email" placeholder="Email" required />
      <UInput v-model="password" type="password" placeholder="Password" required />
      <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
      <UButton type="submit" block :loading="loading">Sign In</UButton>
    </form>

    <template #footer>
      <p class="text-center text-sm">
        Don't have an account?
        <NuxtLink to="/signup" class="text-primary underline">Sign up</NuxtLink>
      </p>
    </template>
  </UCard>
</template>

<script setup lang="ts">
definePageMeta({ layout: "auth" })

const { signIn } = useAuth()
const email = ref("")
const password = ref("")
const error = ref("")
const loading = ref(false)

async function handleSignIn() {
  loading.value = true
  error.value = ""
  const { error: signInError } = await signIn.email({
    email: email.value,
    password: password.value,
  })
  if (signInError) {
    error.value = signInError.message || "An error occurred during sign in."
  } else {
    reloadNuxtApp({ path: "/" })
  }
  loading.value = false
}
</script>
