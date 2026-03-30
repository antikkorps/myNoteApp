<template>
  <div class="space-y-6">
    <UCard>
      <div class="text-center mb-4">
        <h2 class="text-xl font-semibold">Welcome back</h2>
        <p class="text-sm text-gray-400 mt-1">Sign in to your account</p>
      </div>

      <form @submit.prevent="handleSignIn" class="space-y-4">
        <UFormField label="Email">
          <UInput
            v-model="email"
            type="email"
            placeholder="you@example.com"
            icon="i-lucide-mail"
            size="lg"
            required
            class="w-full"
          />
        </UFormField>

        <UFormField label="Password">
          <UInput
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Enter your password"
            icon="i-lucide-lock"
            size="lg"
            required
            :ui="{ trailing: 'pr-10' }"
            class="w-full"
          >
            <template #trailing>
              <UButton
                :icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                variant="ghost"
                color="neutral"
                size="xs"
                :padded="false"
                @click="showPassword = !showPassword"
              />
            </template>
          </UInput>
        </UFormField>

        <p v-if="error" class="text-red-500 text-sm text-center">{{ error }}</p>

        <UButton type="submit" block size="lg" :loading="loading"> Sign in </UButton>
      </form>

      <template #footer>
        <p class="text-center text-sm text-gray-400">
          Don't have an account?
          <NuxtLink to="/signup" class="text-primary font-medium hover:underline">Sign up</NuxtLink>
        </p>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "auth" })

const { signIn } = useAuth()
const email = ref("")
const password = ref("")
const error = ref("")
const loading = ref(false)
const showPassword = ref(false)

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
