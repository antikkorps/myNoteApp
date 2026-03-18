<template>
  <aside
    class="w-64 shrink-0 border-r border-gray-200 dark:border-gray-800 h-full flex flex-col bg-white dark:bg-gray-900 max-md:absolute max-md:z-10 max-md:w-full max-md:border-r-0"
  >
    <div class="p-3 space-y-2">
      <UButton block @click="$emit('create')"> New Note </UButton>
      <div class="relative">
        <UIcon name="i-lucide-search" class="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
        <input
          ref="searchInputRef"
          :value="searchQuery"
          type="text"
          placeholder="Search notes..."
          class="w-full pl-8 pr-8 py-1.5 text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-primary-500"
          @input="$emit('search', ($event.target as HTMLInputElement).value)"
          @keydown.escape="$emit('search', '')"
        >
        <button
          v-if="searchQuery"
          class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          @click="$emit('search', '')"
        >
          <UIcon name="i-lucide-x" class="size-4" />
        </button>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto">
      <FolderTree
        :folders="folders"
        :active-folder-id="activeFolderId"
        :notes="notes"
        :active-note-id="activeNoteId"
        :active-tag="activeTag"
        :show-all-notes="showAllNotes"
        :search-query="searchQuery"
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

    <button
      class="flex items-center gap-2 px-4 py-3 text-sm border-t border-gray-200 dark:border-gray-800 transition-colors"
      :class="showTrash
        ? 'text-primary-500 bg-gray-50 dark:bg-gray-800'
        : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'"
      @click="$emit('show-trash')"
    >
      <UIcon name="i-lucide-trash-2" class="size-4" />
      <span>Trash</span>
      <UBadge v-if="trashCount > 0" color="neutral" variant="subtle" size="xs" class="ml-auto">
        {{ trashCount }}
      </UBadge>
    </button>
  </aside>
</template>

<script setup lang="ts">
const searchInputRef = ref<HTMLInputElement>()

defineProps<{
  notes: Array<{ id: number; title: string; content: string; tags: string | null; folderId: number | null }>
  activeNoteId: number | null
  activeTag: string | null
  folders: Array<{ id: number; name: string; parentId: number | null }>
  activeFolderId: number | null
  showAllNotes: boolean
  showTrash: boolean
  trashCount: number
  searchQuery: string
}>()

defineEmits<{
  create: []
  select: [id: number]
  "filter-tag": [tag: string | null]
  "select-folder": [id: number | null]
  "move-note": [payload: { noteId: number; folderId: number | null }]
  "show-library": []
  "refresh-folders": []
  "show-trash": []
  search: [query: string]
}>()
</script>
