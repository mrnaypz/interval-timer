import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText } from "../../components/AppText";
import { BlackButton } from "../../components/BlackButton";
import { usePresets } from "../../presets";
import { colors } from "../../theme";
import { buildPhases, displaySeconds, formatClock, phaseAt, phaseLabel } from "../../time";

export default function RunScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { presets, ready } = usePresets();
  const preset = presets.find((item) => item.id === id);
  const phases = useMemo(
    () => (preset ? buildPhases(preset.sets, preset.workSec, preset.restSec) : []),
    [preset],
  );
  const [startedAt] = useState(() => Date.now());
  const [now, setNow] = useState(startedAt);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(timer);
  }, []);

  if (!ready) {
    return <SafeAreaView style={styles.screen} />;
  }

  if (!preset) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.missing}>
          <AppText style={styles.phase}>MISSING</AppText>
          <BlackButton label="MENU" onPress={() => router.replace("/")} />
        </View>
      </SafeAreaView>
    );
  }

  const phase = phaseAt(phases, now - startedAt);
  const clock = formatClock(displaySeconds(phase.remainingMs));

  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      <View style={styles.timerBlock}>
        <AppText style={styles.phase}>{phaseLabel(phase.kind)}</AppText>
        <AppText style={styles.clock}>{clock}</AppText>
      </View>
      <View style={styles.footer}>
        {phase.kind === "done" ? (
          <BlackButton label="MENU" onPress={() => router.replace("/")} />
        ) : (
          <BlackButton label="EXIT" onPress={() => router.back()} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.white,
    flex: 1,
  },
  timerBlock: {
    alignItems: "center",
    paddingTop: 72,
  },
  phase: {
    fontSize: 28,
  },
  clock: {
    fontSize: 84,
    marginTop: 12,
  },
  footer: {
    marginTop: "auto",
    paddingBottom: 12,
    paddingHorizontal: 20,
  },
  missing: {
    gap: 24,
    padding: 20,
    paddingTop: 72,
  },
});
