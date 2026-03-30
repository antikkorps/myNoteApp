<template>
  <div
    v-if="note"
    class="flex-1 flex flex-col h-full overflow-hidden relative"
    :class="{ 'font-serif': prefs.serif, 'note-small-text': prefs.smallText }"
    @keydown="onFindKeydown"
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
    <div ref="editorScrollContainer" class="flex-1 overflow-y-auto pb-8 scrollbar-thin relative" :class="prefs.fullWidth ? 'px-4' : 'px-4 md:px-12'">
      <ClientOnly>
        <UEditor
          v-slot="{ editor }"
          v-model="localContent"
          content-type="markdown"
          :starter-kit="starterKitConfig"
          :extensions="customExtensions"
          :editor-props="imageEditorProps"
          :image="false"
          class="min-h-50 flex flex-col gap-2"
          @update:model-value="scheduleSave"
          :on-create="({ editor: e }: any) => { editorRef = e }"
        >
          <FindBar
            v-if="showFindBar && editor"
            :editor="editor"
            class="sticky top-0 z-10 self-end"
            @close="onCloseFindBar"
          />
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
          <div class="flex items-center gap-1 sticky top-0 z-10 bg-white dark:bg-gray-900 py-1">
            <UEditorToolbar
              :editor="editor"
              :items="fixedItems"
              layout="fixed"
              class="overflow-x-auto scrollbar-hide"
            />

            <EditorImageButton
              v-if="editor && note"
              :editor="editor"
              :note-id="note.id"
            />
          </div>

          <!-- Toolbar bubble : formatage texte -->
          <UEditorToolbar :editor="editor" :items="bubbleItems" layout="bubble" />

          <!-- Toolbar bubble : actions image (download / delete) -->
          <UEditorToolbar
            :editor="editor"
            :items="imageBubbleItems(editor)"
            layout="bubble"
            :should-show="({ editor: e, view }: any) => e.isActive('image') && view.hasFocus()"
          />

          <UEditorDragHandle :editor="editor" />
        </UEditor>
      </ClientOnly>
    </div>

    <!-- Anchor for the outline teleport (stays fixed, outside the scrollable area) -->
    <div ref="outlineAnchor" class="absolute right-0 top-0 h-full pointer-events-none [&>*]:pointer-events-auto" />

    <!-- Attachments panel -->
    <NoteAttachments v-if="note" ref="attachmentsPanel" :note-id="note.id" :key="`att-${note.id}-${attachmentsVersion}`" />

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
import type { Editor } from "@tiptap/vue-3"
import type { Note, Folder, NotePreferences } from "~/types"
import { SearchHighlight } from "~/utils/searchHighlight"
import Image from "@tiptap/extension-image"

const { findBarOpen, closeFindBar } = useFindInNote()
const toast = useToast()
const { upload, uploading: imageUploading, isImageFile } = useImageUpload()

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
    openOnClick: true,
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
const showFindBar = ref(false)
const customExtensions = [
  SearchHighlight,
  Image.configure({
    resize: {
      enabled: true,
      directions: ["top-left", "top-right", "bottom-left", "bottom-right"],
      minWidth: 100,
      minHeight: 100,
      alwaysPreserveAspectRatio: true,
    },
  }),
]
const editorRef = ref<Editor | null>(null)
const attachmentsPanel = ref<{ refresh: () => void } | null>(null)
const attachmentsVersion = ref(0)

async function handleFileUpload(file: File, editor: Editor) {
  if (!props.note) return false

  try {
    const result = await upload(file, props.note.id)
    if (isImageFile(file)) {
      editor.chain().focus().setImage({ src: result.url, alt: result.filename }).run()
    } else {
      // Insert a download link for non-image files
      editor.chain().focus().insertContent({
        type: 'text',
        text: `📎 ${result.filename}`,
        marks: [{ type: 'link', attrs: { href: result.url, target: '_blank' } }],
      }).run()
    }
  } catch (err: any) {
    toast.add({ title: "Upload failed", description: err?.data?.statusMessage || "Could not upload file", color: "error" })
  }
  attachmentsVersion.value++
  return true
}

const imageEditorProps = {
  handlePaste(_view: any, event: ClipboardEvent) {
    const files = Array.from(event.clipboardData?.files || [])
    const file = files[0]
    if (!file || !editorRef.value) return false

    handleFileUpload(file, editorRef.value as unknown as Editor)
    return true
  },
  handleDrop(_view: any, event: DragEvent, _slice: any, moved: boolean) {
    if (moved) return false

    const files = Array.from(event.dataTransfer?.files || [])
    const file = files[0]
    if (!file || !editorRef.value) return false

    handleFileUpload(file, editorRef.value as unknown as Editor)
    return true
  },
}

watch(findBarOpen, (open) => {
  if (open) {
    showFindBar.value = true
    closeFindBar()
  }
})

function onFindKeydown(e: KeyboardEvent) {
  if ((e.ctrlKey || e.metaKey) && e.key === "f") {
    e.preventDefault()
    showFindBar.value = true
  }
}

function onCloseFindBar() {
  showFindBar.value = false
}
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

// Toolbar bubble : actions image (apparaît au clic sur une image)
function imageBubbleItems(editor: Editor): EditorToolbarItem[][] {
  const node = editor.state.doc.nodeAt(editor.state.selection.from)

  return [
    [
      {
        icon: "i-lucide-download",
        tooltip: { text: "Download" },
        to: node?.attrs?.src,
        download: true,
      } as any,
    ],
    [
      {
        icon: "i-lucide-trash",
        tooltip: { text: "Delete" },
        onClick: () => {
          const { state } = editor
          const pos = state.selection.from
          const selectedNode = state.doc.nodeAt(pos)

          if (selectedNode && selectedNode.type.name === "image") {
            editor.chain().focus().deleteRange({ from: pos, to: pos + selectedNode.nodeSize }).run()
          }
        },
      } as any,
    ],
  ]
}

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

<style>
.search-match {
  background: #fde68a;
  border-radius: 2px;
}
.search-match-current {
  background: #f97316;
  color: white;
  border-radius: 2px;
}
.tiptap a {
  cursor: pointer;
}
.tiptap [data-resize-handle] {
  width: 12px;
  height: 12px;
  background: var(--ui-primary);
  border: 2px solid white;
  border-radius: 50%;
  z-index: 10;
  opacity: 0;
  transition: opacity 0.15s;
}
.tiptap [data-resize-wrapper]:hover [data-resize-handle],
.tiptap [data-resize-wrapper][data-resize-state="true"] [data-resize-handle] {
  opacity: 1;
}
.tiptap [data-resize-handle="top-left"] { cursor: nwse-resize; transform: translate(-50%, -50%); }
.tiptap [data-resize-handle="top-right"] { cursor: nesw-resize; transform: translate(50%, -50%); }
.tiptap [data-resize-handle="bottom-left"] { cursor: nesw-resize; transform: translate(-50%, 50%); }
.tiptap [data-resize-handle="bottom-right"] { cursor: nwse-resize; transform: translate(50%, 50%); }
</style>
