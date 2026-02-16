<template>
  <div
    v-if="note"
    class="flex-1 flex flex-col h-full overflow-hidden relative"
    :class="{ 'font-serif': prefs.serif, 'note-small-text': prefs.smallText }"
  >
    <!-- Folder -->
    <FolderBadge
      :folder-id="localFolderId"
      :folders="folders"
      class="pt-6"
      @update:folder-id="onFolderChange"
    />

    <!-- Title -->
    <div :class="prefs.fullWidth ? 'px-4' : 'px-4 md:px-12'" class="pt-2 pb-2">
      <input
        v-model="localTitle"
        placeholder="Untitled"
        class="w-full text-3xl font-bold bg-transparent border-none outline-none placeholder-gray-300 dark:placeholder-gray-600"
        @input="scheduleSave"
      />
    </div>

    <!-- Tags -->
    <TagInput v-model="localTags" @update:model-value="scheduleSave" />

    <!-- Editor -->
    <div ref="editorScrollContainer" class="flex-1 overflow-y-auto pb-8 scrollbar-thin" :class="prefs.fullWidth ? 'px-4' : 'px-4 md:px-12'">
      <ClientOnly>
        <UEditor
          v-slot="{ editor }"
          v-model="localContent"
          content-type="markdown"
          :starter-kit="starterKitConfig"
          class="min-h-50 flex flex-col gap-2"
          @update:model-value="scheduleSave"
        >
          <NoteLinkSetup
            v-if="editor"
            :editor="editor"
            :notes="notes"
            :current-note-id="note?.id"
            @navigate-note="(id: number) => emit('navigate-note', id)"
          />

          <template v-if="editor">
            <Teleport :to="outlineAnchor" :disabled="!outlineAnchor">
              <DocumentOutline
                :editor="editor"
                :scroll-container="editorScrollContainer"
              />
            </Teleport>
          </template>

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

    <!-- Anchor for the outline teleport (stays fixed, outside the scrollable area) -->
    <div ref="outlineAnchor" class="absolute right-0 top-0 h-full pointer-events-none [&>*]:pointer-events-auto" />

    <!-- Bottom bar -->
    <div
      class="flex items-center justify-between py-2 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-400"
      :class="prefs.fullWidth ? 'px-4' : 'px-4 md:px-12'"
    >
      <span v-if="saving">Saving...</span>
      <span v-else-if="lastSaved">Saved</span>
      <span v-else />
      <UButton
        size="xs"
        variant="ghost"
        color="error"
        icon="i-lucide-trash-2"
        @click="$emit('delete', note.id)"
      />
    </div>
  </div>

  <!-- Empty state -->
  <div v-else class="flex-1 flex items-center justify-center text-gray-400">
    <p>Select a note or create a new one</p>
  </div>
</template>

<script setup lang="ts">
import type { EditorToolbarItem } from "@nuxt/ui"
import type { Note, Folder, NotePreferences } from "~/types"

const props = defineProps<{
  note: Note | null
  folders: Folder[]
  notes: Array<{ id: number; title: string }>
}>()

const prefs = computed<NotePreferences>(() => {
  if (!props.note?.preferences) return {}
  try {
    return JSON.parse(props.note.preferences)
  } catch {
    return {}
  }
})

const emit = defineEmits<{
  save: [data: { id: number; title: string; content: string; tags: string; folderId: number | null }]
  delete: [id: number]
  "navigate-note": [id: number]
}>()

const starterKitConfig = {
  link: {
    isAllowedUri: (url: string) => {
      // Allow note:// internal links in addition to default protocols
      if (url.startsWith("note://")) return true
      // Default TipTap allowed protocols
      return /^(https?:\/\/|mailto:|tel:)/.test(url) || url.startsWith("/") || url.startsWith("#")
    },
  },
}

const editorScrollContainer = ref<HTMLElement | null>(null)
const outlineAnchor = ref<HTMLElement | null>(null)
const localTitle = ref("")
const localContent = ref("")
const localTags = ref<string[]>([])
const saving = ref(false)
const lastSaved = ref(false)
const localFolderId = ref<number | null>(null)

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
      localTags.value = parseTags(props.note.tags)
      localFolderId.value = props.note.folderId
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

function onFolderChange(id: number | null) {
  localFolderId.value = id
  scheduleSave()
}

function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    if (props.note) {
      emit("save", {
        id: props.note.id,
        title: localTitle.value,
        content: localContent.value,
        tags: serializeTags(localTags.value),
        folderId: localFolderId.value,
      })
      lastSaved.value = true
      saving.value = false
    }
  }, 1000)
}
</script>
