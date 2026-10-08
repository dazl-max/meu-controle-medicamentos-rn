import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { supabase } from "../utils/supabase";
import { cores, fontes, espaco, raio } from "../theme";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  async function entrar() {
    setErro("");
    if (!email.trim() || !senha) {
      setErro("Preencha e-mail e senha.");
      return;
    }
    setCarregando(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: senha,
    });
    setCarregando(false);
    if (error) setErro("E-mail ou senha inválidos.");
  }

  return (
    <KeyboardAvoidingView
      style={estilos.raiz}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={estilos.container}>
        <Text style={estilos.selo}>✚</Text>
        <Text style={estilos.titulo}>Meu Controle de{"\n"}Medicamentos</Text>
        <Text style={estilos.subtitulo}>Entre com sua conta</Text>

        <View style={estilos.campo}>
          <Text style={estilos.rotulo}>E-mail</Text>
          <TextInput
            style={estilos.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="seu@email.com"
            placeholderTextColor={cores.tintaSuave}
          />
        </View>

        <View style={estilos.campo}>
          <Text style={estilos.rotulo}>Senha</Text>
          <TextInput
            style={estilos.input}
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor={cores.tintaSuave}
          />
        </View>

        {erro ? <Text style={estilos.erro}>{erro}</Text> : null}

        <Pressable style={estilos.botao} onPress={entrar} disabled={carregando}>
          {carregando ? <ActivityIndicator color="#fff" /> : <Text style={estilos.botaoTexto}>Entrar</Text>}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  raiz: { flex: 1, backgroundColor: cores.bg },
  container: { flex: 1, padding: espaco.xl, justifyContent: "center", gap: espaco.md },
  selo: { fontSize: 36, textAlign: "center", color: cores.primaria, marginBottom: 4 },
  titulo: { fontFamily: fontes.display, fontSize: 24, textAlign: "center", color: cores.tinta, lineHeight: 30 },
  subtitulo: {
    fontFamily: fontes.corpo,
    fontSize: 15,
    textAlign: "center",
    color: cores.tintaSuave,
    marginBottom: espaco.lg,
  },
  campo: { gap: 6 },
  rotulo: { fontFamily: fontes.corpoSemiNegrito, fontSize: 14, color: cores.primariaEscura },
  input: {
    fontFamily: fontes.corpo,
    fontSize: 16,
    padding: 13,
    borderWidth: 2,
    borderColor: cores.linha,
    borderRadius: raio.pequeno,
    backgroundColor: "#fff",
    color: cores.tinta,
  },
  erro: { fontFamily: fontes.corpo, color: cores.amora, fontSize: 14, textAlign: "center" },
  botao: {
    backgroundColor: cores.primaria,
    borderRadius: raio.pequeno,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: espaco.xs,
  },
  botaoTexto: { fontFamily: fontes.corpoNegrito, color: "#fff", fontSize: 16 },
});
