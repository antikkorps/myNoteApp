<template>
  <UCard class="flex flex-col justify-between">
    <h3 class="text-xl">{{ note.title }}</h3>
    <p>{{ note.content }}</p>
    <p class="mt-3 text-xs">{{ note.tags }}</p>
    <div class="flex justify-end">
      <UButton class="mx-2" @click="editNote">Edit</UButton>
      <UButton class="mx-2" @click="handleDelete">Supprimer</UButton>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { ref } from "vue"
const title = ref("")
const content = ref("")
const tags = ref("")
const Open = ref(false)
const emit = defineEmits(["editNote", "noteDeleted"])

defineProps<{
  note: {
    title: string
    content: string
    tags: string
  }
}>()

const handleDelete = async () => {
  console.log("delete Note")
  await $fetch("/api/notes/:id", {
    method: "DELETE",
  })
  emit("noteDeleted")
}

const editNote = () => {
  emit("editNote")
  console.log("Edit Note")
}
</script>
