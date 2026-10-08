import { supabase } from "./supabase";
import { dataDeHoje } from "./time";

/* ---------- Medicamentos ---------- */
export async function carregarMedicamentosCloud(usuarioId) {
  const { data, error } = await supabase
    .from("medicamentos")
    .select("*")
    .eq("usuario_id", usuarioId)
    .order("horario", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function adicionarMedicamentoCloud(usuarioId, nome, dose, horario) {
  const { data, error } = await supabase
    .from("medicamentos")
    .insert({ usuario_id: usuarioId, nome, dose, horario })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function excluirMedicamentoCloud(id) {
  const { error } = await supabase.from("medicamentos").delete().eq("id", id);
  if (error) throw error;
}

/* ---------- Registros de dose (tomado / perdido) ---------- */
export async function carregarRegistrosDeHoje(usuarioId) {
  const { data, error } = await supabase
    .from("registros_dose")
    .select("*")
    .eq("usuario_id", usuarioId)
    .eq("data", dataDeHoje());

  if (error) throw error;
  return data ?? [];
}

export async function marcarComoTomadoCloud(medicamentoId, usuarioId) {
  const { error } = await supabase
    .from("registros_dose")
    .upsert(
      { medicamento_id: medicamentoId, usuario_id: usuarioId, data: dataDeHoje(), status: "tomado" },
      { onConflict: "medicamento_id,data" }
    );

  if (error) throw error;
}

/* ---------- Token de notificação push (usado pelo admin) ---------- */
export async function salvarPushTokenCloud(profileId, expoPushToken) {
  const { error } = await supabase
    .from("push_tokens")
    .upsert(
      { profile_id: profileId, expo_push_token: expoPushToken },
      { onConflict: "profile_id,expo_push_token" }
    );

  if (error) throw error;
}

/* ---------- Perfil (papel: usuario | admin) ---------- */
export async function carregarProprioPerfil(usuarioId) {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", usuarioId).single();
  if (error) throw error;
  return data;
}
