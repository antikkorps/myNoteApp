import type { Editor } from "@tiptap/vue-3"
import type { Ref } from "vue"
import type { Note } from "~/types"

export function useEditorFileUpload(
  note: Ref<Note | null>,
  editorRef: Ref<any>,
  onUploaded: () => void,
) {
  const toast = useToast()
  const { upload, isImageFile } = useImageUpload()

  async function handleFileUpload(file: File, editor: Editor) {
    if (!note.value) return false

    try {
      const result = await upload(file, note.value.id)
      if (isImageFile(file)) {
        editor.chain().focus().setImage({ src: result.url, alt: result.filename }).run()
      } else {
        editor.chain().focus().insertContent({
          type: "text",
          text: `📎 ${result.filename}`,
          marks: [{ type: "link", attrs: { href: result.url, target: "_blank" } }],
        }).run()
      }
    } catch (err: any) {
      toast.add({
        title: "Upload failed",
        description: err?.data?.statusMessage || "Could not upload file",
        color: "error",
      })
    }
    onUploaded()
    return true
  }

  const editorProps = {
    handlePaste(_view: any, event: ClipboardEvent) {
      const file = Array.from(event.clipboardData?.files || [])[0]
      if (!file || !editorRef.value) return false
      handleFileUpload(file, editorRef.value as unknown as Editor)
      return true
    },
    handleDrop(_view: any, event: DragEvent, _slice: any, moved: boolean) {
      if (moved) return false
      const file = Array.from(event.dataTransfer?.files || [])[0]
      if (!file || !editorRef.value) return false
      handleFileUpload(file, editorRef.value as unknown as Editor)
      return true
    },
  }

  return { editorProps, handleFileUpload }
}
