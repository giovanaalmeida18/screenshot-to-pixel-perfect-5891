import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Pencil, Trash2, Upload } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { AdminToolbar, ConfirmarExclusao, EstadoVazio } from "@/components/admin/AdminShared";
import { FormField } from "@/components/FormField";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { categoriasMateriais } from "@/lib/data/constants";
import { materiaisQuery } from "@/lib/data/queries";
import type { Material, MaterialTipo } from "@/lib/data/types";
import { formatarData } from "@/lib/format";

const tipoOpcoes: { value: MaterialTipo; label: string }[] = [
  { value: "apostila", label: "Apostila" },
  { value: "video", label: "Vídeo" },
  { value: "tutorial", label: "Tutorial" },
];

export function AdminMateriais() {
  const queryClient = useQueryClient();
  const { data: materiais = [] } = useQuery(materiaisQuery);
  const [busca, setBusca] = useState("");
  const [editando, setEditando] = useState<Material | "novo" | null>(null);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState(categoriasMateriais[0]!);
  const [tipo, setTipo] = useState<MaterialTipo>("apostila");
  const [url, setUrl] = useState("");
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [salvando, setSalvando] = useState(false);
  const inputArquivo = useRef<HTMLInputElement>(null);

  const lista = materiais.filter((m) => m.titulo.toLowerCase().includes(busca.toLowerCase()));

  const abrir = (m: Material | "novo") => {
    setEditando(m);
    setTitulo(m === "novo" ? "" : m.titulo);
    setDescricao(m === "novo" ? "" : (m.descricao ?? ""));
    setCategoria(m === "novo" ? categoriasMateriais[0]! : m.categoria);
    setTipo(m === "novo" ? "apostila" : m.tipo);
    setUrl(m === "novo" ? "" : (m.externalUrl ?? ""));
    setArquivo(null);
  };

  const salvar = async (e: FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) {
      toast.error("Digite o título do material.");
      return;
    }
    setSalvando(true);
    let filePath = editando !== "novo" ? (editando as Material).filePath : null;
    if (arquivo) {
      const caminho = `${Date.now()}-${arquivo.name.replace(/[^\w.-]+/g, "_")}`;
      const { error: erroUpload } = await supabase.storage.from("materiais").upload(caminho, arquivo, { upsert: true });
      if (erroUpload) {
        setSalvando(false);
        toast.error("Não foi possível enviar o arquivo. Tente novamente.");
        return;
      }
      filePath = caminho;
    }
    const dados = {
      title: titulo.trim(),
      description: descricao.trim() || null,
      category: categoria,
      content_type: tipo,
      external_url: url.trim() || null,
      file_path: filePath,
    };
    const { error } =
      editando === "novo"
        ? await supabase.from("materials").insert(dados)
        : await supabase.from("materials").update(dados).eq("id", (editando as Material).id);
    setSalvando(false);
    if (error) {
      toast.error("Não foi possível salvar o material. Tente novamente.");
      return;
    }
    toast.success(editando === "novo" ? "Material publicado!" : "Material atualizado!");
    setEditando(null);
    await queryClient.invalidateQueries({ queryKey: ["materiais"] });
  };

  const excluir = async (m: Material) => {
    const { error } = await supabase.from("materials").delete().eq("id", m.id);
    if (error) {
      toast.error("Não foi possível excluir o material.");
      return;
    }
    if (m.filePath) await supabase.storage.from("materiais").remove([m.filePath]);
    toast.success("Material excluído.");
    await queryClient.invalidateQueries({ queryKey: ["materiais"] });
  };

  return (
    <div>
      <AdminToolbar
        placeholder="Buscar material"
        acao="Novo material"
        onAcao={() => abrir("novo")}
        busca={busca}
        onBusca={setBusca}
      />
      {lista.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Material</TableHead>
                <TableHead className="hidden sm:table-cell">Categoria</TableHead>
                <TableHead className="hidden md:table-cell">Publicado em</TableHead>
                <TableHead className="text-right">Tipo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lista.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.titulo}</TableCell>
                  <TableCell className="hidden sm:table-cell">{m.categoria}</TableCell>
                  <TableCell className="hidden md:table-cell">{formatarData(m.publicadoEm)}</TableCell>
                  <TableCell className="text-right capitalize">{m.tipo}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => abrir(m)}>
                        <Pencil aria-hidden="true" /> Editar
                      </Button>
                      <ConfirmarExclusao
                        titulo={`Excluir o material "${m.titulo}"?`}
                        descricao="O material deixará de aparecer na biblioteca digital."
                        onConfirmar={() => excluir(m)}
                      >
                        <Button variant="outline" size="sm">
                          <Trash2 aria-hidden="true" /> Excluir
                        </Button>
                      </ConfirmarExclusao>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <EstadoVazio
          icon={BookOpen}
          titulo="Nenhum material cadastrado"
          descricao="Publique apostilas, vídeos e tutoriais para a biblioteca digital dos ex-alunos."
        />
      )}

      <Dialog open={!!editando} onOpenChange={(v) => !v && setEditando(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editando === "novo" ? "Novo material" : "Editar material"}</DialogTitle>
            <DialogDescription>Envie um arquivo ou informe um link de acesso (vídeo, página etc.).</DialogDescription>
          </DialogHeader>
          <form onSubmit={salvar} noValidate className="space-y-4">
            <FormField id="mat-titulo" label="Título">
              <Input id="mat-titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
            </FormField>
            <FormField id="mat-descricao" label="Descrição">
              <Textarea id="mat-descricao" value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={3} />
            </FormField>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField id="mat-categoria" label="Categoria">
                <Select value={categoria} onValueChange={setCategoria}>
                  <SelectTrigger id="mat-categoria" className="h-12 rounded-xl border-2 text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoriasMateriais.map((c) => (
                      <SelectItem key={c} value={c} className="py-3 text-base">
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField id="mat-tipo" label="Tipo de conteúdo">
                <Select value={tipo} onValueChange={(v) => setTipo(v as MaterialTipo)}>
                  <SelectTrigger id="mat-tipo" className="h-12 rounded-xl border-2 text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tipoOpcoes.map((t) => (
                      <SelectItem key={t.value} value={t.value} className="py-3 text-base">
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>
            <FormField id="mat-url" label="Link externo (opcional)">
              <Input
                id="mat-url"
                type="url"
                inputMode="url"
                placeholder="https://…"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </FormField>
            <FormField id="mat-arquivo" label="Arquivo (opcional)">
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" onClick={() => inputArquivo.current?.click()}>
                  <Upload aria-hidden="true" /> {arquivo ? arquivo.name : "Escolher arquivo"}
                </Button>
                <input
                  ref={inputArquivo}
                  id="mat-arquivo"
                  type="file"
                  className="sr-only"
                  onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
                />
              </div>
            </FormField>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setEditando(null)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={salvando}>
                {salvando ? "Salvando…" : "Salvar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
