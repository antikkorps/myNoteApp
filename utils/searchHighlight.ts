import { Extension } from "@tiptap/core"
import { Plugin, PluginKey } from "@tiptap/pm/state"
import { Decoration, DecorationSet } from "@tiptap/pm/view"

export interface SearchHighlightStorage {
  searchTerm: string
  currentIndex: number
  totalMatches: number
}

const searchPluginKey = new PluginKey("searchHighlight")

function findMatches(doc: any, searchTerm: string): { from: number; to: number }[] {
  if (!searchTerm) return []

  const results: { from: number; to: number }[] = []
  const term = searchTerm.toLowerCase()

  doc.descendants((node: any, pos: number) => {
    if (!node.isText) return
    const text = node.text!.toLowerCase()
    let index = text.indexOf(term)
    while (index !== -1) {
      results.push({ from: pos + index, to: pos + index + searchTerm.length })
      index = text.indexOf(term, index + 1)
    }
  })

  return results
}

export const SearchHighlight = Extension.create<{}, SearchHighlightStorage>({
  name: "searchHighlight",

  addStorage() {
    return {
      searchTerm: "",
      currentIndex: 0,
      totalMatches: 0,
    }
  },

  addCommands() {
    return {
      setSearchTerm:
        (term: string) =>
        ({ editor }) => {
          editor.storage.searchHighlight.searchTerm = term
          editor.storage.searchHighlight.currentIndex = 0

          // Force plugin state recalculation
          const { tr } = editor.state
          tr.setMeta(searchPluginKey, { searchTerm: term, currentIndex: 0 })
          editor.view.dispatch(tr)
          return true
        },

      nextMatch:
        () =>
        ({ editor }) => {
          const storage = editor.storage.searchHighlight
          if (storage.totalMatches === 0) return false
          storage.currentIndex = (storage.currentIndex + 1) % storage.totalMatches

          const { tr } = editor.state
          tr.setMeta(searchPluginKey, {
            searchTerm: storage.searchTerm,
            currentIndex: storage.currentIndex,
          })
          editor.view.dispatch(tr)
          return true
        },

      prevMatch:
        () =>
        ({ editor }) => {
          const storage = editor.storage.searchHighlight
          if (storage.totalMatches === 0) return false
          storage.currentIndex =
            (storage.currentIndex - 1 + storage.totalMatches) % storage.totalMatches

          const { tr } = editor.state
          tr.setMeta(searchPluginKey, {
            searchTerm: storage.searchTerm,
            currentIndex: storage.currentIndex,
          })
          editor.view.dispatch(tr)
          return true
        },

      clearSearch:
        () =>
        ({ editor }) => {
          editor.storage.searchHighlight.searchTerm = ""
          editor.storage.searchHighlight.currentIndex = 0
          editor.storage.searchHighlight.totalMatches = 0

          const { tr } = editor.state
          tr.setMeta(searchPluginKey, { searchTerm: "", currentIndex: 0 })
          editor.view.dispatch(tr)
          return true
        },
    }
  },

  addProseMirrorPlugins() {
    const extensionThis = this

    return [
      new Plugin({
        key: searchPluginKey,

        state: {
          init() {
            return DecorationSet.empty
          },

          apply(tr, oldDecorations, _oldState, newState) {
            const meta = tr.getMeta(searchPluginKey)
            if (!meta && !tr.docChanged) return oldDecorations

            const storage = extensionThis.storage
            const searchTerm = meta?.searchTerm ?? storage.searchTerm
            const currentIndex = meta?.currentIndex ?? storage.currentIndex

            if (!searchTerm) {
              storage.totalMatches = 0
              return DecorationSet.empty
            }

            const matches = findMatches(newState.doc, searchTerm)
            storage.totalMatches = matches.length

            if (matches.length === 0) return DecorationSet.empty

            // Clamp currentIndex
            const safeIndex = Math.min(currentIndex, matches.length - 1)
            storage.currentIndex = safeIndex

            const decorations = matches.map((match, i) =>
              Decoration.inline(match.from, match.to, {
                class: i === safeIndex ? "search-match search-match-current" : "search-match",
              }),
            )

            return DecorationSet.create(newState.doc, decorations)
          },
        },

        props: {
          decorations(state) {
            return this.getState(state)
          },
        },
      }),
    ]
  },
})
