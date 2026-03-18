<template>
  <div
    class="flex items-center gap-2 px-2 py-1.5 text-sm rounded cursor-pointer transition-colors"
    :class="
      active
        ? 'bg-gray-200 dark:bg-gray-800 font-medium'
        : 'hover:bg-gray-100 dark:hover:bg-gray-900'
    "
    @click="$emit('select', note.id)"
  >
    <UIcon name="i-lucide-file-text" class="size-4 shrink-0 text-gray-400" />
    <span class="truncate flex-1">{{ note.title || "Untitled" }}</span>
    <div v-if="tags.length" class="flex gap-1 shrink-0">
      <UBadge
        v-for="tag in tags.slice(0, 2)"
        :key="tag"
        color="neutral"
        variant="subtle"
        size="xs"
      >
        {{ tag }}
      </UBadge>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  note: { id: number; title: string; tags: string | null }
  active: boolean
}>()

defineEmits<{
  select: [id: number]
}>()

const tags = computed(() => parseTags(props.note.tags))
</script>
