import { describe, it, expect, vi } from "vitest"
import { useImageUpload } from "~/composables/useImageUpload"

describe("useImageUpload", () => {
  describe("isImageFile", () => {
    it("returns true for image types", () => {
      const { isImageFile } = useImageUpload()

      const imageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"]
      for (const type of imageTypes) {
        const file = new File([""], "test", { type })
        expect(isImageFile(file)).toBe(true)
      }
    })

    it("returns false for non-image types", () => {
      const { isImageFile } = useImageUpload()

      const nonImageTypes = ["application/pdf", "text/plain", "video/mp4"]
      for (const type of nonImageTypes) {
        const file = new File([""], "test", { type })
        expect(isImageFile(file)).toBe(false)
      }
    })
  })

  describe("upload", () => {
    it("sets uploading to true during upload and false after", async () => {
      const { upload, uploading } = useImageUpload()

      const mockResponse = { id: 1, url: "/api/uploads/1", filename: "test.png", type: "image" }
      const fetchMock = vi.fn().mockResolvedValue(mockResponse)
      vi.stubGlobal("$fetch", fetchMock)

      expect(uploading.value).toBe(false)
      const promise = upload(new File(["data"], "test.png", { type: "image/png" }), 1)
      expect(uploading.value).toBe(true)

      await promise
      expect(uploading.value).toBe(false)

      vi.unstubAllGlobals()
    })

    it("sends correct form data for image files", async () => {
      const { upload } = useImageUpload()

      const mockResponse = { id: 1, url: "/api/uploads/1", filename: "photo.jpg", type: "image" }
      const fetchMock = vi.fn().mockResolvedValue(mockResponse)
      vi.stubGlobal("$fetch", fetchMock)

      const file = new File(["data"], "photo.jpg", { type: "image/jpeg" })
      await upload(file, 42)

      expect(fetchMock).toHaveBeenCalledWith("/api/uploads", {
        method: "POST",
        body: expect.any(FormData),
      })

      const formData = fetchMock.mock.calls[0][1].body as FormData
      expect(formData.get("type")).toBe("image")
      expect(formData.get("noteId")).toBe("42")

      vi.unstubAllGlobals()
    })

    it("sends type 'file' for non-image files", async () => {
      const { upload } = useImageUpload()

      const mockResponse = { id: 1, url: "/api/uploads/1", filename: "doc.pdf", type: "file" }
      const fetchMock = vi.fn().mockResolvedValue(mockResponse)
      vi.stubGlobal("$fetch", fetchMock)

      const file = new File(["data"], "doc.pdf", { type: "application/pdf" })
      await upload(file, 1)

      const formData = fetchMock.mock.calls[0][1].body as FormData
      expect(formData.get("type")).toBe("file")

      vi.unstubAllGlobals()
    })

    it("resets uploading on error", async () => {
      const { upload, uploading } = useImageUpload()

      vi.stubGlobal("$fetch", vi.fn().mockRejectedValue(new Error("Network error")))

      expect(uploading.value).toBe(false)
      await expect(upload(new File([""], "test.png", { type: "image/png" }), 1)).rejects.toThrow("Network error")
      expect(uploading.value).toBe(false)

      vi.unstubAllGlobals()
    })
  })
})
