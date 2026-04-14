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
import type { Editor } from "@tiptap/vue-3"
import { fixedItems, imageBubbleItems, bubbleItems } from "~/utils/editorToolbar"
import type { Note, Folder, NotePreferences } from "~/types"
import { SearchHighlight } from "~/utils/searchHighlight"
import Image from "@tiptap/extension-image"

const { findBarOpen, closeFindBar } = useFindInNote()

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

const noteRef = computed(() => props.note)
const { editorProps: imageEditorProps } = useEditorFileUpload(
  noteRef,
  editorRef,
  () => { attachmentsVersion.value++ },
)

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

const {
  localTitle,
  localContent,
  localTags,
  localFolderId,
  saving,
  lastSaved,
  scheduleSave,
} = useNoteAutosave(noteRef, (payload) => emit("save", payload))

function onFolderChange(id: number | null) {
  localFolderId.value = id
  scheduleSave()
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
