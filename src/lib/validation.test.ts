import { describe, expect, it } from "vitest";

import { validarCadastro, type CadastroInput } from "./validation";

const valido: CadastroInput = {
  nome: "Maria Souza",
  email: "maria@email.com",
  telefone: "(85) 99999-9999",
  curso: "Informática básica",
  senha: "senha1234",
  confirmarSenha: "senha1234",
};

describe("validarCadastro", () => {
  it("aceita um cadastro completo", () => {
    expect(validarCadastro(valido)).toEqual({});
  });

  it("exige que a confirmação seja igual à senha", () => {
    expect(validarCadastro({ ...valido, confirmarSenha: "outra1234" }).confirmarSenha).toBeDefined();
  });

  it("exige o curso realizado no Projeto Inclus", () => {
    expect(validarCadastro({ ...valido, curso: "" }).curso).toBeDefined();
  });
});
