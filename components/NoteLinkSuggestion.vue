<template>
  <div
    v-if="items.length"
    class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden w-64"
  >
    <button
      v-for="(item, index) in items"
      :key="item.id"
      class="flex items-center gap-2 w-full px-3 py-2 text-sm text-left transition-colors"
      :class="
        index === selectedIndex
          ? 'bg-primary/10 text-primary'
          : 'hover:bg-gray-100 dark:hover:bg-gray-800'
      "
      @click="$emit('select', index)"
      @mouseenter="$emit('hover', index)"
    >
      <UIcon name="i-lucide-file-text" class="size-4 shrink-0 text-gray-400" />
      <span class="truncate">{{ item.title || 'Untitled' }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  items: Array<{ id: number; title: string }>
  selectedIndex: number
}>()

defineEmits<{
  select: [index: number]
  hover: [index: number]
}>()
</script>
