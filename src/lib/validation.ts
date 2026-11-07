export interface CadastroInput {
  nome: string;
  email: string;
  telefone: string;
  curso: string;
  senha: string;
  confirmarSenha: string;
}

export type CadastroErros = Partial<Record<keyof CadastroInput, string>>;

export const SENHA_MINIMA = 8;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validarEmail(email: string): string | undefined {
  if (!email.trim()) return "Informe seu e-mail.";
  if (!EMAIL_RE.test(email.trim())) return "Digite um e-mail válido, como nome@email.com.";
  return undefined;
}

export function validarCadastro(input: CadastroInput): CadastroErros {
  const erros: CadastroErros = {};
  if (input.nome.trim().split(/\s+/).filter(Boolean).length < 2) {
    erros.nome = "Digite seu nome completo (nome e sobrenome).";
  }
  const emailErro = validarEmail(input.email);
  if (emailErro) erros.email = emailErro;
  const digitos = input.telefone.replace(/\D/g, "");
  if (digitos.length < 10 || digitos.length > 11) {
    erros.telefone = "Digite o telefone com DDD, por exemplo (85) 99999-9999.";
  }
  if (!input.curso) erros.curso = "Escolha o curso que você fez no Projeto Inclus.";
  if (input.senha.length < SENHA_MINIMA) {
    erros.senha = `A senha precisa ter pelo menos ${SENHA_MINIMA} caracteres.`;
  }
  if (input.confirmarSenha !== input.senha) {
    erros.confirmarSenha = "As senhas não são iguais. Digite novamente.";
  }
  return erros;
}

export function formatarTelefone(valor: string): string {
  const d = valor.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}
