import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";
import { cores, fontes, espaco, raio } from "../theme";

export default function MedicationForm({ onAdicionar }) {
  const [nome, setNome] = useState("");
  const [dose, setDose] = useState("");
  const [horario, setHorario] = useState("");

  function tratarHorarioDigitado(texto) {
    // Aceita digitação livre e formata como HH:MM automaticamente.
    const digitos = texto.replace(/\D/g, "").slice(0, 4);
    if (digitos.length <= 2) {
      setHorario(digitos);
    } else {
      setHorario(`${digitos.slice(0, 2)}:${digitos.slice(2)}`);
    }
  }

  function horarioValido(valor) {
    return /^([01]\d|2[0-3]):[0-5]\d$/.test(valor);
  }

  function enviar() {
    if (!nome.trim() || !dose.trim() || !horarioValido(horario)) return;
    onAdicionar(nome.trim(), dose.trim(), horario);
    setNome("");
    setDose("");
    setHorario("");
  }

  const podeEnviar = nome.trim() && dose.trim() && horarioValido(horario);

  return (
    <View style={estilos.card}>
      <Text style={estilos.titulo}>Cadastrar medicamento</Text>

      <View style={estilos.campo}>
        <Text style={estilos.rotulo}>Nome do medicamento</Text>
        <TextInput
          style={estilos.input}
          value={nome}
          onChangeText={setNome}
          placeholder="Ex: Metformina"
          placeholderTextColor={cores.tintaSuave}
        />
      </View>

      <View style={estilos.campo}>
        <Text style={estilos.rotulo}>Dose</Text>
        <TextInput
          style={estilos.input}
          value={dose}
          onChangeText={setDose}
          placeholder="Ex: 500 mg — 1 comprimido"
          placeholderTextColor={cores.tintaSuave}
        />
      </View>

      <View style={estilos.campo}>
        <Text style={estilos.rotulo}>Horário (HH:MM)</Text>
        <TextInput
          style={estilos.input}
          value={horario}
          onChangeText={tratarHorarioDigitado}
          placeholder="Ex: 18:00"
          placeholderTextColor={cores.tintaSuave}
          keyboardType="number-pad"
          maxLength={5}
        />
      </View>

      <Pressable
        onPress={enviar}
        disabled={!podeEnviar}
        style={[estilos.botao, !podeEnviar && estilos.botaoDesabilitado]}
      >
        <Text style={estilos.botaoTexto}>+ Adicionar medicamento</Text>
      </Pressable>
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
    gap: espaco.md,
  },
  titulo: { fontFamily: fontes.display, fontSize: 19, color: cores.tinta },
  campo: { gap: 6 },
  rotulo: { fontFamily: fontes.corpoSemiNegrito, fontSize: 14, color: cores.primariaEscura },
  input: {
    fontFamily: fontes.corpo,
    fontSize: 17,
    padding: 13,
    borderWidth: 2,
    borderColor: cores.linha,
    borderRadius: raio.pequeno,
    backgroundColor: "#fcfdfa",
    color: cores.tinta,
  },
  botao: {
    backgroundColor: cores.primaria,
    borderRadius: raio.pequeno,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: espaco.xs,
  },
  botaoDesabilitado: { opacity: 0.45 },
  botaoTexto: { fontFamily: fontes.corpoNegrito, color: "#fff", fontSize: 16 },
});
