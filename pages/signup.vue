<template>
  <UCard class="w-full max-w-md">
    <template #header>
      <h1 class="text-2xl font-bold text-center">Create Account</h1>
    </template>

    <form @submit.prevent="handleSignUp" class="space-y-4">
      <UInput v-model="name" placeholder="Name" required />
      <UInput v-model="email" type="email" placeholder="Email" required />
      <UInput
        v-model="password"
        type="password"
        placeholder="Password (min 8
  chars)"
        required
      />
      <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
      <UButton type="submit" block :loading="loading">Create Account</UButton>
    </form>

    <template #footer>
      <p class="text-center text-sm">
        Already have an account?
        <NuxtLink to="/login" class="text-primary underline">Sign in</NuxtLink>
      </p>
    </template>
  </UCard>
</template>

<script setup lang="ts">
definePageMeta({ layout: "auth" })

const { signUp } = useAuth()
const name = ref("")
const email = ref("")
const password = ref("")
const error = ref("")
const loading = ref(false)

async function handleSignUp() {
  loading.value = true
  error.value = ""
  const { error: signUpError } = await signUp.email({
    name: name.value,
    email: email.value,
    password: password.value,
  })
  if (signUpError) {
    error.value = signUpError.message || "Sign up failed"
  } else {
    reloadNuxtApp({ path: "/" })
  }
  loading.value = false
}
</script>
