<template>
  <UDropdownMenu :items="menuItems" :content="{ align: 'start' }">
    <UButton
      size="xs"
      variant="ghost"
      color="neutral"
      icon="i-lucide-table"
    >
      <UTooltip text="Table" />
    </UButton>
  </UDropdownMenu>
</template>

<script setup lang="ts">
import type { Editor } from "@tiptap/vue-3"

const props = defineProps<{
  editor: Editor
}>()

const inTable = computed(() => props.editor.isActive("table"))

const menuItems = computed(() => [
  [
    {
      label: "Insert table",
      icon: "i-lucide-table",
      onSelect: () => {
        props.editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
      },
    },
  ],
  [
    {
      label: "Add row above",
      icon: "i-lucide-arrow-up",
      disabled: !inTable.value,
      onSelect: () => props.editor.chain().focus().addRowBefore().run(),
    },
    {
      label: "Add row below",
      icon: "i-lucide-arrow-down",
      disabled: !inTable.value,
      onSelect: () => props.editor.chain().focus().addRowAfter().run(),
    },
    {
      label: "Add column left",
      icon: "i-lucide-arrow-left",
      disabled: !inTable.value,
      onSelect: () => props.editor.chain().focus().addColumnBefore().run(),
    },
    {
      label: "Add column right",
      icon: "i-lucide-arrow-right",
      disabled: !inTable.value,
      onSelect: () => props.editor.chain().focus().addColumnAfter().run(),
    },
  ],
  [
    {
      label: "Toggle header row",
      icon: "i-lucide-heading",
      disabled: !inTable.value,
      onSelect: () => props.editor.chain().focus().toggleHeaderRow().run(),
    },
    {
      label: "Merge cells",
      icon: "i-lucide-merge",
      disabled: !inTable.value,
      onSelect: () => props.editor.chain().focus().mergeCells().run(),
    },
    {
      label: "Split cell",
      icon: "i-lucide-split",
      disabled: !inTable.value,
      onSelect: () => props.editor.chain().focus().splitCell().run(),
    },
  ],
  [
    {
      label: "Delete row",
      icon: "i-lucide-minus",
      disabled: !inTable.value,
      onSelect: () => props.editor.chain().focus().deleteRow().run(),
    },
    {
      label: "Delete column",
      icon: "i-lucide-minus",
      disabled: !inTable.value,
      onSelect: () => props.editor.chain().focus().deleteColumn().run(),
    },
    {
      label: "Delete table",
      icon: "i-lucide-trash",
      disabled: !inTable.value,
      onSelect: () => props.editor.chain().focus().deleteTable().run(),
    },
  ],
])
</script>
