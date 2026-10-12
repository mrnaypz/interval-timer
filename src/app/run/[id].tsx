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
  const [now, setNow] = useState(() => Date.now());
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const chimeEvents = useMemo(() => countdownChimes(phases), [phases]);
  const playedChimes = useRef(new Set<number>());
  const workoutRunning = startedAt !== null && phaseAt(phases, now - startedAt).kind !== "done";

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
    if (startedAt === null) {
      return;
    }
    const timer = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(timer);
  }, [startedAt]);

  useEffect(() => {
    playedChimes.current = new Set();
  }, [startedAt]);

  useEffect(() => {
    if (startedAt === null) {
      return;
    }
    const elapsed = now - startedAt;
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
  }, [chimeEvents, now, startedAt]);

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
            <BlackButton label="DELETE" onPress={() => setConfirmingDelete(true)} />
          </View>
        </View>
        <DeleteConfirm
          visible={confirmingDelete}
          onNo={() => setConfirmingDelete(false)}
          onYes={() => {
            void removePreset(preset.id).then(() => router.replace("/"));
          }}
        />
      </SafeAreaView>
    );
  }

  const phase = phaseAt(phases, now - startedAt);
  const inverted = phase.kind === "countdown" || phase.kind === "rest";
  const ink = inverted ? colors.white : colors.black;

  return (
    <SafeAreaView style={[styles.screen, inverted && styles.inverted]} edges={["top", "bottom"]}>
      <StatusBar style={inverted ? "light" : "dark"} />
      <View style={styles.stage}>
        <View style={styles.balance} />
        <View style={styles.timerBlock}>
          <AppText style={[styles.phase, { color: ink }]}>{phaseLabel(phase.kind)}</AppText>
          <AppText style={[styles.clock, { color: ink }]}>{formatClock(displaySeconds(phase.remainingMs))}</AppText>
        </View>
        <View style={styles.footer}>
          {phase.kind === "done" ? (
            <BlackButton label="MENU" onPress={() => router.replace("/")} />
          ) : (
            <BlackButton
              label="EXIT"
              tone={inverted ? "white" : "black"}
              onPress={() => router.back()}
            />
          )}
        </View>
      </View>
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

function DeleteConfirm({
  visible,
  onYes,
  onNo,
}: {
  visible: boolean;
  onYes: () => void;
  onNo: () => void;
}) {
  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onNo}>
      <Pressable accessibilityLabel="Close" style={styles.backdrop} onPress={onNo}>
        <Pressable style={styles.card} onPress={() => undefined}>
          <AppText style={styles.confirmTitle}>Delete this preset?</AppText>
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
    gap: 10,
  },
  summaryLine: {
    alignItems: "center",
    flexDirection: "row",
  },
  summaryLabel: {
    fontSize: 34,
    width: 128,
  },
  summaryDash: {
    fontSize: 34,
    marginHorizontal: 12,
  },
  summaryValue: {
    fontSize: 34,
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
  phase: {
    fontSize: 28,
    textAlign: "center",
  },
  clock: {
    fontSize: 84,
    marginTop: 12,
    textAlign: "center",
  },
  footer: {
    flex: 1,
    justifyContent: "flex-end",
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
