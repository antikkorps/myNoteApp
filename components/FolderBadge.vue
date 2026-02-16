<template>
  <div class="px-4 md:px-12 pb-2">
    <UPopover>
      <UBadge
        class="cursor-pointer select-none"
        :color="folderId ? 'primary' : 'neutral'"
        variant="subtle"
        size="md"
      >
        <UIcon name="i-lucide-folder" class="size-3.5" />
        <span>{{ currentFolderName }}</span>
        <UIcon
          v-if="folderId"
          name="i-lucide-x"
          class="size-3 ml-1 hover:text-red-500 cursor-pointer"
          @click.stop="$emit('update:folderId', null)"
        />
      </UBadge>

      <template #content>
        <div class="p-2 w-56 max-h-64 overflow-y-auto">
          <div class="text-xs font-semibold text-gray-500 uppercase mb-2 px-2">
            Move to folder
          </div>
          <div
            class="flex items-center gap-2 px-2 py-1.5 text-sm rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
            :class="{ 'bg-primary/10 text-primary font-medium': !folderId }"
            @click="selectFolder(null)"
          >
            <UIcon name="i-lucide-inbox" class="size-4 shrink-0" />
            <span>No folder</span>
          </div>
          <FolderPickerNode
            v-for="folder in rootFolders"
            :key="folder.id"
            :folder="folder"
            :all-folders="folders"
            :selected-id="folderId"
            @select="selectFolder"
          />
        </div>
      </template>
    </UPopover>
  </div>
</template>

<script setup lang="ts">
interface Folder {
  id: number
  name: string
  parentId: number | null
}

const props = defineProps<{
  folderId: number | null
  folders: Folder[]
}>()

const emit = defineEmits<{
  "update:folderId": [id: number | null]
}>()

const rootFolders = computed(() =>
  props.folders.filter((f) => f.parentId === null),
)

const currentFolderName = computed(() => {
  if (!props.folderId) return "No folder"
  return props.folders.find((f) => f.id === props.folderId)?.name ?? "No folder"
})

function selectFolder(id: number | null) {
  emit("update:folderId", id)
}
</script>
