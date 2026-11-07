import { createFileRoute, Link } from "@tanstack/react-router";
import { MailCheck, UserPlus } from "lucide-react";
import { useState, type FormEvent } from "react";

import { FormField } from "@/components/FormField";
import { AuthShell } from "@/components/layout/PublicShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { cursosDoProjeto } from "@/lib/data/constants";
import {
  SENHA_MINIMA,
  formatarTelefone,
  validarCadastro,
  type CadastroErros,
  type CadastroInput,
} from "@/lib/validation";

export const Route = createFileRoute("/cadastro")({
  head: () => ({
    meta: [
      { title: "Cadastro — Inclus Conecta" },
      { name: "description", content: "Crie sua conta de ex-aluno do Projeto Inclus no Inclus Conecta." },
      { property: "og:title", content: "Cadastro — Inclus Conecta" },
      { property: "og:description", content: "Crie sua conta de ex-aluno do Projeto Inclus." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Cadastro,
});

const vazio: CadastroInput = { nome: "", email: "", telefone: "", curso: "", senha: "", confirmarSenha: "" };

function Cadastro() {
  const [form, setForm] = useState<CadastroInput>(vazio);
  const [erros, setErros] = useState<CadastroErros>({});
  const [erroGeral, setErroGeral] = useState<string>();
  const [enviando, setEnviando] = useState(false);
  const [concluido, setConcluido] = useState(false);

  const set = (campo: keyof CadastroInput) => (valor: string) => setForm((f) => ({ ...f, [campo]: valor }));
  const aria = (campo: keyof CadastroInput) => ({
    "aria-invalid": !!erros[campo],
    "aria-describedby": erros[campo] ? `${campo}-erro` : undefined,
  });

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErroGeral(undefined);
    const novos = validarCadastro(form);
    setErros(novos);
    const primeiroErro = Object.keys(novos)[0];
    if (primeiroErro) {
      document.getElementById(primeiroErro)?.focus();
      return;
    }
    setEnviando(true);
    const { error } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.senha,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: form.nome.trim(),
          phone: form.telefone,
          course_taken: form.curso,
        },
      },
    });
    setEnviando(false);
    if (error) {
      const msg = error.message.toLowerCase();
      setErroGeral(
        msg.includes("already")
          ? "Este e-mail já tem uma conta. Tente entrar ou recuperar a senha."
          : msg.includes("weak") || msg.includes("password")
            ? "Essa senha é muito comum ou já vazou na internet. Escolha uma senha mais forte, com letras, números e símbolos."
            : "Não foi possível criar sua conta agora. Tente novamente em instantes.",
      );
      return;
    }
    setConcluido(true);
  };

  if (concluido) {
    return (
      <AuthShell title="Quase lá!" subtitle="Sua conta foi criada com sucesso.">
        <div role="status" className="rounded-2xl bg-surface-teal p-5 text-ink">
          <MailCheck className="h-8 w-8" aria-hidden="true" />
          <p className="mt-3 text-lg font-semibold">Confirme seu e-mail</p>
          <p className="mt-1 text-base">
            Enviamos um link de confirmação para <strong>{form.email}</strong>. Abra o e-mail e clique no link para
            ativar sua conta. Depois, é só entrar no Inclus Conecta.
          </p>
        </div>
        <p className="mt-6 text-center text-base text-muted-foreground">
          Já confirmou?{" "}
          <Link to="/entrar" className="font-semibold text-primary underline-offset-4 hover:underline">
            Entrar
          </Link>
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Crie sua conta" subtitle="Preencha seus dados. Leva menos de 2 minutos.">
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        {erroGeral && (
          <p role="alert" className="rounded-2xl border-2 border-destructive bg-destructive/10 p-4 text-base font-medium text-destructive">
            {erroGeral}
          </p>
        )}
        <FormField id="nome" label="Nome completo" error={erros.nome}>
          <Input id="nome" autoComplete="name" value={form.nome} onChange={(e) => set("nome")(e.target.value)} {...aria("nome")} />
        </FormField>
        <FormField id="email" label="E-mail" error={erros.email}>
          <Input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="nome@email.com"
            value={form.email}
            onChange={(e) => set("email")(e.target.value)}
            {...aria("email")}
          />
        </FormField>
        <FormField id="telefone" label="Telefone (com DDD)" error={erros.telefone}>
          <Input
            id="telefone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="(00) 00000-0000"
            value={form.telefone}
            onChange={(e) => set("telefone")(formatarTelefone(e.target.value))}
            {...aria("telefone")}
          />
        </FormField>
        <FormField id="curso" label="Curso realizado no Projeto Inclus" error={erros.curso}>
          <Select value={form.curso} onValueChange={set("curso")}>
            <SelectTrigger id="curso" className="h-12 rounded-xl border-2 text-base" {...aria("curso")}>
              <SelectValue placeholder="Escolha o curso" />
            </SelectTrigger>
            <SelectContent>
              {cursosDoProjeto.map((c) => (
                <SelectItem key={c} value={c} className="py-3 text-base">
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
        <FormField id="senha" label="Senha" error={erros.senha} hint={`Use pelo menos ${SENHA_MINIMA} caracteres.`}>
          <Input
            id="senha"
            type="password"
            autoComplete="new-password"
            value={form.senha}
            onChange={(e) => set("senha")(e.target.value)}
            {...aria("senha")}
          />
        </FormField>
        <FormField id="confirmarSenha" label="Confirme a senha" error={erros.confirmarSenha}>
          <Input
            id="confirmarSenha"
            type="password"
            autoComplete="new-password"
            value={form.confirmarSenha}
            onChange={(e) => set("confirmarSenha")(e.target.value)}
            {...aria("confirmarSenha")}
          />
        </FormField>
        <Button type="submit" size="lg" variant="cta" className="w-full" disabled={enviando}>
          <UserPlus aria-hidden="true" /> {enviando ? "Criando conta…" : "Criar minha conta"}
        </Button>
      </form>
      <p className="mt-6 text-center text-base text-muted-foreground">
        Já tem conta?{" "}
        <Link to="/entrar" className="font-semibold text-primary underline-offset-4 hover:underline">
          Entrar
        </Link>
      </p>
    </AuthShell>
  );
}
