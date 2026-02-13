<template>
  <div v-if="sortedTags.length > 0" class="px-3 pb-3">
    <div class="flex flex-wrap gap-1.5">
      <UBadge
        v-for="[tag, count] in sortedTags"
        :key="tag"
        :color="tag === activeTag ? 'primary' : 'neutral'"
        :variant="tag === activeTag ? 'solid' : 'subtle'"
        size="sm"
        class="cursor-pointer select-none"
        @click="$emit('select', tag === activeTag ? null : tag)"
      >
        {{ tag }}
        <span class="ml-0.5 opacity-60">{{ count }}</span>
      </UBadge>
      <UBadge
        v-if="activeTag"
        color="error"
        variant="subtle"
        size="sm"
        class="cursor-pointer select-none"
        @click="$emit('select', null)"
      >
        &times; clear
      </UBadge>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  notes: Array<{ tags: string | null }>
  activeTag: string | null
}>()

defineEmits<{
  select: [tag: string | null]
}>()

const sortedTags = computed(() => {
  const tagMap = collectAllTags(props.notes)
  return [...tagMap.entries()].sort((a, b) => b[1] - a[1])
})
</script>
