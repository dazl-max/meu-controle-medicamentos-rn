import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Easing } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { cores, fontes, espaco, raio } from "../theme";
import { formatarMinutos } from "../utils/time";

const RAIO_ANEL = 52;
const CIRCUNFERENCIA = 2 * Math.PI * RAIO_ANEL;
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function SummaryRing({ proximo, minutosRestantes, horaDeTomarAgora, tudoTomado, temMedicamentos }) {
  const progresso = useRef(new Animated.Value(0)).current;
  const pulso = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let percentual = 0;
    if (proximo) {
      percentual = horaDeTomarAgora ? 1 : 1 - Math.min(minutosRestantes, 120) / 120;
    }
    Animated.timing(progresso, {
      toValue: percentual,
      duration: 600,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [proximo, minutosRestantes, horaDeTomarAgora]);

  useEffect(() => {
    if (!horaDeTomarAgora) {
      pulso.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulso, { toValue: 0.55, duration: 700, useNativeDriver: true }),
        Animated.timing(pulso, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [horaDeTomarAgora]);

  const dashoffset = progresso.interpolate({
    inputRange: [0, 1],
    outputRange: [CIRCUNFERENCIA, 0],
  });

  return (
    <View style={estilos.card}>
      <Text style={estilos.eyebrow}>{horaDeTomarAgora ? "🔔 Hora do medicamento!" : "Próximo medicamento"}</Text>

      <View style={estilos.corpo}>
        <View style={estilos.anelWrap}>
          <Svg width={110} height={110} viewBox="0 0 120 120">
            <Circle cx="60" cy="60" r={RAIO_ANEL} stroke={cores.superficieAlt} strokeWidth={9} fill="none" />
            <AnimatedCircle
              cx="60"
              cy="60"
              r={RAIO_ANEL}
              stroke={horaDeTomarAgora ? cores.amora : cores.primaria}
              strokeWidth={9}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${CIRCUNFERENCIA}`}
              strokeDashoffset={dashoffset}
              rotation="-90"
              origin="60, 60"
            />
          </Svg>
          <Animated.Text style={[estilos.anelEmoji, { opacity: pulso }]}>💊</Animated.Text>
        </View>

        <View style={estilos.info}>
          {!temMedicamentos && <Text style={estilos.vazio}>Nenhum medicamento cadastrado ainda.</Text>}
          {temMedicamentos && tudoTomado && (
            <Text style={estilos.vazio}>Todos os medicamentos de hoje já foram tomados. 🎉</Text>
          )}
          {proximo && (
            <>
              <Text style={estilos.nome}>💊 {proximo.nome}</Text>
              {horaDeTomarAgora ? (
                <>
                  <Text style={estilos.dose}>{proximo.dose}</Text>
                  <Text style={estilos.horarioAlerta}>⏰ {proximo.horario}</Text>
                </>
              ) : (
                <>
                  <Text style={estilos.horario}>⏰ {proximo.horario}</Text>
                  <Text style={estilos.contagem}>Faltam {formatarMinutos(minutosRestantes)}</Text>
                </>
              )}
            </>
          )}
        </View>
      </View>
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
  eyebrow: {
    fontFamily: fontes.dado,
    fontSize: 13,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: cores.primaria,
    marginBottom: espaco.md,
  },
  corpo: { flexDirection: "row", alignItems: "center", gap: espaco.lg, flexWrap: "wrap" },
  anelWrap: { width: 110, height: 110, alignItems: "center", justifyContent: "center" },
  anelEmoji: { position: "absolute", fontSize: 30 },
  info: { flex: 1, minWidth: 160, gap: 3 },
  vazio: { fontFamily: fontes.corpo, color: cores.tintaSuave, fontSize: 15 },
  nome: { fontFamily: fontes.display, fontSize: 20, color: cores.tinta },
  dose: { fontFamily: fontes.corpo, fontSize: 15, color: cores.tintaSuave },
  horario: { fontFamily: fontes.dado, fontSize: 15, color: cores.tintaSuave },
  horarioAlerta: { fontFamily: fontes.dado, fontSize: 18, fontWeight: "700", color: cores.amora },
  contagem: { fontFamily: fontes.dado, fontSize: 15, color: cores.primaria, fontWeight: "600" },
});
