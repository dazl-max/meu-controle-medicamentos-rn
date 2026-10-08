import { createAudioPlayer } from "expo-audio";

let player = null;

function garantirPlayer() {
  if (!player) {
    player = createAudioPlayer(require("../../assets/alarm.wav"));
  }
  return player;
}

export async function tocarSomAlerta() {
  try {
    const p = garantirPlayer();
    await p.seekTo(0);
    p.play();
  } catch {
    /* se o áudio falhar, o card visual e a notificação continuam funcionando */
  }
}

export function descarregarSom() {
  if (player) {
    player.release();
    player = null;
  }
}
