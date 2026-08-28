"use client"

import { FormEvent, useDeferredValue, useRef, useState } from "react"
import useSWR from "swr"
import {
  CalendarDays,
  Download,
  FileArchive,
  FileText,
  Loader2,
  Plus,
  Search,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DashboardDocument,
  DocumentType,
  PagedResponse,
  dashboardFetcher,
  dashboardMutation,
  formatDashboardDate,
  formatFileSize,
} from "@/lib/dashboard-api"

const documentTypes: Array<{ value: DocumentType; label: string }> = [
  { value: "INVOICE", label: "Nota fiscal" },
  { value: "CONTRACT", label: "Contrato" },
  { value: "DOCUMENT", label: "Documento" },
  { value: "QUOTE", label: "Orçamento" },
  { value: "OTHER", label: "Outros" },
]
const maxFileSize = 25 * 1024 * 1024

export default function DocumentsPage() {
  const [search, setSearch] = useState("")
  const [type, setType] = useState("all")
  const [createdFrom, setCreatedFrom] = useState("")
  const [createdTo, setCreatedTo] = useState("")
  const [page, setPage] = useState(1)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [documentType, setDocumentType] = useState<DocumentType>("DOCUMENT")
  const formRef = useRef<HTMLFormElement>(null)
  const deferredSearch = useDeferredValue(search)

  const query = new URLSearchParams({ page: String(page), page_size: "20" })
  if (deferredSearch) query.set("search", deferredSearch)
  if (type !== "all") query.set("type", type)
  if (createdFrom) query.set("created_from", createdFrom)
  if (createdTo) query.set("created_to", createdTo)

  const endpoint = `/api/backoffice/documents?${query}`
  const { data, error, isLoading, mutate } = useSWR<PagedResponse<DashboardDocument>>(
    endpoint,
    dashboardFetcher,
  )
  const hasFilters = Boolean(search || type !== "all" || createdFrom || createdTo)

  function resetPage() {
    setPage(1)
  }

  function clearFilters() {
    setSearch("")
    setType("all")
    setCreatedFrom("")
    setCreatedTo("")
    setPage(1)
  }

  function resetUpload() {
    formRef.current?.reset()
    setSelectedFile(null)
    setDocumentType("DOCUMENT")
    setUploadError("")
  }

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!selectedFile) {
      setUploadError("Selecione um arquivo para continuar.")
      return
    }
    if (selectedFile.size > maxFileSize) {
      setUploadError("O arquivo deve ter no máximo 25 MB.")
      return
    }
    setUploading(true)
    setUploadError("")
    const formData = new FormData(event.currentTarget)
    formData.set("document_type", documentType)
    formData.set("file", selectedFile)
    try {
      await dashboardMutation<DashboardDocument>("/api/backoffice/documents", {
        method: "POST",
        body: formData,
      })
      setUploadOpen(false)
      resetUpload()
      setPage(1)
      await mutate()
    } catch (uploadFailure) {
      setUploadError(
        uploadFailure instanceof Error ? uploadFailure.message : "Não foi possível enviar o documento.",
      )
    } finally {
      setUploading(false)
    }
  }

  async function remove(document: DashboardDocument) {
    if (!window.confirm(`Excluir “${document.name}”? Esta ação não pode ser desfeita.`)) return
    try {
      await dashboardMutation(`/api/backoffice/documents/${document.id}`, { method: "DELETE" })
      await mutate()
    } catch (removeFailure) {
      window.alert(
        removeFailure instanceof Error ? removeFailure.message : "Não foi possível excluir o documento.",
      )
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-[#155EEF]">Arquivos</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Documentos</h1>
          <p className="mt-2 text-muted-foreground">Centralize contratos, notas e arquivos da operação.</p>
        </div>
        <Button onClick={() => setUploadOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Novo documento
        </Button>
      </div>

      <div className="grid gap-3 rounded-xl border bg-card p-4 shadow-[0_12px_40px_rgba(67,56,255,.04)] lg:grid-cols-[minmax(240px,1fr)_190px_170px_170px_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            value={search}
            onChange={(event) => { setSearch(event.target.value); resetPage() }}
            placeholder="Buscar por nome ou arquivo"
            className="pl-9"
            aria-label="Buscar documentos"
          />
        </div>
        <Select value={type} onValueChange={(value) => { setType(value); resetPage() }}>
          <SelectTrigger aria-label="Filtrar por tipo"><SelectValue /></SelectTrigger>
          <SelectContent className="omi-dashboard bg-white text-[#020617]">
            <SelectItem value="all">Todos os tipos</SelectItem>
            {documentTypes.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="relative">
          <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input type="date" value={createdFrom} onChange={(event) => { setCreatedFrom(event.target.value); resetPage() }} className="pl-9" aria-label="Criado a partir de" title="Criado a partir de" />
        </div>
        <div className="relative">
          <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input type="date" value={createdTo} min={createdFrom || undefined} onChange={(event) => { setCreatedTo(event.target.value); resetPage() }} className="pl-9" aria-label="Criado até" title="Criado até" />
        </div>
        <Button variant="ghost" size="icon" onClick={clearFilters} disabled={!hasFilters} aria-label="Limpar filtros" title="Limpar filtros">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        {isLoading ? (
          <div className="space-y-3 p-6">{[1, 2, 3, 4].map((item) => <Skeleton key={item} className="h-14 w-full" />)}</div>
        ) : error ? (
          <div className="py-16 text-center text-sm text-destructive">Não foi possível carregar os documentos.</div>
        ) : data?.results.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#4338FF]/10 text-[#4338FF]"><FileArchive className="h-6 w-6" /></span>
            <p className="mt-4 font-medium">{hasFilters ? "Nenhum documento encontrado" : "Nenhum documento salvo"}</p>
            <p className="mt-1 text-sm text-muted-foreground">{hasFilters ? "Ajuste ou limpe os filtros para tentar novamente." : "Envie o primeiro arquivo para começar sua central."}</p>
          </div>
        ) : (
          <Table>
            <TableHeader><TableRow><TableHead>Documento</TableHead><TableHead>Tipo</TableHead><TableHead className="hidden md:table-cell">Tamanho</TableHead><TableHead className="hidden lg:table-cell">Enviado por</TableHead><TableHead className="hidden sm:table-cell">Criado em</TableHead><TableHead className="w-28 text-right">Ações</TableHead></TableRow></TableHeader>
            <TableBody>
              {data?.results.map((document) => (
                <TableRow key={document.id}>
                  <TableCell><div className="flex min-w-0 items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#4338FF]/10 text-[#4338FF]"><FileText className="h-4 w-4" /></span><div className="min-w-0"><p className="max-w-xs truncate font-medium">{document.name}</p><p className="max-w-xs truncate text-xs text-muted-foreground">{document.original_file_name}</p></div></div></TableCell>
                  <TableCell><Badge variant="secondary">{document.document_type_label}</Badge></TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">{formatFileSize(document.file_size)}</TableCell>
                  <TableCell className="hidden text-muted-foreground lg:table-cell">{document.uploaded_by_name}</TableCell>
                  <TableCell className="hidden text-muted-foreground sm:table-cell">{formatDashboardDate(document.created_at)}</TableCell>
                  <TableCell><div className="flex justify-end gap-1"><Button asChild variant="ghost" size="icon"><a href={`/api/backoffice/documents/${document.id}/download`} aria-label={`Baixar ${document.name}`} title="Baixar"><Download className="h-4 w-4" /></a></Button><Button variant="ghost" size="icon" onClick={() => remove(document)} className="text-muted-foreground hover:text-destructive" aria-label={`Excluir ${document.name}`} title="Excluir"><Trash2 className="h-4 w-4" /></Button></div></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        {data && data.count > 20 ? (
          <div className="flex items-center justify-between border-t px-4 py-3"><p className="text-xs text-muted-foreground">{data.count} documentos</p><div className="flex gap-2"><Button variant="outline" size="sm" disabled={!data.previous} onClick={() => setPage((current) => current - 1)}>Anterior</Button><Button variant="outline" size="sm" disabled={!data.next} onClick={() => setPage((current) => current + 1)}>Próxima</Button></div></div>
        ) : null}
      </div>

      <Dialog open={uploadOpen} onOpenChange={(open) => { setUploadOpen(open); if (!open && !uploading) resetUpload() }}>
        <DialogContent className="omi-dashboard border-black/10 bg-white text-[#020617] sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Novo documento</DialogTitle>
            <DialogDescription>Envie um arquivo e classifique-o para facilitar a busca.</DialogDescription>
          </DialogHeader>
          <form ref={formRef} onSubmit={upload} className="space-y-5">
            <div className="space-y-2"><Label htmlFor="document-name">Nome <span className="font-normal text-muted-foreground">(opcional)</span></Label><Input id="document-name" name="name" placeholder="Preenchido com o nome do arquivo se ficar vazio" /></div>
            <div className="space-y-2"><Label>Tipo</Label><Select value={documentType} onValueChange={(value) => setDocumentType(value as DocumentType)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent className="omi-dashboard bg-white text-[#020617]">{documentTypes.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2">
              <Label htmlFor="document-file">Arquivo</Label>
              <label htmlFor="document-file" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); setSelectedFile(event.dataTransfer.files?.[0] ?? null) }} className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#4338FF]/30 bg-[#4338FF]/[.035] px-6 py-9 text-center transition hover:border-[#4338FF]/55 hover:bg-[#4338FF]/[.06]">
                <UploadCloud className="h-8 w-8 text-[#4338FF]" />
                <span className="mt-3 max-w-full truncate text-sm font-medium">{selectedFile?.name ?? "Selecione ou arraste um arquivo"}</span>
                <span className="mt-1 text-xs text-muted-foreground">PDF, Word, Excel, imagens, CSV ou texto · até 25 MB</span>
              </label>
              <Input id="document-file" name="file" type="file" required className="sr-only" accept=".pdf,.doc,.docx,.xls,.xlsx,.ods,.odt,.csv,.txt,.png,.jpg,.jpeg" onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)} />
              {selectedFile ? <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p> : null}
            </div>
            {uploadError ? <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{uploadError}</p> : null}
            <DialogFooter><Button type="button" variant="outline" onClick={() => setUploadOpen(false)} disabled={uploading}>Cancelar</Button><Button type="submit" disabled={uploading}>{uploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Enviando</> : <><UploadCloud className="mr-2 h-4 w-4" />Salvar documento</>}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
