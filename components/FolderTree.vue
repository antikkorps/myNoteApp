<template>
  <div class="p-3 flex flex-col gap-1">
    <!-- Search results mode -->
    <template v-if="searchQuery">
      <div class="flex items-center gap-2 px-2 py-1 mb-1">
        <span class="text-xs font-semibold text-gray-500 uppercase">Results</span>
        <span class="text-xs text-gray-400">{{ notes.length }}</span>
      </div>
      <div v-if="notes.length === 0" class="px-2 py-4 text-sm text-gray-400 text-center">
        No notes found
      </div>
      <div
        v-for="note in notes"
        :key="note.id"
        class="flex flex-col gap-0.5 px-2 py-1.5 text-sm rounded cursor-pointer transition-colors"
        :class="
          note.id === activeNoteId
            ? 'bg-gray-200 dark:bg-gray-800 font-medium'
            : 'hover:bg-gray-100 dark:hover:bg-gray-900'
        "
        @click="$emit('select-note', note.id)"
      >
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-file-text" class="size-4 shrink-0 text-gray-400" />
          <span class="truncate flex-1">{{ note.title || 'Untitled' }}</span>
        </div>
        <div class="flex items-center gap-2 ml-6">
          <span v-if="getFolderName(note.folderId)" class="text-xs text-gray-400 truncate">
            {{ getFolderName(note.folderId) }}
          </span>
          <span v-if="getSnippet(note)" class="text-xs text-gray-400 truncate">
            {{ getSnippet(note) }}
          </span>
        </div>
      </div>
    </template>

    <!-- Normal folder tree mode -->
    <template v-else>
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
            :set-data="setNoteDropData"
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
    </template>
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
  content: string
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
  searchQuery: string
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

function getFolderName(folderId: number | null): string | null {
  if (!folderId) return null
  const folder = props.folders.find((f) => f.id === folderId)
  return folder?.name ?? null
}

function getSnippet(note: NoteItem): string | null {
  const q = props.searchQuery.toLowerCase().trim()
  if (!q || !note.content) return null
  // Strip HTML tags for snippet extraction
  const text = note.content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
  const idx = text.toLowerCase().indexOf(q)
  if (idx === -1) return null
  const start = Math.max(0, idx - 30)
  const end = Math.min(text.length, idx + q.length + 50)
  let snippet = text.slice(start, end)
  if (start > 0) snippet = "..." + snippet
  if (end < text.length) snippet = snippet + "..."
  return snippet
}

function setNoteDropData(dataTransfer: DataTransfer, dragEl: HTMLElement) {
  const noteId = dragEl.dataset?.id
  if (!noteId) return
  const note = props.notes.find((n) => n.id === Number(noteId))
  if (note) {
    dataTransfer.setData("application/note-link", JSON.stringify({ id: note.id, title: note.title }))
  }
}
</script>
