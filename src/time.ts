export const COUNTDOWN_MS = 5000;
export const MAX_SETS = 99;
export const MAX_TIME_SEC = 99 * 60 + 59;
export const TIME_STEP_SEC = 5;

export type PhaseKind = "countdown" | "work" | "rest";

export type Phase = {
  kind: PhaseKind;
  durationMs: number;
};

export function formatSets(sets: number): string {
  return String(Math.max(0, sets)).padStart(2, "0");
}

/** Editor display: minutes.seconds, for example 00.45 or 01.30. */
export function formatEditorTime(totalSec: number): string {
  const clamped = Math.max(0, Math.min(MAX_TIME_SEC, totalSec));
  const minutes = Math.floor(clamped / 60);
  const seconds = clamped % 60;
  return `${String(minutes).padStart(2, "0")}.${String(seconds).padStart(2, "0")}`;
}

/** Workout length: 15:00, or 1:05:00 once it passes an hour. */
export function formatTotal(totalSec: number): string {
  const safe = Math.max(0, totalSec);
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  const clock = `${minutes}:${String(seconds).padStart(2, "0")}`;
  return hours > 0 ? `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}` : clock;
}

export function formatClock(totalSec: number): string {
  const safe = Math.max(0, totalSec);
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function workoutSeconds(sets: number, workSec: number, restSec: number): number {
  return sets * (workSec + restSec);
}

export function presetLabel(sets: number, workSec: number, restSec: number): string {
  return `${workSec}/${restSec} - ${formatTotal(workoutSeconds(sets, workSec, restSec))}`;
}

export function parseSets(input: string): number | null {
  const trimmed = input.trim();
  if (!/^\d{1,2}$/.test(trimmed)) {
    return null;
  }
  const value = Number(trimmed);
  if (value > MAX_SETS) {
    return null;
  }
  return value;
}

/**
 * Accepts minutes.seconds (00.45), minutes:seconds (1:30), or a whole number of seconds (45).
 */
export function parseDuration(input: string): number | null {
  const trimmed = input.trim();
  const clock = trimmed.match(/^(\d{1,2})[.:](\d{1,2})$/);
  if (clock) {
    const minutes = Number(clock[1]);
    const seconds = Number(clock[2]);
    if (seconds >= 60 || minutes > 99) {
      return null;
    }
    const total = minutes * 60 + seconds;
    return total > MAX_TIME_SEC ? null : total;
  }
  if (/^\d{1,4}$/.test(trimmed)) {
    const total = Number(trimmed);
    return total > MAX_TIME_SEC ? null : total;
  }
  return null;
}

export function stepSets(current: number, delta: number): number {
  return Math.max(0, Math.min(MAX_SETS, current + delta));
}

export function stepTime(current: number, delta: number): number {
  return Math.max(0, Math.min(MAX_TIME_SEC, current + delta));
}

export function buildPhases(sets: number, workSec: number, restSec: number): Phase[] {
  const phases: Phase[] = [{ kind: "countdown", durationMs: COUNTDOWN_MS }];
  for (let index = 0; index < sets; index += 1) {
    if (workSec > 0) {
      phases.push({ kind: "work", durationMs: workSec * 1000 });
    }
    if (restSec > 0) {
      phases.push({ kind: "rest", durationMs: restSec * 1000 });
    }
  }
  return phases;
}

export function phaseAt(
  phases: Phase[],
  elapsedMs: number,
): { kind: PhaseKind | "done"; remainingMs: number } {
  let cursor = 0;
  for (const phase of phases) {
    const end = cursor + phase.durationMs;
    if (elapsedMs < end) {
      return { kind: phase.kind, remainingMs: end - elapsedMs };
    }
    cursor = end;
  }
  return { kind: "done", remainingMs: 0 };
}

export function displaySeconds(remainingMs: number): number {
  if (remainingMs <= 0) {
    return 0;
  }
  return Math.ceil(remainingMs / 1000);
}

export function phaseLabel(kind: PhaseKind | "done"): string {
  switch (kind) {
    case "countdown":
      return "COUNTDOWN";
    case "work":
      return "WORK";
    case "rest":
      return "REST";
    default:
      return "DONE";
  }
}
