<template>
  <UDropdownMenu :items="menuItems" :content="{ align: 'end' }">
    <UButton icon="i-lucide-ellipsis" size="sm" variant="ghost" />
  </UDropdownMenu>
</template>

<script setup lang="ts">
import type { NotePreferences } from "~/types"

const { activeNote, folderList } = useActiveNote()
const actions = useNoteActions()
const toast = useToast()
const session = useAuth().useSession()
const { openFindBar } = useFindInNote()

const wordCount = computed(() => {
  if (!activeNote.value?.content) return 0
  const text = activeNote.value.content
    .replace(/[#*_~`>\-\[\]()!|]/g, "")
    .replace(/\s+/g, " ")
    .trim()
  return text ? text.split(" ").length : 0
})

const readingTime = computed(() => {
  const minutes = Math.ceil(wordCount.value / 230)
  return minutes <= 1 ? "1 min read" : `${minutes} min read`
})

function formatModifiedDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

const preferences = computed<NotePreferences>(() => {
  if (!activeNote.value?.preferences) return {}
  try {
    return JSON.parse(activeNote.value.preferences)
  } catch {
    return {}
  }
})

async function togglePreference(key: keyof NotePreferences) {
  if (!activeNote.value) return
  const current = preferences.value
  const updated = { ...current, [key]: !current[key] }
  await $fetch(`/api/notes/${activeNote.value.id}`, {
    method: "PUT",
    body: { preferences: updated },
  })
  activeNote.value = { ...activeNote.value, preferences: JSON.stringify(updated) }
}

async function copyLink() {
  if (!activeNote.value) return
  await navigator.clipboard.writeText(`${window.location.origin}/?note=${activeNote.value.id}`)
  toast.add({ title: "Link copied", color: "success" })
}

async function copyContent() {
  if (!activeNote.value) return
  await navigator.clipboard.writeText(activeNote.value.content)
  toast.add({ title: "Content copied", color: "success" })
}

function duplicateNote() {
  actions.value?.duplicate()
}

function deleteNote() {
  actions.value?.delete()
}

const moveToItems = computed(() =>
  [
    {
      label: "No folder",
      icon: "i-lucide-file",
      onSelect: () => actions.value?.moveToFolder(null),
    },
    ...folderList.value.map((f) => ({
      label: f.name,
      icon: "i-lucide-folder",
      onSelect: () => actions.value?.moveToFolder(f.id),
    })),
  ],
)

const menuItems = computed(() => [
  [
    {
      label: "Serif font",
      icon: "i-lucide-type",
      type: "checkbox" as const,
      checked: !!preferences.value.serif,
      onUpdateChecked: () => togglePreference("serif"),
    },
    {
      label: "Small text",
      icon: "i-lucide-a-large-small",
      type: "checkbox" as const,
      checked: !!preferences.value.smallText,
      onUpdateChecked: () => togglePreference("smallText"),
    },
    {
      label: "Full width",
      icon: "i-lucide-arrow-left-right",
      type: "checkbox" as const,
      checked: !!preferences.value.fullWidth,
      onUpdateChecked: () => togglePreference("fullWidth"),
    },
  ],
  [
    {
      label: "Find in note",
      icon: "i-lucide-search",
      shortcut: "⌘F",
      onSelect: openFindBar,
    },
    {
      label: "Copy link",
      icon: "i-lucide-link",
      onSelect: copyLink,
    },
    {
      label: "Copy content",
      icon: "i-lucide-clipboard",
      onSelect: copyContent,
    },
    {
      label: "Duplicate",
      icon: "i-lucide-copy",
      onSelect: duplicateNote,
    },
  ],
  [
    {
      label: "Move to...",
      icon: "i-lucide-folder-input",
      children: moveToItems.value,
    },
    {
      label: "Delete",
      icon: "i-lucide-trash-2",
      color: "error" as const,
      onSelect: deleteNote,
    },
  ],
  [
    {
      label: `${wordCount.value} words · ${readingTime.value}`,
      type: "label" as const,
      icon: "i-lucide-text",
    },
    {
      label: `Modified ${activeNote.value ? formatModifiedDate(activeNote.value.updatedAt) : ""}`,
      type: "label" as const,
      icon: "i-lucide-clock",
    },
    {
      label: `By ${session.value?.data?.user?.name || session.value?.data?.user?.email || "you"}`,
      type: "label" as const,
      icon: "i-lucide-user",
    },
  ],
])
</script>
