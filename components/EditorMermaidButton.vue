<template>
  <UButton
    size="xs"
    variant="ghost"
    color="neutral"
    icon="i-lucide-workflow"
    @click="insertDiagram"
  >
    <UTooltip text="Insert diagram (Mermaid)" />
  </UButton>
</template>

<script setup lang="ts">
import type { Editor } from "@tiptap/vue-3"

const props = defineProps<{
  editor: Editor
}>()

function insertDiagram() {
  ;(props.editor.commands as any).insertMermaidBlock()
}
</script>
