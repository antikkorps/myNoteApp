<template>
  <UButton
    size="xs"
    variant="ghost"
    color="neutral"
    icon="i-lucide-table"
    @click="insertTable"
  >
    <UTooltip text="Insert table" />
  </UButton>
</template>

<script setup lang="ts">
import type { Editor } from "@tiptap/vue-3"

const props = defineProps<{
  editor: Editor
}>()

function insertTable() {
  props.editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
}
</script>
