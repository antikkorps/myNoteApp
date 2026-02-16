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
])
</script>
