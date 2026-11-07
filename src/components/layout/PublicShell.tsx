import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { AccessibilityBar } from "@/components/AccessibilityBar";
import { Logo } from "@/components/brand/Logo";

export function PublicHeader() {
  return (
    <header className="border-b bg-background">
      <div className="h-1.5 bg-gradient-brand" aria-hidden="true" />
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link to="/" data-slot="logo" aria-label="Inclus Conecta, página inicial">
          <Logo />
        </Link>
        <AccessibilityBar compact />
      </div>
    </header>
  );
}

/** Moldura das telas de acesso (entrar, cadastro, recuperar senha). */
export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-muted">
      <PublicHeader />
      <main id="conteudo" className="relative flex flex-1 items-start justify-center overflow-hidden px-4 py-8 sm:items-center sm:py-12">
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-yellow/40" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rotate-12 rounded-[2.5rem] bg-brand-teal/40" />
        <div className="relative w-full max-w-md rounded-3xl border bg-card p-6 shadow-soft sm:p-8">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{title}</h1>
          <p className="mt-2 text-base text-muted-foreground">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </main>
    </div>
  );
}
