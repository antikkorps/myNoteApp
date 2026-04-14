import type { UploadResponse } from "~/types"

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"]

export function useImageUpload() {
  const uploading = ref(false)

  function isImageFile(file: File): boolean {
    return IMAGE_TYPES.includes(file.type)
  }

  async function upload(file: File, noteId: number): Promise<UploadResponse> {
    const type = isImageFile(file) ? "image" : "file"
    const formData = new FormData()
    formData.append("file", file)
    formData.append("noteId", String(noteId))
    formData.append("type", type)

    uploading.value = true
    try {
      return await $fetch<UploadResponse>("/api/uploads", { method: "POST", body: formData })
    } finally {
      uploading.value = false
    }
  }

  return { upload, uploading, isImageFile }
}
