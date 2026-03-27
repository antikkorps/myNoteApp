const IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"]

export function useImageUpload() {
  const uploading = ref(false)

  function isImageFile(file: File): boolean {
    return IMAGE_TYPES.includes(file.type)
  }

  async function upload(file: File, noteId: number): Promise<{ id: number; url: string; filename: string; type: string }> {
    const type = isImageFile(file) ? "image" : "file"
    const formData = new FormData()
    formData.append("file", file)
    formData.append("noteId", String(noteId))
    formData.append("type", type)

    uploading.value = true
    try {
      return await $fetch("/api/uploads", { method: "POST", body: formData }) as any
    } finally {
      uploading.value = false
    }
  }

  return { upload, uploading, isImageFile }
}
