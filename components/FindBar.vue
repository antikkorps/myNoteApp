<template>
  <div class="find-bar flex items-center gap-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg px-3 py-1.5">
    <UIcon name="i-lucide-search" class="text-gray-400 shrink-0" />
    <input
      ref="inputRef"
      v-model="searchTerm"
      type="text"
      placeholder="Find in note..."
      class="bg-transparent border-none outline-none text-sm w-40"
      @keydown.enter.exact.prevent="onNext"
      @keydown.enter.shift.prevent="onPrev"
      @keydown.escape.prevent="onClose"
    />
    <span v-if="searchTerm" class="text-xs text-gray-400 whitespace-nowrap">
      {{ totalMatches > 0 ? `${currentIndex + 1} / ${totalMatches}` : "No results" }}
    </span>
    <UButton
      icon="i-lucide-chevron-up"
      size="xs"
      variant="ghost"
      :disabled="totalMatches === 0"
      @click="onPrev"
    />
    <UButton
      icon="i-lucide-chevron-down"
      size="xs"
      variant="ghost"
      :disabled="totalMatches === 0"
      @click="onNext"
    />
    <UButton
      icon="i-lucide-x"
      size="xs"
      variant="ghost"
      @click="onClose"
    />
  </div>
</template>

<script setup lang="ts">
import type { Editor } from "@tiptap/core"

const props = defineProps<{
  editor: Editor
}>()

const emit = defineEmits<{
  close: []
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const searchTerm = ref("")

const totalMatches = computed(() => props.editor.storage.searchHighlight?.totalMatches ?? 0)
const currentIndex = computed(() => props.editor.storage.searchHighlight?.currentIndex ?? 0)

watch(searchTerm, (term) => {
  props.editor.commands.setSearchTerm(term)
  scrollToCurrentMatch()
})

function onNext() {
  props.editor.commands.nextMatch()
  nextTick(() => scrollToCurrentMatch())
}

function onPrev() {
  props.editor.commands.prevMatch()
  nextTick(() => scrollToCurrentMatch())
}

function onClose() {
  searchTerm.value = ""
  props.editor.commands.clearSearch()
  emit("close")
}

function scrollToCurrentMatch() {
  nextTick(() => {
    const current = props.editor.view.dom.querySelector(".search-match-current")
    if (current) {
      current.scrollIntoView({ block: "center", behavior: "smooth" })
    }
  })
}

onMounted(() => {
  nextTick(() => inputRef.value?.focus())
})
</script>
