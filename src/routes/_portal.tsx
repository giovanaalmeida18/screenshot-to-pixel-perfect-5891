import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { LogOut, Menu } from "lucide-react";
import { useState } from "react";

import { AccessibilityBar } from "@/components/AccessibilityBar";
import { Logo } from "@/components/brand/Logo";
import { adminNav, bottomNav, mainNav, type NavItem } from "@/components/layout/nav";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { encerrarSessaoDemo } from "@/lib/demo-session";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_portal")({
  component: PortalLayout,
});

function SideLink({ item, onClick }: { item: NavItem; onClick?: (() => void) | undefined }) {
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      onClick={onClick}
      data-slot="nav"
      className="group flex min-h-12 items-center gap-3 rounded-xl px-3 text-base font-medium text-foreground transition-colors hover:bg-surface-blue hover:text-primary"
      activeProps={{ className: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground" }}
    >
      <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
      {item.label}
    </Link>
  );
}

function NavList({ onNavigate }: { onNavigate?: (() => void) | undefined }) {
  return (
    <nav aria-label="Menu principal" className="flex flex-col gap-1">
      {mainNav.map((item) => (
        <SideLink key={item.to} item={item} onClick={onNavigate} />
      ))}
      <div className="my-3 h-px bg-border" />
      <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Equipe do projeto</p>
      <SideLink item={adminNav} onClick={onNavigate} />
    </nav>
  );
}

function PortalLayout() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const sair = () => {
    encerrarSessaoDemo();
    setOpen(false);
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-muted">
      <div className="h-1.5 bg-gradient-brand" aria-hidden="true" />
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/painel" data-slot="logo" aria-label="Inclus Conecta, ir para o início">
            <Logo showTagline={false} />
          </Link>
          <div className="flex items-center gap-2">
            <AccessibilityBar compact className="hidden md:flex" />
            <Button variant="ghost" className="hidden lg:inline-flex" onClick={sair}>
              <LogOut aria-hidden="true" /> Sair
            </Button>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden" aria-label="Abrir menu">
                  <Menu aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex w-[86vw] max-w-sm flex-col gap-6 overflow-y-auto p-5">
                <SheetHeader className="p-0 text-left">
                  <SheetTitle>
                    <Logo />
                  </SheetTitle>
                </SheetHeader>
                <NavList onNavigate={() => setOpen(false)} />
                <div className="mt-auto space-y-4 border-t pt-4">
                  <p className="text-sm font-semibold text-foreground">Acessibilidade</p>
                  <AccessibilityBar compact />
                  <Button variant="outline" className="w-full" onClick={sair}>
                    <LogOut aria-hidden="true" /> Sair
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-8 px-4 sm:px-6">
        <aside className="sticky top-20 hidden h-[calc(100vh-6rem)] w-64 shrink-0 overflow-y-auto py-6 lg:block">
          <NavList />
        </aside>
        <main id="conteudo" className="min-w-0 flex-1 pb-28 pt-6 lg:pb-12">
          <Outlet />
        </main>
      </div>

      {/* Navegação inferior no celular */}
      <nav
        aria-label="Atalhos"
        className="fixed inset-x-0 bottom-0 z-40 border-t bg-background pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        <ul className="grid grid-cols-5">
          {bottomNav.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  data-slot="nav"
                  className="flex min-h-16 flex-col items-center justify-center gap-1 px-1 text-xs font-medium text-muted-foreground"
                  activeProps={{ className: "text-primary" }}
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={cn(
                          "flex h-8 w-12 items-center justify-center rounded-full transition-colors",
                          isActive && "bg-surface-blue",
                        )}
                      >
                        <Icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span className="text-center leading-tight">{item.short ?? item.label}</span>
                    </>
                  )}
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex min-h-16 w-full flex-col items-center justify-center gap-1 text-xs font-medium text-muted-foreground"
            >
              <span className="flex h-8 w-12 items-center justify-center rounded-full">
                <Menu className="h-5 w-5" aria-hidden="true" />
              </span>
              Menu
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
