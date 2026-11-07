// Sessão DEMONSTRATIVA guardada no navegador, apenas para a navegação entre telas.
// Será substituída pela autenticação real na etapa de integração com o banco de dados.
const KEY = "inclus-conecta:sessao-demo";

export interface DemoSession {
  primeiroNome: string;
}

export function salvarSessaoDemo(nomeOuEmail: string) {
  const base = nomeOuEmail.includes("@") ? (nomeOuEmail.split("@")[0] ?? "") : nomeOuEmail;
  const primeiro = base.trim().split(/[\s._-]+/)[0] ?? "";
  const primeiroNome = primeiro ? primeiro.charAt(0).toUpperCase() + primeiro.slice(1).toLowerCase() : "";
  localStorage.setItem(KEY, JSON.stringify({ primeiroNome } satisfies DemoSession));
}

export function lerSessaoDemo(): DemoSession | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as DemoSession) : null;
  } catch {
    return null;
  }
}

export function encerrarSessaoDemo() {
  localStorage.removeItem(KEY);
}
