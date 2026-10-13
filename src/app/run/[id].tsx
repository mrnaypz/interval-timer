import { router, useLocalSearchParams } from "expo-router";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useRef, useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText } from "../../components/AppText";
import { BlackButton } from "../../components/BlackButton";
import { playChime, prepareChimes, stopChimes } from "../../chimes";
import { usePresets } from "../../presets";
import { colors } from "../../theme";
import {
  buildPhases,
  countdownChimes,
  displaySeconds,
  formatClock,
  formatSets,
  formatTotal,
  phaseAt,
  phaseLabel,
  workoutSeconds,
} from "../../time";

export default function RunScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { presets, ready, removePreset } = usePresets();
  const preset = presets.find((item) => item.id === id);
  const phases = useMemo(
    () => (preset ? buildPhases(preset.sets, preset.workSec, preset.restSec) : []),
    [preset],
  );
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [pausedAt, setPausedAt] = useState<number | null>(null);
  const [pauseTotal, setPauseTotal] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [confirmingExit, setConfirmingExit] = useState(false);

  const chimeEvents = useMemo(() => countdownChimes(phases), [phases]);
  const playedChimes = useRef(new Set<number>());
  const elapsedMs = startedAt === null ? 0 : (pausedAt ?? now) - startedAt - pauseTotal;
  const workoutRunning = startedAt !== null && phaseAt(phases, elapsedMs).kind !== "done";

  useEffect(() => {
    if (!workoutRunning) {
      return;
    }
    void activateKeepAwakeAsync("workout").catch(() => undefined);
    return () => {
      void deactivateKeepAwake("workout").catch(() => undefined);
    };
  }, [workoutRunning]);

  useEffect(() => {
    void prepareChimes();
    return () => {
      stopChimes();
    };
  }, []);

  useEffect(() => {
    if (startedAt === null || pausedAt !== null) {
      return;
    }
    const timer = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(timer);
  }, [pausedAt, startedAt]);

  useEffect(() => {
    playedChimes.current = new Set();
  }, [startedAt]);

  useEffect(() => {
    if (startedAt === null || pausedAt !== null) {
      return;
    }
    const elapsed = now - startedAt - pauseTotal;
    for (const event of chimeEvents) {
      if (playedChimes.current.has(event.atMs)) {
        continue;
      }
      const late = elapsed - event.atMs;
      if (late < 0) {
        continue;
      }
      playedChimes.current.add(event.atMs);
      if (late < 700) {
        void playChime(event.tone);
      }
    }
  }, [chimeEvents, now, pauseTotal, pausedAt, startedAt]);

  if (!ready) {
    return <SafeAreaView style={styles.screen} />;
  }

  if (!preset) {
    return (
      <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
        <View style={styles.stage}>
          <View style={styles.balance} />
          <View style={styles.timerBlock}>
            <AppText style={styles.phase}>MISSING</AppText>
          </View>
          <View style={styles.footer}>
            <BlackButton label="MENU" onPress={() => router.replace("/")} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (startedAt === null) {
    return (
      <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
        <View style={styles.stage}>
          <View style={styles.summarySlot}>
            <View style={styles.summary}>
              <SummaryLine label="WORK" value={formatClock(preset.workSec)} />
              <SummaryLine label="REST" value={formatClock(preset.restSec)} />
              <SummaryLine
                label="TOTAL"
                value={formatTotal(workoutSeconds(preset.sets, preset.workSec, preset.restSec))}
              />
            </View>
          </View>
          <View style={styles.centerAction}>
            <BlackButton
              label="START"
              onPress={() => {
                const at = Date.now();
                setStartedAt(at);
                setNow(at);
              }}
            />
          </View>
          <View style={styles.bottomActions}>
            <BlackButton label="BACK" onPress={() => router.replace("/")} />
            <BlackButton
              label="EDIT"
              onPress={() => router.push({ pathname: "/new-timer", params: { id: preset.id } })}
            />
            <BlackButton label="DELETE" onPress={() => setConfirmingDelete(true)} />
          </View>
        </View>
        <ConfirmDialog
          title="Delete this preset?"
          visible={confirmingDelete}
          onNo={() => setConfirmingDelete(false)}
          onYes={() => {
            void removePreset(preset.id).then(() => router.replace("/"));
          }}
        />
      </SafeAreaView>
    );
  }

  const phase = phaseAt(phases, elapsedMs);
  const inverted = phase.kind === "countdown" || phase.kind === "rest";
  const ink = inverted ? colors.white : colors.black;
  const buttonTone = inverted ? "white" : "black";

  return (
    <SafeAreaView style={[styles.screen, inverted && styles.inverted]} edges={["top", "bottom"]}>
      <StatusBar style={inverted ? "light" : "dark"} />
      <View style={styles.stage}>
        <View style={styles.timerArea}>
          <View style={styles.timerGroup}>
            <View style={styles.timerPair}>
              <AppText style={[styles.phase, { color: ink }]}>SETS</AppText>
              <AppText style={[styles.clock, { color: ink }]}>{formatSets(phase.setsLeft)}</AppText>
            </View>
            <View style={styles.timerPair}>
              <AppText style={[styles.phase, { color: ink }]}>{phaseLabel(phase.kind)}</AppText>
              <AppText style={[styles.clock, { color: ink }]}>{formatClock(displaySeconds(phase.remainingMs))}</AppText>
            </View>
          </View>
        </View>
        <View style={styles.runFooter}>
          {phase.kind === "done" ? (
            <BlackButton label="MENU" onPress={() => router.replace("/")} />
          ) : (
            <>
              <BlackButton
                label={pausedAt === null ? "PAUSE" : "RESUME"}
                tone={buttonTone}
                onPress={() => {
                  if (pausedAt === null) {
                    setPausedAt(Date.now());
                    return;
                  }
                  setPauseTotal((total) => total + (Date.now() - pausedAt));
                  setPausedAt(null);
                  setNow(Date.now());
                }}
              />
              <BlackButton label="EXIT" tone={buttonTone} onPress={() => setConfirmingExit(true)} />
            </>
          )}
        </View>
      </View>
      <ConfirmDialog
        title="Exit this workout?"
        visible={confirmingExit}
        onNo={() => setConfirmingExit(false)}
        onYes={() => router.back()}
      />
    </SafeAreaView>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryLine}>
      <AppText style={styles.summaryLabel}>{label}</AppText>
      <AppText style={styles.summaryDash}>-</AppText>
      <AppText style={styles.summaryValue}>{value}</AppText>
    </View>
  );
}

function ConfirmDialog({
  title,
  visible,
  onYes,
  onNo,
}: {
  title: string;
  visible: boolean;
  onYes: () => void;
  onNo: () => void;
}) {
  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onNo}>
      <Pressable accessibilityLabel="Close" style={styles.backdrop} onPress={onNo}>
        <Pressable style={styles.card} onPress={() => undefined}>
          <AppText style={styles.confirmTitle}>{title}</AppText>
          <BlackButton label="YES" onPress={onYes} />
          <BlackButton label="NO" onPress={onNo} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.white,
    flex: 1,
  },
  inverted: {
    backgroundColor: colors.black,
  },
  stage: {
    flex: 1,
  },
  balance: {
    flex: 1,
  },
  summarySlot: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  summary: {
    alignSelf: "stretch",
    gap: 10,
  },
  summaryLine: {
    alignItems: "center",
    flexDirection: "row",
  },
  summaryLabel: {
    flex: 1,
    fontSize: 34,
    paddingRight: 16,
    textAlign: "right",
  },
  summaryDash: {
    fontSize: 34,
    textAlign: "center",
  },
  summaryValue: {
    flex: 1,
    fontSize: 34,
    paddingLeft: 16,
  },
  centerAction: {
    paddingHorizontal: 20,
  },
  bottomActions: {
    flex: 1,
    gap: 12,
    justifyContent: "flex-end",
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  timerBlock: {
    alignItems: "center",
    justifyContent: "center",
  },
  timerArea: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  timerGroup: {
    alignItems: "center",
    gap: 48,
  },
  timerPair: {
    alignItems: "center",
    gap: 36,
  },
  phase: {
    fontSize: 42,
    textAlign: "center",
  },
  clock: {
    fontSize: 112,
    textAlign: "center",
  },
  footer: {
    flex: 1,
    gap: 12,
    justifyContent: "flex-end",
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  runFooter: {
    gap: 12,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backdrop: {
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    gap: 12,
    padding: 24,
    width: "100%",
  },
  confirmTitle: {
    fontSize: 22,
    marginBottom: 4,
    textAlign: "center",
  },
});
