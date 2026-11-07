import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { UserPlus } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { DemoNotice } from "@/components/DemoNotice";
import { FormField } from "@/components/FormField";
import { AuthShell } from "@/components/layout/PublicShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cursosDoProjeto } from "@/lib/data/demo";
import { salvarSessaoDemo } from "@/lib/demo-session";
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
  const navigate = useNavigate();
  const [form, setForm] = useState<CadastroInput>(vazio);
  const [erros, setErros] = useState<CadastroErros>({});

  const set = (campo: keyof CadastroInput) => (valor: string) => setForm((f) => ({ ...f, [campo]: valor }));
  const aria = (campo: keyof CadastroInput) => ({
    "aria-invalid": !!erros[campo],
    "aria-describedby": erros[campo] ? `${campo}-erro` : undefined,
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const novos = validarCadastro(form);
    setErros(novos);
    const primeiroErro = Object.keys(novos)[0];
    if (primeiroErro) {
      document.getElementById(primeiroErro)?.focus();
      return;
    }
    salvarSessaoDemo(form.nome);
    toast.success("Conta criada (demonstração). Boas-vindas!");
    navigate({ to: "/painel" });
  };

  return (
    <AuthShell title="Crie sua conta" subtitle="Preencha seus dados. Leva menos de 2 minutos.">
      <form onSubmit={onSubmit} noValidate className="space-y-5">
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
        <Button type="submit" size="lg" variant="cta" className="w-full">
          <UserPlus aria-hidden="true" /> Criar minha conta
        </Button>
      </form>
      <p className="mt-6 text-center text-base text-muted-foreground">
        Já tem conta?{" "}
        <Link to="/entrar" className="font-semibold text-primary underline-offset-4 hover:underline">
          Entrar
        </Link>
      </p>
      <DemoNotice className="mt-6">Versão de demonstração: os dados digitados não são salvos.</DemoNotice>
    </AuthShell>
  );
}
