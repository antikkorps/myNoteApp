<script setup lang="ts">
import type { Editor } from "@tiptap/core"
import { registerNoteLinkSuggestion } from "~/utils/noteLinkSuggestion"

const props = defineProps<{
  editor: Editor
  notes: Array<{ id: number; title: string }>
  currentNoteId?: number
}>()

const emit = defineEmits<{
  "navigate-note": [id: number]
}>()

function setup(editor: Editor) {
  // registerNoteLinkSuggestion has its own duplicate guard (WeakSet)
  registerNoteLinkSuggestion(editor, () =>
    props.notes.filter((n) => n.id !== props.currentNoteId),
  )

  // Click on note:// links → navigate
  editor.view.dom.addEventListener("click", (event: MouseEvent) => {
    const target = event.target as HTMLElement
    const link = target.closest("a") as HTMLAnchorElement | null
    if (!link) return

    // Try DOM href first, then fall back to ProseMirror mark attrs
    let href = link.getAttribute("href") || ""
    if (!href.startsWith("note://")) {
      try {
        const pos = editor.view.posAtDOM(link, 0)
        const resolved = editor.state.doc.resolve(pos)
        const linkMark = resolved.marks().find((m) => m.type.name === "link")
        if (linkMark) href = linkMark.attrs.href || ""
      } catch {
        // posAtDOM can throw if the element is not in the editor
      }
    }

    if (!href.startsWith("note://")) return
    event.preventDefault()
    const id = parseInt(href.replace("note://", ""), 10)
    if (!isNaN(id)) emit("navigate-note", id)
  })
}

watch(
  () => props.editor,
  (editor) => {
    if (editor) setup(editor)
  },
  { immediate: true },
)
</script>

<template>
  <slot />
</template>
