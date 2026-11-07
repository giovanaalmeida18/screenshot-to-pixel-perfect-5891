import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, MailCheck } from "lucide-react";
import { useState, type FormEvent } from "react";

import { FormField } from "@/components/FormField";
import { AuthShell } from "@/components/layout/PublicShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { validarEmail } from "@/lib/validation";

export const Route = createFileRoute("/recuperar-senha")({
  head: () => ({
    meta: [
      { title: "Recuperar senha — Inclus Conecta" },
      { name: "description", content: "Receba as instruções para criar uma nova senha no Inclus Conecta." },
      { property: "og:title", content: "Recuperar senha — Inclus Conecta" },
      { property: "og:description", content: "Receba as instruções para criar uma nova senha." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RecuperarSenha,
});

function RecuperarSenha() {
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState<string>();
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const err = validarEmail(email);
    setErro(err);
    if (err) return;
    setEnviando(true);
    await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/redefinir-senha`,
    });
    setEnviando(false);
    // Por segurança, mostramos a mesma mensagem mesmo se o e-mail não existir.
    setEnviado(true);
  };

  return (
    <AuthShell
      title="Recuperar senha"
      subtitle="Digite o e-mail da sua conta. Vamos enviar um link para você criar uma nova senha."
    >
      {enviado ? (
        <div role="status" className="rounded-2xl bg-surface-teal p-5 text-ink">
          <MailCheck className="h-8 w-8" aria-hidden="true" />
          <p className="mt-3 text-lg font-semibold">Pronto! Confira seu e-mail.</p>
          <p className="mt-1 text-base">
            Se <strong>{email}</strong> estiver cadastrado, você receberá um link para criar uma nova senha. Não
            esqueça de olhar a caixa de spam.
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate className="space-y-5">
          <FormField id="email" label="E-mail" error={erro}>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="nome@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!erro}
              aria-describedby={erro ? "email-erro" : undefined}
            />
          </FormField>
          <Button type="submit" size="lg" className="w-full" disabled={enviando}>
            {enviando ? "Enviando…" : "Enviar link"}
          </Button>
        </form>
      )}
      <Link
        to="/entrar"
        className="mt-6 inline-flex items-center gap-2 text-base font-semibold text-primary underline-offset-4 hover:underline"
      >
        <ArrowLeft className="h-5 w-5" aria-hidden="true" /> Voltar para entrar
      </Link>
    </AuthShell>
  );
}
