import React from "react";
import { View, Text, Pressable, StyleSheet, FlatList } from "react-native";
import { cores, fontes, espaco, raio } from "../theme";
import { statusConsiderandoODia, horaAtualHHMM } from "../utils/time";

function MedicationItem({ med, onTomar, onExcluir }) {
  const tomadoHoje = statusConsiderandoODia(med);
  const horaDeTomar = !tomadoHoje && med.horario.slice(0, 5) === horaAtualHHMM();
  const status = tomadoHoje ? "tomado" : horaDeTomar ? "hora" : "pendente";

  const corTarja = { tomado: cores.sucesso, hora: cores.amora, pendente: cores.ambar }[status];
  const badge = {
    tomado: { texto: "🟢 Tomado", bg: cores.sucessoSuave, cor: "#33502B" },
    hora: { texto: "🔔 Hora de tomar", bg: cores.amoraSuave, cor: "#7C2E3B" },
    pendente: { texto: "🟡 Pendente", bg: cores.ambarSuave, cor: "#7A5417" },
  }[status];

  return (
    <View style={[estilos.item, { borderLeftColor: corTarja }]}>
      <View style={estilos.info}>
        <Text style={estilos.nome}>💊 {med.nome}</Text>
        <Text style={estilos.dose}>{med.dose}</Text>
        <Text style={estilos.horario}>⏰ {med.horario.slice(0, 5)}</Text>
        <View style={[estilos.badge, { backgroundColor: badge.bg }]}>
          <Text style={[estilos.badgeTexto, { color: badge.cor }]}>{badge.texto}</Text>
        </View>
      </View>

      <View style={estilos.acoes}>
        {!tomadoHoje && (
          <Pressable style={estilos.botaoTomar} onPress={() => onTomar(med.id)}>
            <Text style={estilos.botaoTomarTexto}>✓ Tomei</Text>
          </Pressable>
        )}
        <Pressable style={estilos.botaoExcluir} onPress={() => onExcluir(med.id)}>
          <Text style={estilos.botaoExcluirTexto}>Excluir</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function MedicationList({ medicamentos, onTomar, onExcluir }) {
  if (medicamentos.length === 0) {
    return (
      <View style={estilos.card}>
        <Text style={estilos.titulo}>Medicamentos cadastrados</Text>
        <Text style={estilos.vazio}>Nenhum medicamento cadastrado.</Text>
      </View>
    );
  }

  const ordenados = [...medicamentos].sort((a, b) => a.horario.localeCompare(b.horario));

  return (
    <View style={estilos.card}>
      <Text style={estilos.titulo}>Medicamentos cadastrados</Text>
      <FlatList
        data={ordenados}
        keyExtractor={(m) => String(m.id)}
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View style={{ height: espaco.sm }} />}
        renderItem={({ item }) => <MedicationItem med={item} onTomar={onTomar} onExcluir={onExcluir} />}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  card: {
    backgroundColor: cores.superficie,
    borderRadius: raio.grande,
    borderWidth: 1,
    borderColor: cores.linha,
    padding: espaco.lg,
  },
  titulo: { fontFamily: fontes.display, fontSize: 19, color: cores.tinta, marginBottom: espaco.md },
  vazio: { fontFamily: fontes.corpo, color: cores.tintaSuave, fontSize: 15 },
  item: {
    borderWidth: 1,
    borderColor: cores.linha,
    borderLeftWidth: 6,
    borderRadius: raio.pequeno,
    padding: espaco.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: espaco.sm,
    flexWrap: "wrap",
  },
  info: { flex: 1, minWidth: 150, gap: 2 },
  nome: { fontFamily: fontes.display, fontSize: 17, color: cores.tinta },
  dose: { fontFamily: fontes.corpo, fontSize: 14, color: cores.tintaSuave },
  horario: { fontFamily: fontes.dado, fontSize: 13, color: cores.tintaSuave, marginBottom: 4 },
  badge: { alignSelf: "flex-start", borderRadius: raio.pilula, paddingVertical: 4, paddingHorizontal: 10 },
  badgeTexto: { fontFamily: fontes.dado, fontSize: 12, fontWeight: "600" },
  acoes: { flexDirection: "row", gap: 8, alignItems: "center" },
  botaoTomar: { backgroundColor: cores.sucesso, borderRadius: raio.pilula, paddingVertical: 9, paddingHorizontal: 14 },
  botaoTomarTexto: { fontFamily: fontes.corpoSemiNegrito, color: "#fff", fontSize: 13 },
  botaoExcluir: {
    borderWidth: 1.5,
    borderColor: cores.amora,
    borderRadius: raio.pilula,
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  botaoExcluirTexto: { fontFamily: fontes.corpoSemiNegrito, color: cores.amora, fontSize: 13 },
});