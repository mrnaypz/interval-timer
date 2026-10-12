import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppText } from "../components/AppText";
import { BlackButton } from "../components/BlackButton";
import { EntryModal } from "../components/EntryModal";
import { Stepper } from "../components/Stepper";
import { usePresets } from "../presets";
import { colors } from "../theme";
import {
  TIME_STEP_SEC,
  formatEditorTime,
  formatSets,
  formatTotal,
  parseDuration,
  parseSets,
  stepSets,
  stepTime,
  workoutSeconds,
} from "../time";

type Field = "sets" | "work" | "rest";

export default function NewTimerScreen() {
  const { savePreset } = usePresets();
  const [sets, setSets] = useState(0);
  const [workSec, setWorkSec] = useState(0);
  const [restSec, setRestSec] = useState(0);
  const [field, setField] = useState<Field | null>(null);
  const [draft, setDraft] = useState("");
  const [entryError, setEntryError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const total = formatTotal(workoutSeconds(sets, workSec, restSec));

  function openField(next: Field) {
    setEntryError(null);
    setField(next);
    if (next === "sets") {
      setDraft(String(sets));
      return;
    }
    setDraft(formatEditorTime(next === "work" ? workSec : restSec));
  }

  function closeField() {
    setField(null);
    setEntryError(null);
  }

  function applyField() {
    if (field === "sets") {
      const parsed = parseSets(draft);
      if (parsed === null) {
        setEntryError("Enter a whole number from 0 to 99.");
        return;
      }
      setSets(parsed);
      closeField();
      return;
    }
    const parsed = parseDuration(draft);
    if (parsed === null) {
      setEntryError("Use minutes.seconds, like 00.45.");
      return;
    }
    if (field === "work") {
      setWorkSec(parsed);
    } else {
      setRestSec(parsed);
    }
    closeField();
  }

  async function onSave() {
    if (sets < 1 || workSec + restSec < 1) {
      setSaveError("Add at least 1 set, and a work or rest time.");
      return;
    }
    setSaveError(null);
    await savePreset({ sets, workSec, restSec });
    router.replace("/");
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Stepper
          label="SETS"
          value={formatSets(sets)}
          onDecrement={() => setSets((current) => stepSets(current, -1))}
          onIncrement={() => setSets((current) => stepSets(current, 1))}
          onPressValue={() => openField("sets")}
        />
        <Stepper
          label="WORK"
          value={formatEditorTime(workSec)}
          onDecrement={() => setWorkSec((current) => stepTime(current, -TIME_STEP_SEC))}
          onIncrement={() => setWorkSec((current) => stepTime(current, TIME_STEP_SEC))}
          onPressValue={() => openField("work")}
        />
        <Stepper
          label="REST"
          value={formatEditorTime(restSec)}
          onDecrement={() => setRestSec((current) => stepTime(current, -TIME_STEP_SEC))}
          onIncrement={() => setRestSec((current) => stepTime(current, TIME_STEP_SEC))}
          onPressValue={() => openField("rest")}
        />
        <View style={styles.totalBlock}>
          <AppText style={styles.totalLabel}>TOTAL</AppText>
          <AppText style={styles.total}>{total}</AppText>
        </View>
        {saveError ? <AppText style={styles.error}>{saveError}</AppText> : null}
        <View style={styles.actions}>
          <BlackButton label="SAVE" onPress={() => void onSave()} />
          <BlackButton label="BACK" onPress={() => router.back()} />
        </View>
      </ScrollView>
      <EntryModal
        error={entryError}
        hint={field === "sets" ? "Whole number, 0 to 99." : "Minutes.seconds, like 00.45."}
        keyboard={field === "sets" ? "number-pad" : "decimal-pad"}
        title={field === "sets" ? "SETS" : field === "work" ? "WORK" : "REST"}
        value={draft}
        visible={field !== null}
        onChange={(value) => {
          setDraft(value);
          setEntryError(null);
        }}
        onClose={closeField}
        onSubmit={applyField}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.white,
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    gap: 28,
    paddingBottom: 32,
    paddingHorizontal: 20,
    paddingTop: 44,
  },
  totalBlock: {
    alignItems: "center",
    flexGrow: 1,
    gap: 4,
    justifyContent: "center",
  },
  totalLabel: {
    fontSize: 22,
    textAlign: "center",
  },
  total: {
    fontSize: 40,
    textAlign: "center",
  },
  actions: {
    gap: 12,
  },
  error: {
    fontSize: 16,
  },
});
