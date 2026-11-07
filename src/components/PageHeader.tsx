import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const tones = {
  blue: "bg-primary text-primary-foreground",
  orange: "bg-brand-orange text-ink",
  yellow: "bg-brand-yellow text-ink",
  teal: "bg-brand-teal text-ink",
} as const;

export type Tone = keyof typeof tones;

export function IconTile({ icon: Icon, tone = "blue", className }: { icon: LucideIcon; tone?: Tone; className?: string }) {
  return (
    <span className={cn("inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl", tones[tone], className)}>
      <Icon className="h-6 w-6" aria-hidden="true" />
    </span>
  );
}

export function PageHeader({
  title,
  description,
  icon,
  tone = "blue",
  children,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  tone?: Tone;
  children?: React.ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex items-start gap-4">
        {icon && <IconTile icon={icon} tone={tone} />}
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{title}</h1>
          {description && <p className="mt-1 max-w-2xl text-base text-muted-foreground">{description}</p>}
        </div>
      </div>
      {children}
    </header>
  );
}
