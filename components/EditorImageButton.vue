<template>
  <UButton
    size="xs"
    variant="ghost"
    color="neutral"
    icon="i-lucide-paperclip"
    :loading="uploading"
    @click="openFilePicker"
  >
    <UTooltip text="Insert file" />
  </UButton>

  <input
    ref="fileInput"
    type="file"
    accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml,application/pdf,text/plain,text/markdown,application/zip,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.openxmlformats-officedocument.presentationml.presentation"
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
const { upload, uploading, isImageFile } = useImageUpload()
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
    if (isImageFile(file)) {
      props.editor.chain().focus().setImage({ src: result.url, alt: result.filename }).run()
    } else {
      props.editor.chain().focus().insertContent({
        type: 'text',
        text: `📎 ${result.filename}`,
        marks: [{ type: 'link', attrs: { href: result.url, target: '_blank' } }],
      }).run()
    }
  } catch (err: any) {
    toast.add({ title: "Upload failed", description: err?.data?.statusMessage || "Could not upload file", color: "error" })
  }

  // Reset input so same file can be re-selected
  input.value = ""
}
</script>
