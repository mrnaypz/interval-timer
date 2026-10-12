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

  const phase = phaseAt(phases, now - startedAt);
  const clock = formatClock(displaySeconds(phase.remainingMs));

  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      <View style={styles.stage}>
        <View style={styles.balance} />
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
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.white,
    flex: 1,
  },
  stage: {
    flex: 1,
  },
  balance: {
    flex: 1,
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
    paddingHorizontal: 20,
    paddingTop: 48,
  },
});
