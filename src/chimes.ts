import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from "expo-audio";

import type { ChimeTone } from "./time";

const lowSource = require("../assets/sounds/chime.mp3");
const highSource = require("../assets/sounds/chime-final.mp3");

let preparing: Promise<void> | null = null;
let lowPlayer: AudioPlayer | null = null;
let highPlayers: AudioPlayer[] = [];
let highCursor = 0;
const replayTail = new WeakMap<AudioPlayer, Promise<void>>();

export function prepareChimes(): Promise<void> {
  if (!preparing) {
    preparing = (async () => {
      await setAudioModeAsync({
        playsInSilentMode: true,
        interruptionMode: "mixWithOthers",
        shouldPlayInBackground: false,
      });
      lowPlayer = createAudioPlayer(lowSource);
      lowPlayer.volume = 1;
      highPlayers = [0, 1, 2].map(() => {
        const player = createAudioPlayer(highSource);
        player.volume = 1;
        return player;
      });
    })().catch((error: unknown) => {
      preparing = null;
      throw error;
    });
  }
  return preparing;
}

function replay(player: AudioPlayer): Promise<void> {
  const previous = replayTail.get(player) ?? Promise.resolve();
  const next = previous
    .catch(() => undefined)
    .then(async () => {
      await player.seekTo(0);
      player.play();
    });
  replayTail.set(player, next);
  return next;
}

export async function playChime(tone: ChimeTone): Promise<void> {
  try {
    await prepareChimes();
    const player = tone === "low" ? lowPlayer : highPlayers[highCursor++ % highPlayers.length];
    if (!player) {
      return;
    }
    await replay(player);
  } catch (error) {
    console.warn("Countdown chime failed", error);
  }
}

export function stopChimes(): void {
  lowPlayer?.pause();
  for (const player of highPlayers) {
    player.pause();
  }
}
