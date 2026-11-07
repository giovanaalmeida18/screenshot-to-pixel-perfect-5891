import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { KeyRound } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { FormField } from "@/components/FormField";
import { AuthShell } from "@/components/layout/PublicShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { SENHA_MINIMA } from "@/lib/validation";

export const Route = createFileRoute("/redefinir-senha")({
  head: () => ({
    meta: [
      { title: "Criar nova senha — Inclus Conecta" },
      { name: "description", content: "Defina uma nova senha para sua conta no Inclus Conecta." },
      { property: "og:title", content: "Criar nova senha — Inclus Conecta" },
      { property: "og:description", content: "Defina uma nova senha para sua conta." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RedefinirSenha,
});

function RedefinirSenha() {
  const navigate = useNavigate();
  const [senha, setSenha] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [erros, setErros] = useState<{ senha?: string | undefined; confirmar?: string | undefined }>({});
  const [valido, setValido] = useState<boolean | null>(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    // O link de recuperação chega com type=recovery no hash; o cliente Supabase
    // processa o token e abre uma sessão temporária de recuperação.
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setValido(true);
      return;
    }
    supabase.auth.getSession().then(({ data }) => setValido(!!data.session));
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const novos: typeof erros = {};
    if (senha.length < SENHA_MINIMA) novos.senha = `A senha precisa ter pelo menos ${SENHA_MINIMA} caracteres.`;
    if (confirmar !== senha) novos.confirmar = "As senhas não são iguais. Digite novamente.";
    setErros(novos);
    if (novos.senha || novos.confirmar) return;
    setSalvando(true);
    const { error } = await supabase.auth.updateUser({ password: senha });
    setSalvando(false);
    if (error) {
      toast.error("Não foi possível salvar a nova senha. Peça um novo link de recuperação.");
      return;
    }
    toast.success("Senha alterada com sucesso!");
    navigate({ to: "/painel" });
  };

  if (valido === null) {
    return (
      <AuthShell title="Criar nova senha" subtitle="Estamos verificando seu link…">
        <p className="text-center text-base text-muted-foreground">Aguarde um instante.</p>
      </AuthShell>
    );
  }

  if (!valido) {
    return (
      <AuthShell title="Link inválido ou vencido" subtitle="Peça um novo link de recuperação de senha.">
        <Button asChild size="lg" className="w-full">
          <Link to="/recuperar-senha">Pedir novo link</Link>
        </Button>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Criar nova senha" subtitle="Escolha uma senha segura para a sua conta.">
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <FormField id="senha" label="Nova senha" error={erros.senha} hint={`Use pelo menos ${SENHA_MINIMA} caracteres.`}>
          <Input
            id="senha"
            type="password"
            autoComplete="new-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            aria-invalid={!!erros.senha}
            aria-describedby={erros.senha ? "senha-erro" : undefined}
          />
        </FormField>
        <FormField id="confirmar" label="Confirme a nova senha" error={erros.confirmar}>
          <Input
            id="confirmar"
            type="password"
            autoComplete="new-password"
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            aria-invalid={!!erros.confirmar}
            aria-describedby={erros.confirmar ? "confirmar-erro" : undefined}
          />
        </FormField>
        <Button type="submit" size="lg" className="w-full" disabled={salvando}>
          <KeyRound aria-hidden="true" /> {salvando ? "Salvando…" : "Salvar nova senha"}
        </Button>
      </form>
    </AuthShell>
  );
}
