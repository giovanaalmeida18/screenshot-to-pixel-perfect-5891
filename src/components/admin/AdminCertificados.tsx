import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Award, Trash2, Upload } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { AdminToolbar, ConfirmarExclusao, EstadoVazio } from "@/components/admin/AdminShared";
import { FormField } from "@/components/FormField";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { adminCertificadosQuery, adminUsuariosQuery, cursosQuery } from "@/lib/data/queries";
import { formatarData } from "@/lib/format";

export function AdminCertificados() {
  const queryClient = useQueryClient();
  const { data: certificados = [] } = useQuery(adminCertificadosQuery);
  const { data: usuarios = [] } = useQuery(adminUsuariosQuery);
  const { data: cursos = [] } = useQuery(cursosQuery);
  const [busca, setBusca] = useState("");
  const [aberto, setAberto] = useState(false);
  const [alunoId, setAlunoId] = useState("");
  const [cursoId, setCursoId] = useState("");
  const [emissao, setEmissao] = useState("");
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [salvando, setSalvando] = useState(false);
  const inputArquivo = useRef<HTMLInputElement>(null);

  const lista = certificados.filter(
    (c) =>
      c.alunoNome.toLowerCase().includes(busca.toLowerCase()) || c.cursoNome.toLowerCase().includes(busca.toLowerCase()),
  );

  const abrir = () => {
    setAlunoId("");
    setCursoId("");
    setEmissao(new Date().toISOString().slice(0, 10));
    setArquivo(null);
    setAberto(true);
  };

  const salvar = async (e: FormEvent) => {
    e.preventDefault();
    if (!alunoId || !cursoId) {
      toast.error("Escolha o ex-aluno e o curso.");
      return;
    }
    setSalvando(true);
    let filePath: string | null = null;
    if (arquivo) {
      // A pasta com o id do aluno garante, pela política de acesso, que só ele baixa o arquivo.
      const caminho = `${alunoId}/${Date.now()}-${arquivo.name.replace(/[^\w.-]+/g, "_")}`;
      const { error: erroUpload } = await supabase.storage.from("certificados").upload(caminho, arquivo, { upsert: true });
      if (erroUpload) {
        setSalvando(false);
        toast.error("Não foi possível enviar o arquivo. Tente novamente.");
        return;
      }
      filePath = caminho;
    }
    const { error } = await supabase.from("certificates").insert({
      student_id: alunoId,
      course_id: cursoId,
      issue_date: emissao || new Date().toISOString().slice(0, 10),
      file_path: filePath,
    });
    setSalvando(false);
    if (error) {
      toast.error(
        error.message.includes("duplicate")
          ? "Já existe um certificado deste curso para este ex-aluno."
          : "Não foi possível cadastrar o certificado. Tente novamente.",
      );
      return;
    }
    toast.success("Certificado cadastrado!");
    setAberto(false);
    await queryClient.invalidateQueries({ queryKey: ["admin", "certificados"] });
  };

  const excluir = async (c: (typeof certificados)[number]) => {
    const { error } = await supabase.from("certificates").delete().eq("id", c.id);
    if (error) {
      toast.error("Não foi possível excluir o certificado.");
      return;
    }
    if (c.filePath) await supabase.storage.from("certificados").remove([c.filePath]);
    toast.success("Certificado excluído.");
    await queryClient.invalidateQueries({ queryKey: ["admin", "certificados"] });
  };

  return (
    <div>
      <AdminToolbar
        placeholder="Buscar por aluno ou curso"
        acao="Cadastrar certificado"
        onAcao={abrir}
        busca={busca}
        onBusca={setBusca}
      />
      {lista.length > 0 ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ex-aluno</TableHead>
                <TableHead>Curso</TableHead>
                <TableHead className="hidden sm:table-cell">Emitido em</TableHead>
                <TableHead className="hidden md:table-cell">Arquivo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lista.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.alunoNome}</TableCell>
                  <TableCell>{c.cursoNome}</TableCell>
                  <TableCell className="hidden sm:table-cell">{formatarData(c.emitidoEm)}</TableCell>
                  <TableCell className="hidden md:table-cell">{c.filePath ? "Enviado" : "Sem arquivo"}</TableCell>
                  <TableCell className="text-right">
                    <ConfirmarExclusao
                      titulo={`Excluir o certificado de ${c.alunoNome} (${c.cursoNome})?`}
                      descricao="O certificado deixará de aparecer no painel deste ex-aluno."
                      onConfirmar={() => excluir(c)}
                    >
                      <Button variant="outline" size="sm">
                        <Trash2 aria-hidden="true" /> Excluir
                      </Button>
                    </ConfirmarExclusao>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <EstadoVazio
          icon={Award}
          titulo="Nenhum certificado cadastrado"
          descricao="Cadastre os certificados emitidos e envie os arquivos para os ex-alunos baixarem."
        />
      )}

      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cadastrar certificado</DialogTitle>
            <DialogDescription>Associe o certificado ao ex-aluno e ao curso, e envie o arquivo (PDF ou imagem).</DialogDescription>
          </DialogHeader>
          <form onSubmit={salvar} noValidate className="space-y-4">
            <FormField id="cert-aluno" label="Ex-aluno">
              <Select value={alunoId} onValueChange={setAlunoId}>
                <SelectTrigger id="cert-aluno" className="h-12 rounded-xl border-2 text-base">
                  <SelectValue placeholder="Escolha o ex-aluno" />
                </SelectTrigger>
                <SelectContent>
                  {usuarios.map((u) => (
                    <SelectItem key={u.id} value={u.id} className="py-3 text-base">
                      {u.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField id="cert-curso" label="Curso">
              <Select value={cursoId} onValueChange={setCursoId}>
                <SelectTrigger id="cert-curso" className="h-12 rounded-xl border-2 text-base">
                  <SelectValue placeholder="Escolha o curso" />
                </SelectTrigger>
                <SelectContent>
                  {cursos.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="py-3 text-base">
                      {c.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField id="cert-emissao" label="Data de emissão">
              <Input id="cert-emissao" type="date" value={emissao} onChange={(e) => setEmissao(e.target.value)} />
            </FormField>
            <FormField id="cert-arquivo" label="Arquivo do certificado (opcional)">
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" onClick={() => inputArquivo.current?.click()}>
                  <Upload aria-hidden="true" /> {arquivo ? arquivo.name : "Escolher arquivo"}
                </Button>
                <input
                  ref={inputArquivo}
                  id="cert-arquivo"
                  type="file"
                  accept=".pdf,image/*"
                  className="sr-only"
                  onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
                />
              </div>
            </FormField>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setAberto(false)}>
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
