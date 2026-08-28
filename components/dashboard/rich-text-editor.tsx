"use client"

import { useEffect } from "react"
import { EditorContent, useEditor } from "@tiptap/react"
import Placeholder from "@tiptap/extension-placeholder"
import StarterKit from "@tiptap/starter-kit"
import {
  Bold,
  Code2,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Strikethrough,
  Underline,
  Undo2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type RichTextEditorProps = {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export default function RichTextEditor({ value, onChange, disabled }: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    editable: !disabled,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] }, link: { openOnClick: false } }),
      Placeholder.configure({ placeholder: "Escreva o conteúdo do documento..." }),
    ],
    content: value,
    onUpdate: ({ editor: currentEditor }) => onChange(currentEditor.getHTML()),
  })

  useEffect(() => {
    if (!editor || editor.getHTML() === value) return
    editor.commands.setContent(value, { emitUpdate: false })
  }, [editor, value])

  useEffect(() => {
    editor?.setEditable(!disabled)
  }, [disabled, editor])

  if (!editor) return <div className="min-h-72 animate-pulse rounded-lg bg-muted" />

  const addLink = () => {
    const previousUrl = editor.getAttributes("link").href as string | undefined
    const url = window.prompt("URL do link", previousUrl ?? "https://")
    if (url === null) return
    if (!url.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run()
  }

  const tools = [
    { label: "Título 2", icon: Heading2, active: editor.isActive("heading", { level: 2 }), run: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
    { label: "Título 3", icon: Heading3, active: editor.isActive("heading", { level: 3 }), run: () => editor.chain().focus().toggleHeading({ level: 3 }).run() },
    { label: "Negrito", icon: Bold, active: editor.isActive("bold"), run: () => editor.chain().focus().toggleBold().run() },
    { label: "Itálico", icon: Italic, active: editor.isActive("italic"), run: () => editor.chain().focus().toggleItalic().run() },
    { label: "Sublinhado", icon: Underline, active: editor.isActive("underline"), run: () => editor.chain().focus().toggleUnderline().run() },
    { label: "Tachado", icon: Strikethrough, active: editor.isActive("strike"), run: () => editor.chain().focus().toggleStrike().run() },
    { label: "Lista", icon: List, active: editor.isActive("bulletList"), run: () => editor.chain().focus().toggleBulletList().run() },
    { label: "Lista numerada", icon: ListOrdered, active: editor.isActive("orderedList"), run: () => editor.chain().focus().toggleOrderedList().run() },
    { label: "Citação", icon: Quote, active: editor.isActive("blockquote"), run: () => editor.chain().focus().toggleBlockquote().run() },
    { label: "Bloco de código", icon: Code2, active: editor.isActive("codeBlock"), run: () => editor.chain().focus().toggleCodeBlock().run() },
  ]

  return (
    <div className="overflow-hidden rounded-lg border bg-background">
      <div className="flex flex-wrap items-center gap-1 border-b bg-muted/40 p-2">
        {tools.map(({ label, icon: Icon, active, run }) => (
          <Button key={label} type="button" variant="ghost" size="icon" aria-label={label} title={label} disabled={disabled} onClick={run} className={cn("h-8 w-8", active && "bg-accent text-foreground")}>
            <Icon className="h-4 w-4" />
          </Button>
        ))}
        <span className="mx-1 h-5 w-px bg-border" />
        <Button type="button" variant="ghost" size="icon" aria-label="Adicionar link" title="Adicionar link" disabled={disabled} onClick={addLink} className={cn("h-8 w-8", editor.isActive("link") && "bg-accent")}><Link2 className="h-4 w-4" /></Button>
        <Button type="button" variant="ghost" size="icon" aria-label="Divisória" title="Divisória" disabled={disabled} onClick={() => editor.chain().focus().setHorizontalRule().run()} className="h-8 w-8"><Minus className="h-4 w-4" /></Button>
        <span className="mx-1 h-5 w-px bg-border" />
        <Button type="button" variant="ghost" size="icon" aria-label="Desfazer" title="Desfazer" disabled={disabled || !editor.can().undo()} onClick={() => editor.chain().focus().undo().run()} className="h-8 w-8"><Undo2 className="h-4 w-4" /></Button>
        <Button type="button" variant="ghost" size="icon" aria-label="Refazer" title="Refazer" disabled={disabled || !editor.can().redo()} onClick={() => editor.chain().focus().redo().run()} className="h-8 w-8"><Redo2 className="h-4 w-4" /></Button>
      </div>
      <EditorContent editor={editor} className="min-h-80" />
    </div>
  )
}
