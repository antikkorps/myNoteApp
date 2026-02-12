<template>
  <div class="p-4">
    <h2 class="text-xl font-bold mb-4">Create a New Note</h2>
    <form @submit.prevent="handleSubmit">
      <UInput v-model="title" placeholder="Title" class="w-full mb-2" />
      <UTextarea v-model="content" placeholder="Content" class="w-full mb-2"></UTextarea>
      <UInput v-model="tags" placeholder="Tags" class="w-full mb-2"></UInput>
      <UButton type="submit" class="bg-blue-500 text-white mt-4"> Save Note </UButton>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
const title = ref("")
const content = ref("")
const tags = ref("")
const emit = defineEmits(["noteCreated"])
const handleSubmit = async () => {
  await $fetch("/api/notes", {
    method: "POST",
    body: {
      title: title.value,
      content: content.value,
      tags: tags.value,
    },
  })
  emit("noteCreated")
}
</script>
