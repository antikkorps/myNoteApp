<template>
  <div class="p-3 flex flex-col gap-1">
    <div class="flex items-center justify-between mb-1">
      <span class="text-xs font-semibold text-gray-500 uppercase">Folders</span>
      <UButton
        icon="i-heroicons-plus"
        size="xs"
        square
        variant="ghost"
        @click="createFolder(null)"
      />
    </div>

    <!-- All Notes -->
    <div
      class="flex items-center gap-2 px-2 py-1 text-sm rounded cursor-pointer transition-colors"
      :class="
        activeFolderId === null && !showAllNotes
          ? 'hover:bg-gray-100 dark:hover:bg-gray-900'
          : showAllNotes
            ? 'bg-gray-200 dark:bg-gray-800 font-medium'
            : 'hover:bg-gray-100 dark:hover:bg-gray-900'
      "
      @click="$emit('show-library')"
    >
      <UIcon name="i-lucide-library" class="size-4 shrink-0" />
      <span class="flex-1">All Notes</span>
      <span class="text-xs text-gray-400">{{ notes.length }}</span>
    </div>

    <USeparator />

    <!-- Arborescence récursive des dossiers -->
    <FolderTreeNode
      v-for="folder in rootFolders"
      :key="folder.id"
      :folder="folder"
      :all-folders="folders"
      :active-folder-id="activeFolderId"
      :notes="filteredNotes"
      :active-note-id="activeNoteId"
      @select="$emit('select', $event)"
      @select-note="$emit('select-note', $event)"
      @move-note="$emit('move-note', $event)"
      @create="createFolder"
      @rename="renameFolder"
      @delete="deleteFolder"
    />

    <USeparator />

    <!-- Unfiled notes -->
    <div class="ml-2">
      <div class="flex items-center gap-2 px-2 py-1 text-sm text-gray-500">
        <UIcon name="i-lucide-inbox" class="size-4 shrink-0" />
        <span class="flex-1">Unfiled</span>
        <span class="text-xs text-gray-400">{{ unfiledNotes.length }}</span>
      </div>
      <div
        class="ml-2 rounded transition-colors duration-150"
        :class="isUnfiledDragOver ? 'bg-primary/10 ring-1 ring-primary/30' : ''"
        @dragenter.prevent="onUnfiledDragEnter"
        @dragleave.prevent="onUnfiledDragLeave"
        @dragover.prevent
        @drop="isUnfiledDragOver = false"
      >
        <VueDraggable
          v-model="draggableUnfiled"
          group="notes"
          :animation="150"
          ghost-class="opacity-30"
          @add="onUnfiledNoteAdded"
        >
          <SidebarNoteItem
            v-for="note in draggableUnfiled"
            :key="note.id"
            :data-id="note.id"
            :note="note"
            :active="note.id === activeNoteId"
            @select="$emit('select-note', $event)"
          />
        </VueDraggable>
        <div
          v-if="unfiledNotes.length > unfiledDisplayedCount"
          class="px-2 py-1 text-xs text-primary cursor-pointer hover:underline"
          @click="unfiledDisplayedCount += 5"
        >
          Show more... ({{ unfiledNotes.length - unfiledDisplayedCount }} remaining)
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { VueDraggable } from "vue-draggable-plus"

interface Folder {
  id: number
  name: string
  parentId: number | null
}

interface NoteItem {
  id: number
  title: string
  tags: string | null
  folderId: number | null
}

const props = defineProps<{
  folders: Folder[]
  activeFolderId: number | null
  notes: NoteItem[]
  activeNoteId: number | null
  activeTag: string | null
  showAllNotes: boolean
}>()

const emit = defineEmits<{
  select: [id: number | null]
  "select-note": [id: number]
  "move-note": [payload: { noteId: number; folderId: number | null }]
  "show-library": []
  refresh: []
}>()

const unfiledDisplayedCount = ref(5)
const isUnfiledDragOver = ref(false)
let unfiledDragEnterCount = 0

const rootFolders = computed(() =>
  props.folders.filter((f) => f.parentId === null),
)

const filteredNotes = computed(() => {
  if (!props.activeTag) return props.notes
  return props.notes.filter((n) => parseTags(n.tags).includes(props.activeTag!))
})

const unfiledNotes = computed(() =>
  filteredNotes.value.filter((n) => n.folderId === null),
)

const draggableUnfiled = ref<NoteItem[]>([])

watchEffect(() => {
  draggableUnfiled.value = unfiledNotes.value.slice(0, unfiledDisplayedCount.value)
})

function onUnfiledDragEnter() {
  unfiledDragEnterCount++
  isUnfiledDragOver.value = true
}

function onUnfiledDragLeave() {
  unfiledDragEnterCount--
  if (unfiledDragEnterCount <= 0) {
    isUnfiledDragOver.value = false
    unfiledDragEnterCount = 0
  }
}

function onUnfiledNoteAdded(evt: { item: HTMLElement }) {
  isUnfiledDragOver.value = false
  unfiledDragEnterCount = 0
  const noteIdStr = evt.item.dataset?.id
  if (!noteIdStr) return
  emit("move-note", { noteId: Number(noteIdStr), folderId: null })
}

async function createFolder(parentId: number | null) {
  await $fetch("/api/folders", {
    method: "POST",
    body: { name: "New Folder", parentId },
  })
  emit("refresh")
}

async function renameFolder(id: number, name: string) {
  await $fetch(`/api/folders/${id}`, {
    method: "PUT",
    body: { name },
  })
  emit("refresh")
}

async function deleteFolder(id: number) {
  await $fetch(`/api/folders/${id}`, { method: "DELETE" })
  emit("refresh")
}
</script>
