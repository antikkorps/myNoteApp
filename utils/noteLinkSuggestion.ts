import { PluginKey } from "@tiptap/pm/state"
import Suggestion from "@tiptap/suggestion"
import { VueRenderer } from "@tiptap/vue-3"
import type { Editor } from "@tiptap/core"
import NoteLinkSuggestionComponent from "~/components/NoteLinkSuggestion.vue"

export interface NoteLinkItem {
  id: number
  title: string
}

// Guard against duplicate registration on the same editor
const setupEditors = new WeakSet<Editor>()

export function registerNoteLinkSuggestion(editor: Editor, getItems: () => NoteLinkItem[]) {
  if (setupEditors.has(editor)) return
  setupEditors.add(editor)

  // Popup state — shared between render callbacks and capture-phase handler
  let popupActive = false
  let selectedIndex = 0
  let currentItems: NoteLinkItem[] = []
  let commandFn: ((item: NoteLinkItem) => void) | null = null
  let component: VueRenderer | null = null

  function selectCurrent() {
    const item = currentItems[selectedIndex]
    if (item) commandFn?.(item)
  }

  function moveDown() {
    selectedIndex = (selectedIndex + 1) % Math.max(currentItems.length, 1)
    component?.updateProps({ selectedIndex })
  }

  function moveUp() {
    selectedIndex =
      (selectedIndex - 1 + currentItems.length) % Math.max(currentItems.length, 1)
    component?.updateProps({ selectedIndex })
  }

  const suggestionPlugin = Suggestion<NoteLinkItem>({
    pluginKey: new PluginKey("noteLinkSuggestion"),
    editor,
    char: "[[",
    allowSpaces: true,

    items: ({ query }) => {
      const all = getItems()
      if (!query) return all.slice(0, 10)
      const q = query.toLowerCase()
      return all
        .filter((n) => (n.title || "Untitled").toLowerCase().includes(q))
        .slice(0, 10)
    },

    command: ({ editor: ed, range, props: item }) => {
      ed.chain()
        .focus()
        .insertContentAt(range, [
          {
            type: "text",
            text: item.title || "Untitled",
            marks: [{ type: "link", attrs: { href: `note://${item.id}` } }],
          },
          { type: "text", text: " " },
        ])
        .run()
    },

    render: () => {
      function updatePosition(clientRect?: (() => DOMRect | null) | null) {
        if (!component?.element || !clientRect) return
        const rect = clientRect()
        if (!rect) return
        const el = component.element as HTMLElement
        el.style.left = `${rect.left}px`
        el.style.top = `${rect.bottom + 4}px`
      }

      return {
        onStart(props) {
          currentItems = props.items
          commandFn = props.command
          selectedIndex = 0
          popupActive = true

          component = new VueRenderer(NoteLinkSuggestionComponent, {
            props: {
              items: props.items,
              selectedIndex,
              onSelect: (index: number) => {
                const item = currentItems[index]
                if (item) commandFn?.(item)
              },
              onHover: (index: number) => {
                selectedIndex = index
                component?.updateProps({ selectedIndex })
              },
            },
            editor: props.editor,
          })

          if (component.element) {
            const el = component.element as HTMLElement
            el.style.position = "fixed"
            el.style.zIndex = "50"
            document.body.appendChild(el)
          }

          updatePosition(props.clientRect)
        },

        onUpdate(props) {
          currentItems = props.items
          commandFn = props.command
          selectedIndex = 0

          component?.updateProps({
            items: props.items,
            selectedIndex,
          })

          updatePosition(props.clientRect)
        },

        // Keep onKeyDown as fallback, but real handling is in capture-phase listener below
        onKeyDown({ event }) {
          if (event.key === "ArrowDown") { moveDown(); return true }
          if (event.key === "ArrowUp") { moveUp(); return true }
          if (event.key === "Enter") { selectCurrent(); return true }
          if (event.key === "Escape") { return true }
          return false
        },

        onExit() {
          popupActive = false
          commandFn = null
          component?.destroy()
          component = null
          currentItems = []
        },
      }
    },
  })

  editor.registerPlugin(suggestionPlugin)

  // Capture-phase keyboard handler on PARENT element — fires before
  // ProseMirror's handlers on view.dom, so we get first shot at all keys
  const parentEl = editor.view.dom.parentElement
  if (parentEl) {
    parentEl.addEventListener(
      "keydown",
      (event: KeyboardEvent) => {
        if (!popupActive) return

        switch (event.key) {
          case "ArrowDown":
            event.preventDefault()
            event.stopPropagation()
            moveDown()
            break
          case "ArrowUp":
            event.preventDefault()
            event.stopPropagation()
            moveUp()
            break
          case "Enter":
            event.preventDefault()
            event.stopPropagation()
            selectCurrent()
            break
          case "Escape":
            event.preventDefault()
            event.stopPropagation()
            break
        }
      },
      true,
    )

    // Intercept note link drops — prevent ProseMirror from also inserting plain text
    parentEl.addEventListener(
      "drop",
      (event: DragEvent) => {
        const data = event.dataTransfer?.getData("application/note-link")
        if (!data) return
        event.preventDefault()
        event.stopPropagation()
        try {
          const { id, title } = JSON.parse(data)
          const pos = editor.view.posAtCoords({ left: event.clientX, top: event.clientY })
          if (pos) {
            const linkMark = editor.view.state.schema.marks.link.create({
              href: `note://${id}`,
            })
            const textNode = editor.view.state.schema.text(title || "Untitled", [linkMark])
            const space = editor.view.state.schema.text(" ")
            const tr = editor.view.state.tr.insert(pos.pos, [textNode, space])
            editor.view.dispatch(tr)
          }
        } catch {
          // ignore malformed data
        }
      },
      true,
    )
  }
}
