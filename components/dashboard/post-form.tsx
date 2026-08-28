"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import useSWR, { useSWRConfig } from "swr"
import { z } from "zod"
import { ArrowLeft, ImagePlus, Plus, Save, Trash2, X } from "lucide-react"

import RichTextEditor from "@/components/dashboard/rich-text-editor"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Category, DashboardPost, dashboardFetcher, dashboardMutation } from "@/lib/dashboard-api"

const postSchema = z.object({
  title: z.string().trim().min(3, "Informe um título com pelo menos 3 caracteres."),
  slug: z.string().trim().regex(/^$|^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use letras minúsculas, números e hífens."),
  excerpt: z.string().trim().min(10, "Escreva um resumo com pelo menos 10 caracteres.").max(500, "Use no máximo 500 caracteres."),
  content: z.string().refine((value) => value.replace(/<[^>]*>/g, "").trim().length > 0, "Escreva o conteúdo do post."),
  category_id: z.string(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  published_at: z.string(),
  seo_title: z.string().max(180, "Use no máximo 180 caracteres."),
  seo_description: z.string().max(320, "Use no máximo 320 caracteres."),
})

type PostValues = z.infer<typeof postSchema>

function toLocalDateTime(value: string | null) {
  if (!value) return ""
  const date = new Date(value)
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-sm font-medium text-destructive">{message}</p> : null
}

export default function PostForm({ post }: { post?: DashboardPost }) {
  const router = useRouter()
  const { mutate } = useSWRConfig()
  const { data: categories, mutate: mutateCategories } = useSWR<Category[]>("/api/backoffice/categories", dashboardFetcher)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState(post?.cover_image_url ?? "")
  const [removeCover, setRemoveCover] = useState(false)
  const [requestError, setRequestError] = useState("")
  const [categoryDialog, setCategoryDialog] = useState(false)
  const [categoryName, setCategoryName] = useState("")
  const [creatingCategory, setCreatingCategory] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const form = useForm<PostValues>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: post?.title ?? "", slug: post?.slug ?? "", excerpt: post?.excerpt ?? "",
      content: post?.content ?? "<p></p>", category_id: post?.category?.id ?? "",
      status: post?.status ?? "DRAFT", published_at: toLocalDateTime(post?.published_at ?? null),
      seo_title: post?.seo_title ?? "", seo_description: post?.seo_description ?? "",
    },
  })

  useEffect(() => () => {
    if (coverPreview.startsWith("blob:")) URL.revokeObjectURL(coverPreview)
  }, [coverPreview])

  const chooseCover = (file?: File) => {
    if (!file) return
    if (!file.type.startsWith("image/")) { setRequestError("Selecione um arquivo de imagem."); return }
    if (file.size > 5 * 1024 * 1024) { setRequestError("A capa deve ter no máximo 5 MB."); return }
    if (coverPreview.startsWith("blob:")) URL.revokeObjectURL(coverPreview)
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
    setRemoveCover(false)
    setRequestError("")
  }

  const clearCover = () => {
    if (coverPreview.startsWith("blob:")) URL.revokeObjectURL(coverPreview)
    setCoverFile(null)
    setCoverPreview("")
    setRemoveCover(Boolean(post?.cover_image_url))
  }

  const submit = form.handleSubmit(async (values) => {
    setRequestError("")
    const payload = new FormData()
    Object.entries(values).forEach(([key, value]) => {
      if (key === "published_at") payload.append(key, value ? new Date(value).toISOString() : "")
      else payload.append(key, value)
    })
    if (coverFile) payload.append("cover_image", coverFile)
    if (removeCover) payload.append("remove_cover_image", "true")
    try {
      const saved = await dashboardMutation<DashboardPost>(post ? `/api/backoffice/posts/${post.slug}` : "/api/backoffice/posts", { method: post ? "PATCH" : "POST", body: payload })
      await mutate((key) => typeof key === "string" && (key.startsWith("/api/backoffice/posts?") || key === "/api/backoffice/posts/summary"))
      router.replace(`/dashboard/posts/${saved.slug}/editar`)
      router.refresh()
      form.reset({ ...values, slug: saved.slug, published_at: toLocalDateTime(saved.published_at) })
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : "Não foi possível salvar o post.")
    }
  })

  const createCategory = async () => {
    if (!categoryName.trim()) return
    setCreatingCategory(true)
    try {
      const category = await dashboardMutation<Category>("/api/backoffice/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: categoryName.trim() }) })
      await mutateCategories()
      form.setValue("category_id", category.id, { shouldDirty: true })
      setCategoryName("")
      setCategoryDialog(false)
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : "Não foi possível criar a categoria.")
    } finally { setCreatingCategory(false) }
  }

  const deletePost = async () => {
    if (!post) return
    setDeleting(true)
    try {
      await dashboardMutation(`/api/backoffice/posts/${post.slug}`, { method: "DELETE" })
      await mutate((key) => typeof key === "string" && key.startsWith("/api/backoffice/posts"))
      router.replace("/dashboard/posts")
      router.refresh()
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : "Não foi possível excluir o post.")
      setDeleting(false)
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto w-full max-w-7xl space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3"><Button asChild type="button" variant="outline" size="icon"><Link href="/dashboard/posts"><ArrowLeft className="h-4 w-4" /></Link></Button><div><p className="text-sm font-medium text-[#155EEF]">{post ? "Editar documento" : "Novo documento"}</p><h1 className="text-2xl font-semibold tracking-tight">{post?.title || "Criar post"}</h1></div></div>
        <div className="flex gap-2">{post ? <AlertDialog><AlertDialogTrigger asChild><Button type="button" variant="outline" className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Excluir</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Excluir este post?</AlertDialogTitle><AlertDialogDescription>O documento e sua imagem de capa serão removidos permanentemente.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction disabled={deleting} onClick={deletePost} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">{deleting ? "Excluindo..." : "Excluir"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog> : null}<Button type="submit" disabled={form.formState.isSubmitting}><Save className="mr-2 h-4 w-4" />{form.formState.isSubmitting ? "Salvando..." : "Salvar"}</Button></div>
      </div>
      {requestError ? <Alert variant="destructive"><AlertDescription>{requestError}</AlertDescription></Alert> : null}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <Card><CardHeader><CardTitle>Conteúdo</CardTitle></CardHeader><CardContent className="space-y-5">
            <div className="space-y-2"><Label htmlFor="title">Título</Label><Input id="title" {...form.register("title")} placeholder="Título do documento" /><FieldError message={form.formState.errors.title?.message} /></div>
            <div className="space-y-2"><Label htmlFor="slug">Slug</Label><Input id="slug" {...form.register("slug")} placeholder="gerado-automaticamente" /><p className="text-xs text-muted-foreground">Deixe vazio para gerar a partir do título.</p><FieldError message={form.formState.errors.slug?.message} /></div>
            <div className="space-y-2"><Label htmlFor="excerpt">Resumo</Label><Textarea id="excerpt" {...form.register("excerpt")} rows={4} placeholder="Uma introdução curta para as listagens e mecanismos de busca." /><FieldError message={form.formState.errors.excerpt?.message} /></div>
            <div className="space-y-2"><Label>Corpo do post</Label><Controller control={form.control} name="content" render={({ field }) => <RichTextEditor value={field.value} onChange={field.onChange} disabled={form.formState.isSubmitting} />} /><FieldError message={form.formState.errors.content?.message} /></div>
          </CardContent></Card>
          <Card><CardHeader><CardTitle>Imagem de capa</CardTitle></CardHeader><CardContent>{coverPreview ? <div className="relative aspect-[16/8] overflow-hidden rounded-lg border bg-muted"><Image src={coverPreview} alt="Prévia da capa" fill unoptimized className="object-cover" /><Button type="button" size="icon" variant="secondary" onClick={clearCover} className="absolute right-3 top-3" aria-label="Remover capa"><X className="h-4 w-4" /></Button></div> : <label className="flex aspect-[16/7] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 text-center transition-colors hover:bg-muted/60"><ImagePlus className="h-8 w-8 text-muted-foreground" /><span className="mt-3 text-sm font-medium">Enviar imagem de capa</span><span className="mt-1 text-xs text-muted-foreground">JPG, PNG ou WebP, até 5 MB</span><Input type="file" accept="image/*" className="sr-only" onChange={(event) => chooseCover(event.target.files?.[0])} /></label>}</CardContent></Card>
          <Card><CardHeader><CardTitle>SEO</CardTitle></CardHeader><CardContent className="space-y-5"><div className="space-y-2"><Label htmlFor="seo_title">Título SEO</Label><Input id="seo_title" {...form.register("seo_title")} /><FieldError message={form.formState.errors.seo_title?.message} /></div><div className="space-y-2"><Label htmlFor="seo_description">Descrição SEO</Label><Textarea id="seo_description" {...form.register("seo_description")} rows={3} /><FieldError message={form.formState.errors.seo_description?.message} /></div></CardContent></Card>
        </div>
        <div className="space-y-6">
          <Card><CardHeader><CardTitle>Publicação</CardTitle></CardHeader><CardContent className="space-y-5">
            <div className="space-y-2"><Label>Status</Label><Controller control={form.control} name="status" render={({ field }) => <Select value={field.value} onValueChange={field.onChange}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="DRAFT">Rascunho</SelectItem><SelectItem value="PUBLISHED">Publicado</SelectItem><SelectItem value="ARCHIVED">Arquivado</SelectItem></SelectContent></Select>} /></div>
            <div className="space-y-2"><Label htmlFor="published_at">Data de publicação</Label><Input id="published_at" type="datetime-local" {...form.register("published_at")} /><p className="text-xs text-muted-foreground">Ao publicar sem data, o backend usa o horário atual.</p></div>
            <div className="space-y-2"><div className="flex items-center justify-between"><Label>Categoria</Label><Dialog open={categoryDialog} onOpenChange={setCategoryDialog}><DialogTrigger asChild><Button type="button" variant="ghost" size="sm"><Plus className="mr-1 h-3.5 w-3.5" />Criar</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Nova categoria</DialogTitle><DialogDescription>Organize os documentos por assunto.</DialogDescription></DialogHeader><div className="space-y-2"><Label htmlFor="category-name">Nome</Label><Input id="category-name" value={categoryName} onChange={(event) => setCategoryName(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); void createCategory() } }} /></div><DialogFooter><Button type="button" onClick={createCategory} disabled={creatingCategory || !categoryName.trim()}>{creatingCategory ? "Criando..." : "Criar categoria"}</Button></DialogFooter></DialogContent></Dialog></div><Controller control={form.control} name="category_id" render={({ field }) => <Select value={field.value || "none"} onValueChange={(value) => field.onChange(value === "none" ? "" : value)}><SelectTrigger><SelectValue placeholder="Sem categoria" /></SelectTrigger><SelectContent><SelectItem value="none">Sem categoria</SelectItem>{categories?.map((category) => <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>)}</SelectContent></Select>} /></div>
          </CardContent></Card>
        </div>
      </div>
    </form>
  )
}
