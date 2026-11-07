import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type FontScale = "md" | "lg" | "xl";
const SCALES: FontScale[] = ["md", "lg", "xl"];
const STORAGE_KEY = "inclus-conecta:acessibilidade";

interface AccessibilityState {
  fontScale: FontScale;
  highContrast: boolean;
  increaseFont: () => void;
  decreaseFont: () => void;
  resetFont: () => void;
  toggleContrast: () => void;
}

const AccessibilityContext = createContext<AccessibilityState | null>(null);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [fontScale, setFontScale] = useState<FontScale>("md");
  const [highContrast, setHighContrast] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
      if (SCALES.includes(saved.fontScale)) setFontScale(saved.fontScale);
      if (typeof saved.highContrast === "boolean") setHighContrast(saved.highContrast);
    } catch {
      /* preferências inválidas: usa o padrão */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const root = document.documentElement;
    root.dataset["font"] = fontScale;
    root.classList.toggle("hc", highContrast);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ fontScale, highContrast }));
  }, [fontScale, highContrast, loaded]);

  const increaseFont = useCallback(
    () => setFontScale((s) => SCALES[Math.min(SCALES.indexOf(s) + 1, SCALES.length - 1)] ?? s),
    [],
  );
  const decreaseFont = useCallback(
    () => setFontScale((s) => SCALES[Math.max(SCALES.indexOf(s) - 1, 0)] ?? s),
    [],
  );
  const resetFont = useCallback(() => setFontScale("md"), []);
  const toggleContrast = useCallback(() => setHighContrast((v) => !v), []);

  const value = useMemo(
    () => ({ fontScale, highContrast, increaseFont, decreaseFont, resetFont, toggleContrast }),
    [fontScale, highContrast, increaseFont, decreaseFont, resetFont, toggleContrast],
  );

  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>;
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error("useAccessibility precisa estar dentro de AccessibilityProvider");
  return ctx;
}
