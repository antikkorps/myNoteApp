import type { EditorToolbarItem } from "@nuxt/ui"
import type { Editor } from "@tiptap/vue-3"

export const fixedItems: EditorToolbarItem[][] = [
  // History controls
  [
    {
      kind: "undo",
      icon: "i-lucide-undo",
      tooltip: { text: "Undo" },
    },
    {
      kind: "redo",
      icon: "i-lucide-redo",
      tooltip: { text: "Redo" },
    },
  ],
  // Block types
  [
    {
      icon: "i-lucide-heading",
      tooltip: { text: "Headings" },
      content: {
        align: "start",
      },
      items: [
        {
          kind: "heading",
          level: 1,
          icon: "i-lucide-heading-1",
          label: "Heading 1",
        },
        {
          kind: "heading",
          level: 2,
          icon: "i-lucide-heading-2",
          label: "Heading 2",
        },
        {
          kind: "heading",
          level: 3,
          icon: "i-lucide-heading-3",
          label: "Heading 3",
        },
        {
          kind: "heading",
          level: 4,
          icon: "i-lucide-heading-4",
          label: "Heading 4",
        },
      ],
    },
    {
      icon: "i-lucide-list",
      tooltip: { text: "Lists" },
      content: {
        align: "start",
      },
      items: [
        {
          kind: "bulletList",
          icon: "i-lucide-list",
          label: "Bullet List",
        },
        {
          kind: "orderedList",
          icon: "i-lucide-list-ordered",
          label: "Ordered List",
        },
      ],
    },
    {
      kind: "blockquote",
      icon: "i-lucide-text-quote",
      tooltip: { text: "Blockquote" },
    },
    {
      kind: "codeBlock",
      icon: "i-lucide-square-code",
      tooltip: { text: "Code Block" },
    },
    {
      kind: "horizontalRule",
      icon: "i-lucide-separator-horizontal",
      tooltip: { text: "Horizontal Rule" },
    },
  ],
  // Text formatting
  [
    {
      kind: "mark",
      mark: "bold",
      icon: "i-lucide-bold",
      tooltip: { text: "Bold" },
    },
    {
      kind: "mark",
      mark: "italic",
      icon: "i-lucide-italic",
      tooltip: { text: "Italic" },
    },
    {
      kind: "mark",
      mark: "underline",
      icon: "i-lucide-underline",
      tooltip: { text: "Underline" },
    },
    {
      kind: "mark",
      mark: "strike",
      icon: "i-lucide-strikethrough",
      tooltip: { text: "Strikethrough" },
    },
    {
      kind: "mark",
      mark: "code",
      icon: "i-lucide-code",
      tooltip: { text: "Code" },
    },
  ],
  // Link
  [
    {
      kind: "link",
      icon: "i-lucide-link",
      tooltip: { text: "Link" },
    },
  ],
  // Text alignment
  [
    {
      icon: "i-lucide-align-justify",
      tooltip: { text: "Text Align" },
      content: {
        align: "end",
      },
      items: [
        {
          kind: "textAlign",
          align: "left",
          icon: "i-lucide-align-left",
          label: "Align Left",
        },
        {
          kind: "textAlign",
          align: "center",
          icon: "i-lucide-align-center",
          label: "Align Center",
        },
        {
          kind: "textAlign",
          align: "right",
          icon: "i-lucide-align-right",
          label: "Align Right",
        },
        {
          kind: "textAlign",
          align: "justify",
          icon: "i-lucide-align-justify",
          label: "Align Justify",
        },
      ],
    },
  ],
]

export function imageBubbleItems(editor: Editor): EditorToolbarItem[][] {
  const node = editor.state.doc.nodeAt(editor.state.selection.from)

  return [
    [
      {
        icon: "i-lucide-download",
        tooltip: { text: "Download" },
        to: node?.attrs?.src,
        download: true,
      } as EditorToolbarItem,
    ],
    [
      {
        icon: "i-lucide-trash",
        tooltip: { text: "Delete" },
        onClick: () => {
          const { state } = editor
          const pos = state.selection.from
          const selectedNode = state.doc.nodeAt(pos)

          if (selectedNode && selectedNode.type.name === "image") {
            editor.chain().focus().deleteRange({ from: pos, to: pos + selectedNode.nodeSize }).run()
          }
        },
      } as EditorToolbarItem,
    ],
  ]
}

export const bubbleItems: EditorToolbarItem[][] = [
  [
    { kind: "mark", mark: "bold", icon: "i-lucide-bold", tooltip: { text: "Bold" } },
    {
      kind: "mark",
      mark: "italic",
      icon: "i-lucide-italic",
      tooltip: { text: "Italic" },
    },
    {
      kind: "mark",
      mark: "underline",
      icon: "i-lucide-underline",
      tooltip: { text: "Underline" },
    },
    {
      kind: "mark",
      mark: "strike",
      icon: "i-lucide-strikethrough",
      tooltip: { text: "Strike" },
    },
    { kind: "mark", mark: "code", icon: "i-lucide-code", tooltip: { text: "Code" } },
  ],
  [{ kind: "link", icon: "i-lucide-link", tooltip: { text: "Link" } }],
]
