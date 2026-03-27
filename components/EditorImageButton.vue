<template>
  <UButton
    size="xs"
    variant="ghost"
    color="neutral"
    icon="i-lucide-image-plus"
    :loading="uploading"
    @click="openFilePicker"
  >
    <UTooltip text="Insert image" />
  </UButton>

  <input
    ref="fileInput"
    type="file"
    accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
    class="hidden"
    @change="onFileSelected"
  />
</template>

<script setup lang="ts">
import type { Editor } from "@tiptap/vue-3"

const props = defineProps<{
  editor: Editor
  noteId: number
}>()

const toast = useToast()
const { upload, uploading } = useImageUpload()
const fileInput = ref<HTMLInputElement | null>(null)

function openFilePicker() {
  fileInput.value?.click()
}

async function onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  try {
    const result = await upload(file, props.noteId)
    props.editor.chain().focus().setImage({ src: result.url, alt: result.filename }).run()
  } catch (err: any) {
    toast.add({ title: "Upload failed", description: err?.data?.statusMessage || "Could not upload image", color: "error" })
  }

  // Reset input so same file can be re-selected
  input.value = ""
}
</script>
