import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useState, type FormEvent } from "react";

import { FormField } from "@/components/FormField";
import { AuthShell } from "@/components/layout/PublicShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { validarEmail } from "@/lib/validation";

export const Route = createFileRoute("/entrar")({
  head: () => ({
    meta: [
      { title: "Entrar — Inclus Conecta" },
      { name: "description", content: "Acesse sua conta de ex-aluno no Inclus Conecta." },
      { property: "og:title", content: "Entrar — Inclus Conecta" },
      { property: "og:description", content: "Acesse sua conta de ex-aluno no Inclus Conecta." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Entrar,
});

function Entrar() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrar, setMostrar] = useState(false);
  const [erros, setErros] = useState<{ email?: string | undefined; senha?: string | undefined }>({});
  const [erroGeral, setErroGeral] = useState<string>();
  const [entrando, setEntrando] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErroGeral(undefined);
    const novos = { email: validarEmail(email), senha: senha ? undefined : "Digite sua senha." };
    setErros(novos);
    if (novos.email || novos.senha) return;
    setEntrando(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
    setEntrando(false);
    if (error) {
      setErroGeral(
        error.message.toLowerCase().includes("email not confirmed")
          ? "Sua conta ainda não foi confirmada. Abra o e-mail que enviamos e clique no link de confirmação."
          : "E-mail ou senha incorretos. Confira os dados e tente novamente.",
      );
      return;
    }
    navigate({ to: "/painel" });
  };

  return (
    <AuthShell title="Que bom ver você de novo!" subtitle="Entre com o e-mail e a senha da sua conta.">
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        {erroGeral && (
          <p role="alert" className="rounded-2xl border-2 border-destructive bg-destructive/10 p-4 text-base font-medium text-destructive">
            {erroGeral}
          </p>
        )}
        <FormField id="email" label="E-mail" error={erros.email}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="nome@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!erros.email}
            aria-describedby={erros.email ? "email-erro" : undefined}
          />
        </FormField>
        <FormField id="senha" label="Senha" error={erros.senha}>
          <div className="relative">
            <Input
              id="senha"
              type={mostrar ? "text" : "password"}
              autoComplete="current-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              aria-invalid={!!erros.senha}
              aria-describedby={erros.senha ? "senha-erro" : undefined}
              className="pr-14"
            />
            <button
              type="button"
              onClick={() => setMostrar((v) => !v)}
              className="absolute right-1 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:text-primary"
              aria-label={mostrar ? "Esconder senha" : "Mostrar senha"}
            >
              {mostrar ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </FormField>
        <div className="flex justify-end">
          <Link to="/recuperar-senha" className="text-base font-medium text-primary underline-offset-4 hover:underline">
            Esqueci minha senha
          </Link>
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={entrando}>
          <LogIn aria-hidden="true" /> {entrando ? "Entrando…" : "Entrar"}
        </Button>
      </form>
      <p className="mt-6 text-center text-base text-muted-foreground">
        Ainda não tem conta?{" "}
        <Link to="/cadastro" className="font-semibold text-primary underline-offset-4 hover:underline">
          Cadastre-se
        </Link>
      </p>
    </AuthShell>
  );
}
