<template>
  <div>
    <div
      class="flex items-center gap-2 px-2 py-1.5 text-sm rounded cursor-pointer transition-colors"
      :class="
        folder.id === selectedId
          ? 'bg-primary/10 text-primary font-medium'
          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
      "
      @click="$emit('select', folder.id)"
    >
      <UIcon name="i-lucide-folder" class="size-4 shrink-0" />
      <span class="truncate">{{ folder.name }}</span>
    </div>
    <div v-if="children.length" class="ml-4">
      <FolderPickerNode
        v-for="child in children"
        :key="child.id"
        :folder="child"
        :all-folders="allFolders"
        :selected-id="selectedId"
        @select="$emit('select', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Folder } from "~/types"

const props = defineProps<{
  folder: Folder
  allFolders: Folder[]
  selectedId: number | null
}>()

defineEmits<{
  select: [id: number]
}>()

const children = computed(() =>
  props.allFolders.filter((f) => f.parentId === props.folder.id),
)
</script>
