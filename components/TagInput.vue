<template>
  <div class="flex flex-wrap items-center gap-1.5 px-4 md:px-12 pb-2">
    <UBadge
      v-for="tag in modelValue"
      :key="tag"
      color="neutral"
      variant="subtle"
      size="sm"
      class="gap-1"
    >
      {{ tag }}
      <button
        class="ml-0.5 hover:text-red-500 transition-colors"
        @click="removeTag(tag)"
      >
        &times;
      </button>
    </UBadge>
    <input
      ref="inputRef"
      v-model="inputValue"
      placeholder="Add tag…"
      class="bg-transparent border-none outline-none text-sm placeholder-gray-400 dark:placeholder-gray-500 min-w-[80px] flex-1"
      @keydown.enter.prevent="addTag"
      @keydown.,prevent="addTag"
      @keydown.backspace="onBackspace"
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: string[]
}>()

const emit = defineEmits<{
  "update:modelValue": [tags: string[]]
}>()

const inputValue = ref("")
const inputRef = ref<HTMLInputElement>()

function addTag() {
  const tag = normalizeTag(inputValue.value)
  if (tag && !props.modelValue.includes(tag)) {
    emit("update:modelValue", [...props.modelValue, tag])
  }
  inputValue.value = ""
}

function removeTag(tag: string) {
  emit("update:modelValue", props.modelValue.filter((t) => t !== tag))
}

function onBackspace() {
  if (inputValue.value === "" && props.modelValue.length > 0) {
    emit("update:modelValue", props.modelValue.slice(0, -1))
  }
}
</script>
