<template>
  <UCollapsible v-if="attachments.length" class="border-t border-gray-200 dark:border-gray-800">
    <UButton
      variant="ghost"
      color="neutral"
      size="xs"
      block
      class="justify-between rounded-none"
      @click="open = !open"
    >
      <span>Attachments ({{ attachments.length }})</span>
      <UIcon :name="open ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'" />
    </UButton>

    <template v-if="open">
      <div class="max-h-40 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
        <div
          v-for="file in attachments"
          :key="file.id"
          class="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-gray-900 group"
        >
          <UIcon :name="fileIcon(file.mimeType)" class="shrink-0 text-gray-400" />
          <a
            :href="file.url"
            target="_blank"
            class="flex-1 truncate cursor-pointer hover:underline"
          >
            {{ file.filename }}
          </a>
          <span class="text-xs text-gray-400 shrink-0">{{ formatSize(file.size) }}</span>
          <UButton
            size="xs"
            variant="ghost"
            color="error"
            icon="i-lucide-trash-2"
            class="opacity-0 group-hover:opacity-100 transition-opacity"
            @click="onDelete(file)"
          />
        </div>
      </div>
    </template>
  </UCollapsible>
</template>

<script setup lang="ts">
const props = defineProps<{
  noteId: number
}>()

const toast = useToast()
const open = ref(false)

const { data: attachments, refresh } = useFetch<Array<{
  id: number
  filename: string
  mimeType: string
  size: number
  type: string
  url: string
}>>(() => `/api/uploads/note/${props.noteId}`, {
  default: () => [],
})

watch(() => props.noteId, () => refresh())

defineExpose({ refresh })

async function onDelete(file: { id: number; filename: string }) {
  try {
    await $fetch(`/api/uploads/${file.id}`, { method: 'DELETE' })
    toast.add({ title: `${file.filename} deleted`, color: 'success' })
    refresh()
  } catch {
    toast.add({ title: 'Delete failed', color: 'error' })
  }
}

const VIEWABLE_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  'application/pdf', 'text/plain', 'text/markdown',
])

function isViewable(mimeType: string): boolean {
  return VIEWABLE_TYPES.has(mimeType)
}

function fileIcon(mime: string): string {
  if (mime.startsWith('image/')) return 'i-lucide-image'
  if (mime === 'application/pdf') return 'i-lucide-file-text'
  if (mime.startsWith('text/')) return 'i-lucide-file-type'
  if (mime.includes('spreadsheet') || mime.includes('excel')) return 'i-lucide-file-spreadsheet'
  if (mime.includes('presentation') || mime.includes('powerpoint')) return 'i-lucide-file-presentation' // fallback below
  return 'i-lucide-file'
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
</script>
