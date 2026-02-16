<template>
  <aside
    class="w-64 shrink-0 border-r border-gray-200 dark:border-gray-800 h-full flex flex-col bg-white dark:bg-gray-900 max-md:absolute max-md:z-10 max-md:w-full max-md:border-r-0"
  >
    <div class="p-3">
      <UButton block @click="$emit('create')"> New Note </UButton>
    </div>

    <div class="flex-1 overflow-y-auto">
      <FolderTree
        :folders="folders"
        :active-folder-id="activeFolderId"
        :notes="notes"
        :active-note-id="activeNoteId"
        :active-tag="activeTag"
        :show-all-notes="showAllNotes"
        @select="$emit('select-folder', $event)"
        @select-note="$emit('select', $event)"
        @move-note="$emit('move-note', $event)"
        @show-library="$emit('show-library')"
        @refresh="$emit('refresh-folders')"
      />
    </div>

    <TagCloud
      class="border-t border-gray-200 dark:border-gray-800 pt-3"
      :notes="notes"
      :active-tag="activeTag"
      @select="$emit('filter-tag', $event)"
    />
  </aside>
</template>

<script setup lang="ts">
defineProps<{
  notes: Array<{ id: number; title: string; tags: string | null; folderId: number | null }>
  activeNoteId: number | null
  activeTag: string | null
  folders: Array<{ id: number; name: string; parentId: number | null }>
  activeFolderId: number | null
  showAllNotes: boolean
}>()

defineEmits<{
  create: []
  select: [id: number]
  "filter-tag": [tag: string | null]
  "select-folder": [id: number | null]
  "move-note": [payload: { noteId: number; folderId: number | null }]
  "show-library": []
  "refresh-folders": []
}>()
</script>
