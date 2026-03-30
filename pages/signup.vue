<template>
  <div class="space-y-6">
    <UCard>
      <div class="text-center mb-4">
        <h2 class="text-xl font-semibold">Create your account</h2>
        <p class="text-sm text-gray-400 mt-1">Start organizing your notes</p>
      </div>

      <form @submit.prevent="handleSignUp" class="space-y-4">
        <UFormField label="Name">
          <UInput
            v-model="name"
            placeholder="Your name"
            icon="i-lucide-user"
            size="lg"
            required
            class="w-full"
          />
        </UFormField>

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
            placeholder="Min. 8 characters"
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

        <UButton type="submit" block size="lg" :loading="loading"> Create account </UButton>
      </form>

      <template #footer>
        <p class="text-center text-sm text-gray-400">
          Already have an account?
          <NuxtLink to="/login" class="text-primary font-medium hover:underline">Sign in</NuxtLink>
        </p>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "auth" })

const { signUp } = useAuth()
const name = ref("")
const email = ref("")
const password = ref("")
const error = ref("")
const loading = ref(false)
const showPassword = ref(false)

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
