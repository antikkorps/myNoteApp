import { CodeBlock } from "@tiptap/extension-code-block"
import { VueNodeViewRenderer } from "@tiptap/vue-3"
import type { Node } from "@tiptap/core"
import MermaidNodeView from "~/components/MermaidNodeView.vue"

export const MermaidCodeBlock: Node = CodeBlock.extend({
  addNodeView() {
    return VueNodeViewRenderer(MermaidNodeView)
  },

  addCommands() {
    return {
      ...this.parent?.(),
      insertMermaidBlock:
        (source = "graph TD\n    A[Start] --> B[End]") =>
        ({ chain }: any) => {
          return chain()
            .focus()
            .insertContent({
              type: this.name,
              attrs: { language: "mermaid" },
              content: [{ type: "text", text: source }],
            })
            .run()
        },
    }
  },
})
