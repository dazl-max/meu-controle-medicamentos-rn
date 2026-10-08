// Edge Function: notificar-dose-perdida
// Disparada pelo gatilho SQL (trigger-notificacao.sql) sempre que uma
// linha com status "perdido" é inserida em public.registros_dose.
// Busca o(s) admin(s) vinculados ao usuário e manda uma notificação
// push via Expo.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function obterChaveDeServico(): string {
  // Projetos novos (chaves sb_publishable_/sb_secret_) guardam a chave
  // secreta como um JSON: { "default": "sb_secret_..." } na variável
  // SUPABASE_SECRET_KEYS. Projetos antigos ainda usam a variável
  // simples SUPABASE_SERVICE_ROLE_KEY — este código aceita os dois.
  const chavesSecretas = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (chavesSecretas) {
    try {
      const chaves = JSON.parse(chavesSecretas);
      if (chaves.default) return chaves.default;
    } catch {
      /* segue para o fallback abaixo */
    }
  }
  return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
}

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabase = createClient(supabaseUrl, obterChaveDeServico());

Deno.serve(async (req) => {
  try {
    const payload = await req.json();
    const registro = payload.record;

    if (!registro || registro.status !== "perdido") {
      return new Response("ignorado: não é uma dose perdida", { status: 200 });
    }

    const { data: medicamento } = await supabase
      .from("medicamentos")
      .select("nome, dose")
      .eq("id", registro.medicamento_id)
      .single();

    const { data: vinculos } = await supabase
      .from("vinculos")
      .select("admin_id")
      .eq("usuario_id", registro.usuario_id);

    if (!vinculos || vinculos.length === 0) {
      return new Response("sem admin vinculado a esse usuário", { status: 200 });
    }

    const idsAdmins = vinculos.map((v) => v.admin_id);

    const { data: tokens } = await supabase
      .from("push_tokens")
      .select("expo_push_token")
      .in("profile_id", idsAdmins);

    if (!tokens || tokens.length === 0) {
      return new Response("admin sem token de notificação cadastrado", { status: 200 });
    }

    const mensagens = tokens.map((t) => ({
      to: t.expo_push_token,
      title: "⚠️ Dose não confirmada",
      body: `${medicamento?.nome ?? "Medicamento"} (${medicamento?.dose ?? ""}) não foi marcado como tomado.`,
      sound: "default",
    }));

    const resposta = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(mensagens),
    });

    return new Response(`notificação enviada: ${resposta.status}`, { status: 200 });
  } catch (erro) {
    return new Response(`erro: ${erro.message}`, { status: 500 });
  }
});
