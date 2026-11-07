// Funções de autenticação e sessão do Inclus Conecta (Lovable Cloud).
import { supabase } from "@/integrations/supabase/client";

export async function getUsuarioAtual() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function usuarioEhAdmin(userId: string): Promise<boolean> {
  const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  return !!data;
}

export async function sairDaConta() {
  await supabase.auth.signOut();
}

/** Gera um link temporário e abre o download de um arquivo de um bucket privado. */
export async function baixarArquivo(bucket: "materiais" | "certificados", path: string, nomeArquivo?: string) {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 5, {
    download: nomeArquivo ?? true,
  });
  if (error || !data?.signedUrl) throw new Error(error?.message ?? "Não foi possível gerar o link do arquivo.");
  window.open(data.signedUrl, "_blank", "noopener");
}
