// Peças compartilhadas da área administrativa: barra de busca/ação e confirmação de exclusão.
import { Plus, Search } from "lucide-react";
import { useState, type ReactNode } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AdminToolbar({
  placeholder,
  acao,
  onAcao,
  busca,
  onBusca,
}: {
  placeholder: string;
  acao: string;
  onAcao: () => void;
  busca: string;
  onBusca: (v: string) => void;
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input
          type="search"
          placeholder={placeholder}
          aria-label={placeholder}
          className="pl-12"
          value={busca}
          onChange={(e) => onBusca(e.target.value)}
        />
      </div>
      <Button onClick={onAcao}>
        <Plus aria-hidden="true" /> {acao}
      </Button>
    </div>
  );
}

export function ConfirmarExclusao({
  titulo,
  descricao,
  onConfirmar,
  children,
}: {
  titulo: string;
  descricao: string;
  onConfirmar: () => Promise<void>;
  children: ReactNode;
}) {
  const [aberto, setAberto] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  const confirmar = async () => {
    setExcluindo(true);
    await onConfirmar();
    setExcluindo(false);
    setAberto(false);
  };

  return (
    <AlertDialog open={aberto} onOpenChange={setAberto}>
      <span onClick={() => setAberto(true)} className="inline-flex">
        {children}
      </span>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{titulo}</AlertDialogTitle>
          <AlertDialogDescription>{descricao}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              void confirmar();
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {excluindo ? "Excluindo…" : "Sim, excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function EstadoVazio({ icon: Icon, titulo, descricao }: { icon: typeof Plus; titulo: string; descricao: string }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border-2 border-dashed p-10 text-center">
      <Icon className="h-10 w-10 text-primary" aria-hidden="true" />
      <p className="mt-3 text-lg font-bold text-foreground">{titulo}</p>
      <p className="mt-1 max-w-md text-base text-muted-foreground">{descricao}</p>
    </div>
  );
}
