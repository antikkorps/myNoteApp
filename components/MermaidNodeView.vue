<template>
  <NodeViewWrapper class="mermaid-block" :class="{ 'is-mermaid': isMermaid }">
    <div v-if="isMermaid" class="mermaid-toolbar">
      <UButton
        size="xs"
        variant="ghost"
        :icon="showSource ? 'i-lucide-eye' : 'i-lucide-code'"
        :label="showSource ? 'Preview' : 'Source'"
        @click="showSource = !showSource"
      />
      <UDropdownMenu :items="templateMenu" :content="{ align: 'start' }">
        <UButton size="xs" variant="ghost" icon="i-lucide-layout-template" label="Templates" />
      </UDropdownMenu>
      <a
        href="https://mermaid.js.org/intro/syntax-reference.html"
        target="_blank"
        rel="noopener noreferrer"
        contenteditable="false"
        class="mermaid-doc-link"
        title="Mermaid syntax reference"
        @mousedown.stop
        @click.stop
      >
        <UIcon name="i-lucide-external-link" />
      </a>
      <span class="mermaid-label">mermaid</span>
    </div>

    <pre v-show="!isMermaid || showSource"><NodeViewContent as="code" :class="codeClass" /></pre>

    <div
      v-if="isMermaid && !showSource"
      ref="previewRef"
      class="mermaid-preview"
      @click="showSource = true"
    >
      <div v-if="error" class="mermaid-error">{{ error }}</div>
    </div>
  </NodeViewWrapper>
</template>

<script setup lang="ts">
import { NodeViewWrapper, NodeViewContent, nodeViewProps } from "@tiptap/vue-3"

const props = defineProps(nodeViewProps)

const isMermaid = computed(() => props.node.attrs.language === "mermaid")
const codeClass = computed(() =>
  props.node.attrs.language ? `language-${props.node.attrs.language}` : null,
)

const showSource = ref(false)
const previewRef = ref<HTMLElement | null>(null)
const error = ref<string | null>(null)

let renderTimer: ReturnType<typeof setTimeout> | null = null
let renderSeq = 0

const templates: Record<string, string> = {
  flowchart: `flowchart TD
    A[Start] --> B{Decision?}
    B -- Yes --> C[Do thing]
    B -- No --> D[Skip]
    C --> E[End]
    D --> E`,
  sequence: `sequenceDiagram
    participant U as User
    participant S as Server
    U->>S: Request
    S-->>U: Response`,
  class: `classDiagram
    class Animal {
      +String name
      +int age
      +eat()
    }
    class Dog
    Animal <|-- Dog`,
  state: `stateDiagram-v2
    [*] --> Idle
    Idle --> Active : start
    Active --> Idle : stop
    Active --> [*] : done`,
  er: `erDiagram
    USER ||--o{ NOTE : writes
    USER {
      string id
      string email
    }
    NOTE {
      int id
      string title
    }`,
  gantt: `gantt
    title Sprint
    dateFormat YYYY-MM-DD
    axisFormat %d/%m
    section Tasks
      Design   :a1, 2026-04-14, 3d
      Build    :after a1, 4d
      Test     :3d`,
  pie: `pie title Répartition
    "A" : 40
    "B" : 35
    "C" : 25`,
  mindmap: `mindmap
  root((Idea))
    Branch1
      Leaf A
      Leaf B
    Branch2
      Leaf C`,
}

function applyTemplate(key: string) {
  const source = templates[key]
  if (!source) return
  const from = typeof props.getPos === "function" ? props.getPos() : 0
  if (from === undefined) return
  const to = from + props.node.nodeSize
  props.editor
    .chain()
    .focus()
    .deleteRange({ from, to })
    .insertContentAt(from, {
      type: props.node.type.name,
      attrs: { language: "mermaid" },
      content: [{ type: "text", text: source }],
    })
    .run()
}

const templateMenu = computed(() => [
  Object.keys(templates).map((k) => ({
    label: k.charAt(0).toUpperCase() + k.slice(1),
    onSelect: () => applyTemplate(k),
  })),
])

async function renderMermaid() {
  if (!isMermaid.value || showSource.value || !previewRef.value) return

  const source = props.node.textContent.trim()
  if (!source) {
    previewRef.value.innerHTML = '<div class="mermaid-empty">Empty diagram — click to edit</div>'
    error.value = null
    return
  }

  const seq = ++renderSeq
  try {
    const mermaid = (await import("mermaid")).default
    mermaid.initialize({ startOnLoad: false, theme: "default", securityLevel: "loose" })
    const id = `mermaid-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    const { svg } = await mermaid.render(id, source)
    if (seq !== renderSeq || !previewRef.value) return
    previewRef.value.innerHTML = svg
    error.value = null
  } catch (err: any) {
    if (seq !== renderSeq) return
    error.value = err?.message || String(err)
  }
}

function scheduleRender() {
  if (renderTimer) clearTimeout(renderTimer)
  renderTimer = setTimeout(renderMermaid, 300)
}

watch(() => props.node.textContent, scheduleRender)
watch(showSource, (v) => {
  if (!v) nextTick(renderMermaid)
})
onMounted(() => {
  nextTick(renderMermaid)
})
</script>

<style scoped>
.mermaid-block {
  position: relative;
  margin: 0.75rem 0;
}
.mermaid-toolbar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.5rem;
  background: var(--ui-bg-muted, #f3f4f6);
  border: 1px solid var(--ui-border, #e5e7eb);
  border-bottom: none;
  border-radius: 6px 6px 0 0;
}
:global(.dark) .mermaid-toolbar {
  background: #1f2937;
  border-color: #374151;
}
.mermaid-doc-link {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem;
  color: var(--ui-text-muted, #6b7280);
  border-radius: 4px;
  cursor: pointer;
}
.mermaid-doc-link:hover {
  color: var(--ui-primary, #6366f1);
  background: var(--ui-bg-elevated, #e5e7eb);
}
.mermaid-label {
  font-size: 0.75rem;
  color: var(--ui-text-muted, #6b7280);
  margin-left: auto;
}
.mermaid-block.is-mermaid :deep(pre) {
  border-radius: 0 0 6px 6px;
  margin: 0;
}
.mermaid-preview {
  display: flex;
  justify-content: center;
  padding: 1rem;
  background: var(--ui-bg, white);
  border: 1px solid var(--ui-border, #e5e7eb);
  border-radius: 0 0 6px 6px;
  cursor: pointer;
  overflow-x: auto;
}
:global(.dark) .mermaid-preview {
  background: #111827;
  border-color: #374151;
}
.mermaid-preview :deep(svg) {
  max-width: 100%;
  height: auto;
}
.mermaid-empty {
  color: var(--ui-text-muted, #6b7280);
  font-style: italic;
}
.mermaid-error {
  color: #dc2626;
  font-family: monospace;
  font-size: 0.85rem;
  white-space: pre-wrap;
  padding: 0.5rem;
  background: #fef2f2;
  border-radius: 4px;
}
:global(.dark) .mermaid-error {
  background: #450a0a;
  color: #fca5a5;
}
</style>
