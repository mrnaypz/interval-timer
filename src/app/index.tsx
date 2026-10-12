import { router } from "expo-router";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText } from "../components/AppText";
import { BlackButton } from "../components/BlackButton";
import { usePresets } from "../presets";
import { colors } from "../theme";
import { presetLabel } from "../time";

export default function HomeScreen() {
  const { presets, ready, removePreset } = usePresets();

  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      <View style={styles.top}>
        <BlackButton label="NEW TIMER" onPress={() => router.push("/new-timer")} />
      </View>
      <View style={styles.rule} />
      <AppText style={styles.heading}>PRESETS</AppText>
      <ScrollView style={styles.listView} contentContainerStyle={styles.list}>
        {ready && presets.length === 0 ? <AppText style={styles.empty}>No presets yet.</AppText> : null}
        {presets.map((preset) => {
          const label = presetLabel(preset.sets, preset.workSec, preset.restSec);
          return (
            <BlackButton
              key={preset.id}
              label={label}
              onLongPress={() => {
                Alert.alert("Delete preset", label, [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                      void removePreset(preset.id);
                    },
                  },
                ]);
              }}
              onPress={() => router.push({ pathname: "/run/[id]", params: { id: preset.id } })}
            />
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.white,
    flex: 1,
  },
  top: {
    paddingHorizontal: 20,
    paddingTop: 36,
  },
  rule: {
    backgroundColor: colors.black,
    height: 1,
    marginTop: 20,
  },
  heading: {
    color: colors.black,
    fontSize: 22,
    marginTop: 16,
    textAlign: "center",
  },
  listView: {
    flex: 1,
  },
  list: {
    gap: 12,
    paddingBottom: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  empty: {
    fontSize: 18,
  },
});
