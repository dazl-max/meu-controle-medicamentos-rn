import React from "react";
import { Modal, View, Text, Pressable, StyleSheet } from "react-native";
import { cores, fontes, espaco, raio } from "../theme";

export default function AlertModal({ visivel, medicamento, onTomei, onFechar }) {
  if (!medicamento) return null;

  return (
    <Modal visible={visivel} transparent animationType="fade" statusBarTranslucent>
      <View style={estilos.overlay}>
        <View style={estilos.cartao}>
          <View style={estilos.faixa}>
            <Text style={estilos.sino}>🔔</Text>
            <Text style={estilos.tituloFaixa}>Hora do medicamento!</Text>
          </View>

          <Text style={estilos.nome}>💊 {medicamento.nome}</Text>
          <Text style={estilos.dose}>{medicamento.dose}</Text>
          <Text style={estilos.horario}>Horário: {medicamento.horario}</Text>

          <View style={estilos.botoes}>
            <Pressable style={estilos.botaoTomei} onPress={onTomei}>
              <Text style={estilos.botaoTomeiTexto}>✓ Tomei</Text>
            </Pressable>
            <Pressable style={estilos.botaoFechar} onPress={onFechar}>
              <Text style={estilos.botaoFecharTexto}>Fechar</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const estilos = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15,26,21,0.62)",
    alignItems: "center",
    justifyContent: "center",
    padding: espaco.lg,
  },
  cartao: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: cores.superficie,
    borderRadius: 22,
    overflow: "hidden",
    alignItems: "center",
  },
  faixa: {
    width: "100%",
    backgroundColor: cores.amora,
    alignItems: "center",
    paddingTop: 26,
    paddingBottom: 20,
    paddingHorizontal: espaco.lg,
  },
  sino: { fontSize: 42 },
  tituloFaixa: { fontFamily: fontes.display, fontSize: 22, color: "#fff", marginTop: 6 },
  nome: { fontFamily: fontes.display, fontSize: 24, color: cores.tinta, marginTop: 22 },
  dose: { fontFamily: fontes.corpo, fontSize: 17, color: cores.tintaSuave, marginTop: 4, paddingHorizontal: espaco.lg, textAlign: "center" },
  horario: { fontFamily: fontes.dado, fontSize: 17, color: cores.primaria, fontWeight: "600", marginTop: 10, marginBottom: 22 },
  botoes: { flexDirection: "row", gap: 12, paddingHorizontal: espaco.lg, paddingBottom: 26, width: "100%" },
  botaoTomei: { flex: 1, backgroundColor: cores.sucesso, borderRadius: raio.pequeno, paddingVertical: 16, alignItems: "center" },
  botaoTomeiTexto: { fontFamily: fontes.corpoNegrito, color: "#fff", fontSize: 17 },
  botaoFechar: { flex: 1, backgroundColor: cores.superficieAlt, borderRadius: raio.pequeno, paddingVertical: 16, alignItems: "center" },
  botaoFecharTexto: { fontFamily: fontes.corpoNegrito, color: cores.tinta, fontSize: 17 },
});
