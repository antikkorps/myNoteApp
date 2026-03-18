<template>
  <div
    v-if="hasHeadings"
    class="absolute right-3 top-1 z-20"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <!-- Toggle button — fixed position, never moves -->
    <UButton
      size="xs"
      variant="ghost"
      icon="i-lucide-list-tree"
      class="relative z-10"
    />

    <!-- Panel — absolutely positioned below button, doesn't affect button layout -->
    <Transition
      enter-active-class="transition-all duration-150 ease-out"
      leave-active-class="transition-all duration-100 ease-in"
      enter-from-class="translate-x-2 opacity-0"
      enter-to-class="translate-x-0 opacity-100"
      leave-from-class="translate-x-0 opacity-100"
      leave-to-class="translate-x-2 opacity-0"
    >
      <div
        v-if="open"
        class="absolute right-0 top-full mt-1 w-56 max-h-80 overflow-y-auto overscroll-contain rounded-lg border border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur shadow-lg p-2 outline-scrollbar"
      >
        <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide px-2 pb-1">
          Outline
        </p>
        <button
          v-for="(heading, index) in headings"
          :key="heading.id"
          class="block w-full text-left text-sm truncate rounded px-2 py-1 transition-colors"
          :class="activeIndex === index
            ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'"
          :style="{ paddingLeft: `${(heading.level - 1) * 12 + 8}px` }"
          @click="scrollToHeading(index)"
        >
          {{ heading.text }}
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { Editor } from "@tiptap/vue-3"

interface Heading {
  level: number
  text: string
  pos: number
  id: string
}

const props = defineProps<{
  editor: Editor
  scrollContainer: HTMLElement | null
}>()

const headings = ref<Heading[]>([])
const activeIndex = ref(0)
const open = ref(false)
const hasHeadings = computed(() => headings.value.length > 0)

let leaveTimer: ReturnType<typeof setTimeout> | undefined
let cooldown = false

function onMouseEnter() {
  clearTimeout(leaveTimer)
  if (!cooldown) open.value = true
}

function onMouseLeave() {
  clearTimeout(leaveTimer)
  leaveTimer = setTimeout(() => { open.value = false }, 250)
}

function extractHeadings() {
  const result: Heading[] = []
  let idx = 0
  props.editor.state.doc.descendants((node, pos) => {
    if (node.type.name === "heading") {
      result.push({
        level: node.attrs.level as number,
        text: node.textContent,
        pos,
        id: `h-${idx++}-${pos}`,
      })
    }
  })
  headings.value = result
}

function getHeadingDom(pos: number): HTMLElement | null {
  try {
    const domAtPos = props.editor.view.domAtPos(pos + 1)
    const node = domAtPos.node
    if (node instanceof HTMLElement) return node
    return node.parentElement
  } catch {
    return null
  }
}

function scrollToHeading(index: number) {
  const heading = headings.value[index]
  if (!heading) return
  activeIndex.value = index
  const el = getHeadingDom(heading.pos)
  el?.scrollIntoView({ behavior: "smooth", block: "start" })

  // Close and prevent hover from re-opening immediately
  open.value = false
  cooldown = true
  setTimeout(() => { cooldown = false }, 400)
}

function updateActiveFromScroll() {
  const container = props.scrollContainer
  if (!container || headings.value.length === 0) return

  const containerTop = container.getBoundingClientRect().top
  let closestIndex = 0
  let closestDistance = Infinity

  for (let i = 0; i < headings.value.length; i++) {
    const el = getHeadingDom(headings.value[i]!.pos)
    if (!el) continue
    const rect = el.getBoundingClientRect()
    const distance = rect.top - containerTop
    if (distance <= 40 && Math.abs(distance) < closestDistance) {
      closestDistance = Math.abs(distance)
      closestIndex = i
    } else if (distance > 0 && distance < closestDistance && closestDistance === Infinity) {
      closestDistance = distance
      closestIndex = i
    }
  }

  activeIndex.value = closestIndex
}

function onEditorUpdate() {
  extractHeadings()
}

let scrollHandler: (() => void) | null = null

watch(
  () => props.scrollContainer,
  (container, oldContainer) => {
    if (oldContainer && scrollHandler) {
      oldContainer.removeEventListener("scroll", scrollHandler)
    }
    if (container) {
      scrollHandler = updateActiveFromScroll
      container.addEventListener("scroll", scrollHandler, { passive: true })
    }
  },
)

watch(
  () => props.editor,
  (editor) => {
    if (editor) {
      extractHeadings()
      editor.on("update", onEditorUpdate)
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  props.editor?.off("update", onEditorUpdate)
  if (props.scrollContainer && scrollHandler) {
    props.scrollContainer.removeEventListener("scroll", scrollHandler)
  }
  clearTimeout(leaveTimer)
})
</script>

<style scoped>
.outline-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgb(156 163 175 / 0.3) transparent;
}
.outline-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.outline-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.outline-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgb(156 163 175 / 0.3);
  border-radius: 4px;
}
</style>
