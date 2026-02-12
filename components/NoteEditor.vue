<template>
  <div v-if="note" class="flex-1 flex flex-col h-full overflow-hidden">
    <!-- Title -->
    <div class="px-4 md:px-12 pt-8 pb-2">
      <input
        v-model="localTitle"
        placeholder="Untitled"
        class="w-full text-3xl font-bold bg-transparent border-none outline-none placeholder-gray-300 dark:placeholder-gray-600"
        @input="scheduleSave"
      />
    </div>

    <!-- Editor -->
    <div class="flex-1 overflow-y-auto px-4 md:px-12 pb-8">
      <ClientOnly>
        <UEditor
          v-slot="{ editor }"
          v-model="localContent"
          content-type="markdown"
          class="min-h-50 flex flex-col gap-2"
          @update:model-value="scheduleSave"
        >
          <!-- Toolbar fixe : blocs + historique -->
          <UEditorToolbar
            :editor="editor"
            :items="fixedItems"
            layout="fixed"
            class="overflow-x-auto scrollbar-hide"
          />

          <!-- Toolbar bubble : formatage texte -->
          <UEditorToolbar :editor="editor" :items="bubbleItems" layout="bubble" />
          <UEditorDragHandle :editor="editor" />
        </UEditor>
      </ClientOnly>
    </div>

    <!-- Bottom bar -->
    <div
      class="flex items-center justify-between px-4 md:px-12 py-2 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-400"
    >
      <span v-if="saving">Saving...</span>
      <span v-else-if="lastSaved">Saved</span>
      <span v-else />
      <UButton size="xs" variant="ghost" color="error" @click="$emit('delete', note.id)">
        Delete
      </UButton>
    </div>
  </div>

  <!-- Empty state -->
  <div v-else class="flex-1 flex items-center justify-center text-gray-400">
    <p>Select a note or create a new one</p>
  </div>
</template>

<script setup lang="ts">
import type { EditorToolbarItem } from "@nuxt/ui"

interface Note {
  id: number
  title: string
  content: string
  tags: string | null
  userId: string
  createdAt: string
  updatedAt: string
}

const props = defineProps<{
  note: Note | null
}>()

const emit = defineEmits<{
  save: [data: { id: number; title: string; content: string }]
  delete: [id: number]
}>()

const localTitle = ref("")
const localContent = ref("")
const saving = ref(false)
const lastSaved = ref(false)

const fixedItems: EditorToolbarItem[][] = [
  // History controls
  [
    {
      kind: "undo",
      icon: "i-lucide-undo",
      tooltip: { text: "Undo" },
    },
    {
      kind: "redo",
      icon: "i-lucide-redo",
      tooltip: { text: "Redo" },
    },
  ],
  // Block types
  [
    {
      icon: "i-lucide-heading",
      tooltip: { text: "Headings" },
      content: {
        align: "start",
      },
      items: [
        {
          kind: "heading",
          level: 1,
          icon: "i-lucide-heading-1",
          label: "Heading 1",
        },
        {
          kind: "heading",
          level: 2,
          icon: "i-lucide-heading-2",
          label: "Heading 2",
        },
        {
          kind: "heading",
          level: 3,
          icon: "i-lucide-heading-3",
          label: "Heading 3",
        },
        {
          kind: "heading",
          level: 4,
          icon: "i-lucide-heading-4",
          label: "Heading 4",
        },
      ],
    },
    {
      icon: "i-lucide-list",
      tooltip: { text: "Lists" },
      content: {
        align: "start",
      },
      items: [
        {
          kind: "bulletList",
          icon: "i-lucide-list",
          label: "Bullet List",
        },
        {
          kind: "orderedList",
          icon: "i-lucide-list-ordered",
          label: "Ordered List",
        },
      ],
    },
    {
      kind: "blockquote",
      icon: "i-lucide-text-quote",
      tooltip: { text: "Blockquote" },
    },
    {
      kind: "codeBlock",
      icon: "i-lucide-square-code",
      tooltip: { text: "Code Block" },
    },
    {
      kind: "horizontalRule",
      icon: "i-lucide-separator-horizontal",
      tooltip: { text: "Horizontal Rule" },
    },
  ],
  // Text formatting
  [
    {
      kind: "mark",
      mark: "bold",
      icon: "i-lucide-bold",
      tooltip: { text: "Bold" },
    },
    {
      kind: "mark",
      mark: "italic",
      icon: "i-lucide-italic",
      tooltip: { text: "Italic" },
    },
    {
      kind: "mark",
      mark: "underline",
      icon: "i-lucide-underline",
      tooltip: { text: "Underline" },
    },
    {
      kind: "mark",
      mark: "strike",
      icon: "i-lucide-strikethrough",
      tooltip: { text: "Strikethrough" },
    },
    {
      kind: "mark",
      mark: "code",
      icon: "i-lucide-code",
      tooltip: { text: "Code" },
    },
  ],
  // Link
  [
    {
      kind: "link",
      icon: "i-lucide-link",
      tooltip: { text: "Link" },
    },
  ],
  // Text alignment
  [
    {
      icon: "i-lucide-align-justify",
      tooltip: { text: "Text Align" },
      content: {
        align: "end",
      },
      items: [
        {
          kind: "textAlign",
          align: "left",
          icon: "i-lucide-align-left",
          label: "Align Left",
        },
        {
          kind: "textAlign",
          align: "center",
          icon: "i-lucide-align-center",
          label: "Align Center",
        },
        {
          kind: "textAlign",
          align: "right",
          icon: "i-lucide-align-right",
          label: "Align Right",
        },
        {
          kind: "textAlign",
          align: "justify",
          icon: "i-lucide-align-justify",
          label: "Align Justify",
        },
      ],
    },
  ],
]

// Toolbar bubble : formatage inline (apparaît à la sélection)
const bubbleItems: EditorToolbarItem[][] = [
  [
    { kind: "mark", mark: "bold", icon: "i-lucide-bold", tooltip: { text: "Bold" } },
    {
      kind: "mark",
      mark: "italic",
      icon: "i-lucide-italic",
      tooltip: { text: "Italic" },
    },
    {
      kind: "mark",
      mark: "underline",
      icon: "i-lucide-underline",
      tooltip: { text: "Underline" },
    },
    {
      kind: "mark",
      mark: "strike",
      icon: "i-lucide-strikethrough",
      tooltip: { text: "Strike" },
    },
    { kind: "mark", mark: "code", icon: "i-lucide-code", tooltip: { text: "Code" } },
  ],
  [{ kind: "link", icon: "i-lucide-link", tooltip: { text: "Link" } }],
]

let saveTimer: ReturnType<typeof setTimeout> | null = null

let isLoadingNote = false

watch(
  () => props.note?.id,
  (newId, oldId) => {
    if (newId !== oldId && props.note) {
      isLoadingNote = true
      localTitle.value = props.note.title
      localContent.value = props.note.content
      lastSaved.value = false
      nextTick(() => {
        isLoadingNote = false
      })
    }
  },
  { immediate: true },
)

watch(localContent, () => {
  if (!isLoadingNote) {
    scheduleSave()
  }
})

function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    if (props.note) {
      emit("save", {
        id: props.note.id,
        title: localTitle.value,
        content: localContent.value,
      })
      lastSaved.value = true
      saving.value = false
    }
  }, 1000)
}
</script>
