<template>
  <div class="h-full overflow-y-auto p-6 space-y-6 max-w-4xl mx-auto">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Administration</h1>
      <UButton variant="ghost" icon="i-lucide-arrow-left" to="/">Retour</UButton>
    </div>

    <!-- Default quota -->
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-hard-drive" class="text-lg" />
          <h2 class="text-lg font-semibold">Quota par défaut</h2>
        </div>
      </template>

      <form @submit.prevent="saveDefaultQuota" class="flex items-end gap-3">
        <UFormField label="Espace max (MB)">
          <UInput
            v-model.number="defaultQuotaMB"
            type="number"
            :min="1"
            size="lg"
            class="w-40"
          />
        </UFormField>
        <UButton type="submit" :loading="savingDefault">Enregistrer</UButton>
      </form>

      <p class="text-sm text-gray-500 mt-2">
        Appliqué à tous les utilisateurs sans quota spécifique.
      </p>
    </UCard>

    <!-- Storage usage per user -->
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-bar-chart-3" class="text-lg" />
          <h2 class="text-lg font-semibold">Utilisation par utilisateur</h2>
        </div>
      </template>

      <div v-if="!usageData" class="text-gray-500 text-sm">Chargement...</div>
      <div v-else-if="usageData.length === 0" class="text-gray-500 text-sm">Aucun fichier uploadé.</div>
      <div v-else class="space-y-4">
        <div
          v-for="user in usageData"
          :key="user.userId"
          class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-2"
        >
          <div class="flex items-center justify-between">
            <div>
              <span class="font-medium">{{ user.userName }}</span>
              <span class="text-sm text-gray-500 ml-2">{{ user.userEmail }}</span>
            </div>
            <div class="text-sm text-gray-500">
              {{ formatMB(user.usedBytes) }} / {{ formatMB(user.quotaBytes) }}
            </div>
          </div>

          <!-- Progress bar -->
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              class="h-2 rounded-full transition-all"
              :class="usagePercent(user) > 90 ? 'bg-red-500' : usagePercent(user) > 70 ? 'bg-yellow-500' : 'bg-primary'"
              :style="{ width: Math.min(usagePercent(user), 100) + '%' }"
            />
          </div>

          <!-- User-specific quota override -->
          <div class="flex items-center gap-2 mt-2">
            <UInput
              v-model.number="userQuotaInputs[user.userId]"
              type="number"
              :min="1"
              placeholder="Quota (MB)"
              size="sm"
              class="w-32"
            />
            <UButton
              size="sm"
              :loading="savingUser === user.userId"
              @click="saveUserQuota(user.userId)"
            >
              Appliquer
            </UButton>
            <UButton
              v-if="hasOverride(user.userId)"
              size="sm"
              variant="ghost"
              color="error"
              icon="i-lucide-x"
              :loading="deletingUser === user.userId"
              @click="deleteUserQuota(user.userId)"
            >
              Reset
            </UButton>
            <span v-if="hasOverride(user.userId)" class="text-xs text-yellow-600 dark:text-yellow-400">
              Quota personnalisé
            </span>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
interface UsageEntry {
  userId: string
  userName: string
  userEmail: string
  usedBytes: number
  quotaBytes: number
}

interface QuotaEntry {
  id: number
  userId: string
  maxBytes: number
}

definePageMeta({ middleware: "admin" })

const toast = useToast()

// Fetch data
const { data: quotaData, refresh: refreshQuotas } = await useFetch<{
  defaultQuotaBytes: number
  userQuotas: QuotaEntry[]
}>("/api/admin/quotas")

const { data: usageData, refresh: refreshUsage } = await useFetch<UsageEntry[]>(
  "/api/admin/quotas/usage",
)

// Default quota
const defaultQuotaMB = ref(100)
const savingDefault = ref(false)

watch(quotaData, (data) => {
  if (data?.defaultQuotaBytes) {
    defaultQuotaMB.value = Math.round(data.defaultQuotaBytes / (1024 * 1024))
  }
}, { immediate: true })

async function saveDefaultQuota() {
  savingDefault.value = true
  try {
    await $fetch("/api/admin/quotas/default", {
      method: "PUT",
      body: { maxBytes: defaultQuotaMB.value * 1024 * 1024 },
    })
    toast.add({ title: "Quota par défaut mis à jour", color: "success" })
    await Promise.all([refreshQuotas(), refreshUsage()])
  } catch {
    toast.add({ title: "Erreur lors de la sauvegarde", color: "error" })
  }
  savingDefault.value = false
}

// User-specific quotas
const userQuotaInputs = ref<Record<string, number>>({})
const savingUser = ref<string | null>(null)
const deletingUser = ref<string | null>(null)

watch(usageData, (data) => {
  if (!data) return
  for (const user of data) {
    if (!(user.userId in userQuotaInputs.value)) {
      userQuotaInputs.value[user.userId] = Math.round(user.quotaBytes / (1024 * 1024))
    }
  }
}, { immediate: true })

function hasOverride(userId: string): boolean {
  return quotaData.value?.userQuotas.some((q) => q.userId === userId) ?? false
}

async function saveUserQuota(userId: string) {
  const mb = userQuotaInputs.value[userId]
  if (!mb || mb < 1) return
  savingUser.value = userId
  try {
    await $fetch(`/api/admin/quotas/${userId}`, {
      method: "PUT",
      body: { maxBytes: mb * 1024 * 1024 },
    })
    toast.add({ title: "Quota utilisateur mis à jour", color: "success" })
    await Promise.all([refreshQuotas(), refreshUsage()])
  } catch {
    toast.add({ title: "Erreur lors de la sauvegarde", color: "error" })
  }
  savingUser.value = null
}

async function deleteUserQuota(userId: string) {
  deletingUser.value = userId
  try {
    await $fetch(`/api/admin/quotas/${userId}`, { method: "DELETE" })
    toast.add({ title: "Quota personnalisé supprimé", color: "success" })
    await Promise.all([refreshQuotas(), refreshUsage()])
  } catch {
    toast.add({ title: "Erreur lors de la suppression", color: "error" })
  }
  deletingUser.value = null
}

// Helpers
function formatMB(bytes: number): string {
  const mb = bytes / (1024 * 1024)
  return mb >= 1024 ? `${(mb / 1024).toFixed(1)} GB` : `${Math.round(mb)} MB`
}

function usagePercent(user: UsageEntry): number {
  return user.quotaBytes > 0 ? (user.usedBytes / user.quotaBytes) * 100 : 0
}
</script>
