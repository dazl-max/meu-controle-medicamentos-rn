import React, { useEffect, useState } from "react";
import { View, StatusBar, ActivityIndicator } from "react-native";
import { useFonts, Fraunces_500Medium, Fraunces_600SemiBold } from "@expo-google-fonts/fraunces";
import { PublicSans_400Regular, PublicSans_600SemiBold, PublicSans_700Bold } from "@expo-google-fonts/public-sans";
import { IBMPlexMono_600SemiBold } from "@expo-google-fonts/ibm-plex-mono";
import * as SplashScreen from "expo-splash-screen";

import { cores } from "./src/theme";
import { supabase } from "./src/utils/supabase";
import { carregarProprioPerfil } from "./src/utils/cloudData";
import LoginScreen from "./src/screens/LoginScreen";
import UserScreen from "./src/screens/UserScreen";
import AdminScreen from "./src/screens/AdminScreen";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [fontesCarregadas] = useFonts({
    Fraunces_500Medium,
    Fraunces_600SemiBold,
    PublicSans_400Regular,
    PublicSans_600SemiBold,
    PublicSans_700Bold,
    IBMPlexMono_600SemiBold,
  });

  const [sessao, setSessao] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [carregandoSessao, setCarregandoSessao] = useState(true);

  // Observa login/logout
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSessao(data.session);
      setCarregandoSessao(false);
    });

    const { data: assinatura } = supabase.auth.onAuthStateChange((_evento, novaSessao) => {
      setSessao(novaSessao);
      if (!novaSessao) setPerfil(null);
    });

    return () => assinatura.subscription.unsubscribe();
  }, []);

  // Depois de logado, busca o papel (usuario | admin) do perfil
  useEffect(() => {
    if (!sessao) return;
    (async () => {
      try {
        const dados = await carregarProprioPerfil(sessao.user.id);
        setPerfil(dados);
      } catch {
        setPerfil(null);
      }
    })();
  }, [sessao]);

  useEffect(() => {
    if (fontesCarregadas && !carregandoSessao) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontesCarregadas, carregandoSessao]);

  if (!fontesCarregadas || carregandoSessao) return null;

  return (
    <View style={{ flex: 1, backgroundColor: cores.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={cores.primaria} />

      {!sessao ? (
        <LoginScreen />
      ) : !perfil ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={cores.primaria} size="large" />
        </View>
      ) : perfil.papel === "admin" ? (
        <AdminScreen session={sessao} />
      ) : (
        <UserScreen session={sessao} />
      )}
    </View>
  );
}
