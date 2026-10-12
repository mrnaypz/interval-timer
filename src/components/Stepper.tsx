import { Pressable, StyleSheet, View } from "react-native";

import { colors, fontFamily } from "../theme";
import { AppText } from "./AppText";

type Props = {
  label: string;
  value: string;
  onDecrement: () => void;
  onIncrement: () => void;
  onPressValue: () => void;
};

export function Stepper({ label, value, onDecrement, onIncrement, onPressValue }: Props) {
  return (
    <View style={styles.block}>
      <AppText style={styles.label}>{label}</AppText>
      <View style={styles.row}>
        <Pressable
          accessibilityLabel={`Decrease ${label}`}
          accessibilityRole="button"
          style={({ pressed }) => [styles.step, pressed && styles.pressed]}
          onPress={onDecrement}
        >
          <AppText style={styles.stepLabel}>-</AppText>
        </Pressable>
        <Pressable accessibilityRole="button" style={styles.valueHit} onPress={onPressValue}>
          <AppText style={styles.value}>{value}</AppText>
        </Pressable>
        <Pressable
          accessibilityLabel={`Increase ${label}`}
          accessibilityRole="button"
          style={({ pressed }) => [styles.step, pressed && styles.pressed]}
          onPress={onIncrement}
        >
          <AppText style={styles.stepLabel}>+</AppText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: 8,
  },
  label: {
    fontSize: 22,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  step: {
    alignItems: "center",
    backgroundColor: colors.black,
    borderRadius: 16,
    height: 64,
    justifyContent: "center",
    width: 64,
  },
  pressed: {
    opacity: 0.82,
  },
  stepLabel: {
    color: colors.white,
    fontFamily,
    fontSize: 32,
    lineHeight: 36,
  },
  valueHit: {
    alignItems: "center",
    flex: 1,
    paddingVertical: 8,
  },
  value: {
    fontSize: 52,
  },
});
