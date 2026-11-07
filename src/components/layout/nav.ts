import {
  Award,
  BookOpen,
  Briefcase,
  GraduationCap,
  House,
  Megaphone,
  Settings,
  UserRound,
  type LucideIcon,
} from "lucide-react";

import type { Tone } from "@/components/PageHeader";

export interface NavItem {
  to:
    | "/painel"
    | "/biblioteca"
    | "/cursos"
    | "/certificados"
    | "/comunicados"
    | "/oportunidades"
    | "/perfil"
    | "/admin";
  label: string;
  icon: LucideIcon;
  tone: Tone;
}

export const mainNav: NavItem[] = [
  { to: "/painel", label: "Início", icon: House, tone: "blue" },
  { to: "/biblioteca", label: "Biblioteca digital", icon: BookOpen, tone: "blue" },
  { to: "/cursos", label: "Meus cursos", icon: GraduationCap, tone: "teal" },
  { to: "/certificados", label: "Certificados", icon: Award, tone: "yellow" },
  { to: "/comunicados", label: "Comunicados", icon: Megaphone, tone: "orange" },
  { to: "/oportunidades", label: "Oportunidades", icon: Briefcase, tone: "teal" },
  { to: "/perfil", label: "Meu perfil", icon: UserRound, tone: "blue" },
];

export const adminNav: NavItem = { to: "/admin", label: "Administração", icon: Settings, tone: "blue" };

const bottomPaths: NavItem["to"][] = ["/painel", "/biblioteca", "/comunicados", "/oportunidades"];
export const bottomNav: NavItem[] = mainNav.filter((i) => bottomPaths.includes(i.to));
