import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { cores, fontes, espaco, raio } from "../theme";

export default function Header({ somLigado, onAlternarSom, dica, onSair }) {
  return (
    <View style={estilos.container}>
      {onSair ? (
        <Pressable onPress={onSair} style={estilos.botaoSair} hitSlop={8}>
          <Text style={estilos.botaoSairTexto}>Sair</Text>
        </Pressable>
      ) : null}
      <View style={estilos.marca}>
        <View style={estilos.selo}>
          <Text style={estilos.seloTexto}>✚</Text>
        </View>
        <View>
          <Text style={estilos.titulo}>Meu Controle de{"\n"}Medicamentos</Text>
          <Text style={estilos.legenda}>SEU ORGANIZADOR DE HORÁRIOS</Text>
        </View>
      </View>

      <Pressable
        onPress={onAlternarSom}
        style={[estilos.botaoSom, somLigado ? estilos.botaoSomLigado : estilos.botaoSomDesligado]}
      >
        <View style={[estilos.bolinha, somLigado ? estilos.bolinhaLigada : estilos.bolinhaDesligada]} />
        <Text style={estilos.botaoSomTexto}>
          {somLigado ? "Som do alarme ligado" : "Som do alarme desligado"}
        </Text>
      </Pressable>
      {dica ? <Text style={estilos.dica}>{dica}</Text> : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  botaoSair: {
    position: "absolute",
    top: 52,
    right: espaco.lg,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.6)",
    backgroundColor: "rgba(255,255,255,0.14)",
    zIndex: 2,
  },
  botaoSairTexto: { color: "#fff", fontSize: 14, fontWeight: "700" },
  container: {
    backgroundColor: cores.primaria,
    paddingTop: 56,
    paddingBottom: espaco.lg,
    paddingHorizontal: espaco.lg,
    gap: espaco.md,
  },
  marca: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaco.sm,
  },
  selo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  seloTexto: { color: "#fff", fontSize: 20 },
  titulo: { fontFamily: fontes.display, color: "#fff", fontSize: 20, lineHeight: 24 },
  legenda: {
    fontFamily: fontes.dado,
    color: "rgba(255,255,255,0.75)",
    fontSize: 11,
    letterSpacing: 1,
    marginTop: 4,
  },
  botaoSom: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    alignSelf: "flex-start",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: raio.pequeno,
    borderWidth: 1.5,
  },
  botaoSomLigado: {
    backgroundColor: "rgba(79,121,66,0.35)",
    borderColor: "rgba(153,209,132,0.7)",
  },
  botaoSomDesligado: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderColor: "rgba(255,255,255,0.55)",
  },
  botaoSomTexto: { fontFamily: fontes.corpoSemiNegrito, color: "#fff", fontSize: 15 },
  bolinha: { width: 10, height: 10, borderRadius: 5 },
  bolinhaLigada: { backgroundColor: "#8FE3A0" },
  bolinhaDesligada: { backgroundColor: "rgba(255,255,255,0.35)" },
  dica: {
    fontFamily: fontes.corpo,
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
  },
});