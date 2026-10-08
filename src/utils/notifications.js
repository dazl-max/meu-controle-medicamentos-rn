import { Platform } from "react-native";
import Constants, { ExecutionEnvironment } from "expo-constants";

/* No Expo Go (Android, SDK 53+) o expo-notifications quebra já no import.
   Então só carregamos o módulo no APK/build de verdade. No Expo Go o app
   roda normalmente, só sem as notificações nativas. */
export const rodandoNoExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

const Notifications = rodandoNoExpoGo ? null : require("expo-notifications");

// Faz a notificação aparecer mesmo com o app aberto em primeiro plano.
Notifications?.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false, // o som do alarme é controlado à parte, ver src/utils/sound.js
    shouldSetBadge: false,
  }),
});

/* Pede permissão e devolve o token de push deste celular (ou null). */
export async function obterTokenPush() {
  if (!Notifications) return null;
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") return null;
  const { data } = await Notifications.getExpoPushTokenAsync();
  return data;
}

export async function solicitarPermissaoNotificacoes() {
  if (!Notifications) return "denied";
  const { status: statusAtual } = await Notifications.getPermissionsAsync();
  if (statusAtual === "granted") return "granted";

  const { status } = await Notifications.requestPermissionsAsync();

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("lembretes-medicamentos", {
      name: "Lembretes de medicamentos",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  return status;
}

export async function statusPermissaoNotificacoes() {
  if (!Notifications) return "denied";
  const { status } = await Notifications.getPermissionsAsync();
  return status; // "granted" | "denied" | "undetermined"
}

/* Agenda um lembrete NATIVO diário e recorrente para um medicamento —
   funciona mesmo com o app fechado, diferente da verificação em primeiro
   plano feita no App.js (que cuida do card visual e do som). */
export async function agendarNotificacaoDiaria(med) {
  if (!Notifications) return null;
  const [hora, minuto] = med.horario.split(":").map(Number);

  const notificacaoId = await Notifications.scheduleNotificationAsync({
    content: {
      title: "💊 Hora do medicamento",
      body: `${med.nome} — ${med.dose}`,
    },
    trigger: {
      hour: hora,
      minute: minuto,
      repeats: true,
      channelId: "lembretes-medicamentos",
    },
  });

  return notificacaoId;
}

export async function cancelarNotificacao(notificacaoId) {
  if (!Notifications || !notificacaoId) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificacaoId);
  } catch {
    /* já pode ter sido cancelada; sem problema */
  }
}