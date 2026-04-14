<template>
  <div class="ml-2">
    <div
      class="flex items-center gap-1 px-2 py-1 text-sm rounded cursor-pointer group transition-colors"
      :class="
        folder.id === activeFolderId
          ? 'bg-gray-200 dark:bg-gray-800 font-medium'
          : 'hover:bg-gray-100 dark:hover:bg-gray-900'
      "
      @click="$emit('select', folder.id)"
    >
      <UIcon
        :name="isOpen ? 'i-lucide-chevron-down' : 'i-lucide-chevron-right'"
        class="size-3 shrink-0 cursor-pointer"
        v-if="children.length || folderNotes.length"
        @click.stop="isOpen = !isOpen"
      />
      <span v-else class="size-3 shrink-0" />

      <UIcon name="i-lucide-folder" class="size-4 shrink-0" />

      <span v-if="!editing" class="truncate flex-1" @dblclick="startEdit">
        {{ folder.name }}
      </span>
      <input
        v-else
        v-model="editName"
        class="flex-1 bg-transparent border-b border-gray-400 outline-none text-sm"
        @keydown.enter="confirmEdit"
        @keydown.escape="editing = false"
        @blur="confirmEdit"
        ref="editInput"
      />

      <span v-if="!editing" class="text-xs text-gray-400 shrink-0">
        {{ totalNoteCount }}
      </span>

      <!-- Menu contextuel -->
      <UDropdownMenu
        :items="menuItems"
        :content="{ align: 'start' }"
      >
        <UButton
          icon="i-lucide-ellipsis"
          size="xs"
          variant="ghost"
          class="opacity-0 group-hover:opacity-100 transition-opacity"
          @click.stop
        />
      </UDropdownMenu>
    </div>

    <!-- Contenu déplié : notes + sous-dossiers -->
    <div
      v-if="isOpen"
      class="ml-2 rounded transition-colors duration-150"
      :class="isDragOver ? 'bg-primary/10 ring-1 ring-primary/30' : ''"
      @dragenter.prevent="onDragEnter"
      @dragleave.prevent="onDragLeave"
      @dragover.prevent
      @drop="isDragOver = false"
    >
      <!-- Notes du dossier avec drag & drop -->
      <VueDraggable
        v-model="draggableNotes"
        group="notes"
        :animation="150"
        ghost-class="opacity-30"
        :set-data="setNoteDropData"
        @add="onNoteAdded"
      >
        <SidebarNoteItem
          v-for="note in draggableNotes"
          :key="note.id"
          :data-id="note.id"
          :note="note"
          :active="note.id === activeNoteId"
          @select="$emit('select-note', $event)"
        />
      </VueDraggable>

      <!-- Show more -->
      <div
        v-if="folderNotes.length > displayedCount"
        class="px-2 py-1 text-xs text-primary cursor-pointer hover:underline"
        @click.stop="displayedCount += notesLimit"
      >
        Show more... ({{ folderNotes.length - displayedCount }} remaining)
      </div>

      <!-- Sous-dossiers récursifs -->
      <FolderTreeNode
        v-for="child in children"
        :key="child.id"
        :folder="child"
        :all-folders="allFolders"
        :active-folder-id="activeFolderId"
        :notes="notes"
        :active-note-id="activeNoteId"
        :notes-limit="notesLimit"
        @select="$emit('select', $event)"
        @select-note="$emit('select-note', $event)"
        @move-note="$emit('move-note', $event)"
        @create="$emit('create', $event)"
        @rename="(id: number, name: string) => $emit('rename', id, name)"
        @delete="$emit('delete', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { VueDraggable } from "vue-draggable-plus"
import type { Folder } from "~/types"

interface NoteItem {
  id: number
  title: string
  tags: string | null
  folderId: number | null
}

const props = withDefaults(
  defineProps<{
    folder: Folder
    allFolders: Folder[]
    activeFolderId: number | null
    notes: NoteItem[]
    activeNoteId: number | null
    notesLimit?: number
  }>(),
  { notesLimit: 5 },
)

const emit = defineEmits<{
  select: [id: number]
  "select-note": [id: number]
  "move-note": [payload: { noteId: number; folderId: number | null }]
  create: [parentId: number]
  rename: [id: number, name: string]
  delete: [id: number]
}>()

const isOpen = ref(true)
const isDragOver = ref(false)
let dragEnterCount = 0
const editing = ref(false)
const editName = ref("")
const editInput = ref<HTMLInputElement>()
const displayedCount = ref(props.notesLimit)

const children = computed(() =>
  props.allFolders.filter((f) => f.parentId === props.folder.id),
)

const folderNotes = computed(() =>
  props.notes.filter((n) => n.folderId === props.folder.id),
)

// Count notes in this folder + all descendant folders
const totalNoteCount = computed(() => {
  function countInFolder(folderId: number): number {
    const direct = props.notes.filter((n) => n.folderId === folderId).length
    const childFolders = props.allFolders.filter((f) => f.parentId === folderId)
    return direct + childFolders.reduce((sum, cf) => sum + countInFolder(cf.id), 0)
  }
  return countInFolder(props.folder.id)
})

const menuItems = computed(() => [
  [
    {
      label: "Rename",
      icon: "i-lucide-pencil",
      onSelect: () => startEdit(),
    },
    {
      label: "Add subfolder",
      icon: "i-lucide-folder-plus",
      onSelect: () => emit("create", props.folder.id),
    },
  ],
  [
    {
      label: "Delete",
      icon: "i-lucide-trash-2",
      color: "error" as const,
      onSelect: () => emit("delete", props.folder.id),
    },
  ],
])

const draggableNotes = ref<NoteItem[]>([])

watchEffect(() => {
  draggableNotes.value = folderNotes.value.slice(0, displayedCount.value)
})

function onDragEnter() {
  dragEnterCount++
  isDragOver.value = true
}

function onDragLeave() {
  dragEnterCount--
  if (dragEnterCount <= 0) {
    isDragOver.value = false
    dragEnterCount = 0
  }
}

function onNoteAdded(evt: { item: HTMLElement }) {
  isDragOver.value = false
  dragEnterCount = 0
  const noteIdStr = evt.item.dataset?.id
  if (!noteIdStr) return
  emit("move-note", { noteId: Number(noteIdStr), folderId: props.folder.id })
}

function startEdit() {
  editing.value = true
  editName.value = props.folder.name
  nextTick(() => editInput.value?.focus())
}

function confirmEdit() {
  if (editing.value && editName.value.trim()) {
    emit("rename", props.folder.id, editName.value.trim())
  }
  editing.value = false
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
