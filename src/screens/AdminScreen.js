import React, { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, Pressable, StyleSheet } from "react-native";
import { obterTokenPush } from "../utils/notifications";
import { supabase } from "../utils/supabase";
import { salvarPushTokenCloud } from "../utils/cloudData";
import { cores, fontes, espaco, raio } from "../theme";
import { dataDeHoje } from "../utils/time";

export default function AdminScreen({ session }) {
  const [medicamentos, setMedicamentos] = useState([]);
  const [registros, setRegistros] = useState([]);
  const [nomeUsuario, setNomeUsuario] = useState("");
  const [usuarioId, setUsuarioId] = useState(null);

  const carregarDados = useCallback(async (idUsuario) => {
    const [{ data: meds }, { data: regs }] = await Promise.all([
      supabase.from("medicamentos").select("*").eq("usuario_id", idUsuario).order("horario"),
      supabase.from("registros_dose").select("*").eq("usuario_id", idUsuario).eq("data", dataDeHoje()),
    ]);
    setMedicamentos(meds ?? []);
    setRegistros(regs ?? []);
  }, []);

  /* Registra o token de push deste celular (o do admin), pra Edge
     Function conseguir notificar quando uma dose for perdida. */
  useEffect(() => {
    (async () => {
      try {
        const token = await obterTokenPush();
        if (!token) return;
        await salvarPushTokenCloud(session.user.id, token);
      } catch {
        /* segue funcionando com a lista em tempo real mesmo sem push */
      }
    })();
  }, [session.user.id]);

  /* Descobre qual usuário está vinculado a este admin e assina
     atualizações em tempo real dos registros de dose dele. */
  useEffect(() => {
    let canal;

    (async () => {
      const { data: vinculo } = await supabase
        .from("vinculos")
        .select("usuario_id, profiles:usuario_id (nome)")
        .eq("admin_id", session.user.id)
        .limit(1)
        .single();

      if (!vinculo) return;

      setUsuarioId(vinculo.usuario_id);
      setNomeUsuario(vinculo.profiles?.nome ?? "");
      await carregarDados(vinculo.usuario_id);

      canal = supabase
        .channel("acompanhamento-" + vinculo.usuario_id)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "registros_dose", filter: `usuario_id=eq.${vinculo.usuario_id}` },
          () => carregarDados(vinculo.usuario_id)
        )
        .subscribe();
    })();

    return () => {
      if (canal) supabase.removeChannel(canal);
    };
  }, [session.user.id, carregarDados]);

  function statusDoMedicamento(medicamentoId) {
    return registros.find((r) => r.medicamento_id === medicamentoId)?.status ?? "pendente";
  }

  return (
    <View style={estilos.raiz}>
      <View style={estilos.cabecalho}>
        <View style={{ flex: 1 }}>
          <Text style={estilos.eyebrow}>ACOMPANHAMENTO</Text>
          <Text style={estilos.titulo}>{nomeUsuario || "Carregando..."}</Text>
        </View>
        <Pressable onPress={() => supabase.auth.signOut()} style={estilos.botaoSair} hitSlop={8}>
          <Text style={estilos.sair}>Sair</Text>
        </Pressable>
      </View>

      {!usuarioId ? (
        <Text style={estilos.vazio}>Nenhum usuário vinculado à sua conta ainda.</Text>
      ) : medicamentos.length === 0 ? (
        <Text style={estilos.vazio}>Nenhum medicamento cadastrado por enquanto.</Text>
      ) : (
        <FlatList
          data={medicamentos}
          keyExtractor={(m) => m.id}
          contentContainerStyle={estilos.lista}
          renderItem={({ item }) => {
            const status = statusDoMedicamento(item.id);
            const rotulo = ROTULOS[status];
            return (
              <View style={[estilos.item, { borderLeftColor: rotulo.tarja }]}>
                <View style={{ flex: 1 }}>
                  <Text style={estilos.nome}>💊 {item.nome}</Text>
                  <Text style={estilos.dose}>{item.dose}</Text>
                  <Text style={estilos.horario}>⏰ {item.horario.slice(0, 5)}</Text>
                </View>
                <View style={[estilos.badge, { backgroundColor: rotulo.bg }]}>
                  <Text style={[estilos.badgeTexto, { color: rotulo.cor }]}>{rotulo.texto}</Text>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const ROTULOS = {
  tomado: { texto: "🟢 Tomado", bg: cores.sucessoSuave, cor: "#33502B", tarja: cores.sucesso },
  perdido: { texto: "🔴 Não tomou", bg: cores.amoraSuave, cor: "#7C2E3B", tarja: cores.amora },
  pendente: { texto: "🟡 Pendente", bg: cores.ambarSuave, cor: "#7A5417", tarja: cores.ambar },
};

const estilos = StyleSheet.create({
  raiz: { flex: 1, backgroundColor: cores.bg },
  cabecalho: {
    backgroundColor: cores.primaria,
    paddingTop: 56,
    paddingBottom: espaco.lg,
    paddingHorizontal: espaco.lg,
    flexDirection: "row",
    alignItems: "center",
  },
  eyebrow: { fontFamily: fontes.dado, fontSize: 11, letterSpacing: 1.5, color: "rgba(255,255,255,0.7)" },
  titulo: { fontFamily: fontes.display, fontSize: 20, color: "#fff", marginTop: 2 },
  botaoSair: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.6)",
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  sair: { color: "#fff", fontSize: 14, fontWeight: "700" },
  vazio: { fontFamily: fontes.corpo, color: cores.tintaSuave, fontSize: 15, textAlign: "center", marginTop: espaco.xl },
  lista: { padding: espaco.md, gap: espaco.sm },
  item: {
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.linha,
    borderLeftWidth: 6,
    borderRadius: raio.pequeno,
    padding: espaco.md,
    flexDirection: "row",
    alignItems: "center",
    gap: espaco.sm,
  },
  nome: { fontFamily: fontes.display, fontSize: 16, color: cores.tinta },
  dose: { fontFamily: fontes.corpo, fontSize: 13, color: cores.tintaSuave },
  horario: { fontFamily: fontes.dado, fontSize: 12, color: cores.tintaSuave, marginTop: 2 },
  badge: { borderRadius: raio.pilula, paddingVertical: 5, paddingHorizontal: 10 },
  badgeTexto: { fontFamily: fontes.dado, fontSize: 11, fontWeight: "600" },
});