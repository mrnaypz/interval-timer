import { Pressable, StyleSheet, type PressableProps, type StyleProp, type ViewStyle } from "react-native";

import { colors, fontFamily } from "../theme";
import { AppText } from "./AppText";

type Props = Omit<PressableProps, "style"> & {
  label: string;
  style?: StyleProp<ViewStyle>;
};

export function BlackButton({ label, style, ...rest }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [styles.button, pressed && styles.pressed, style]}
      {...rest}
    >
      <AppText style={styles.label}>{label}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: colors.black,
    borderRadius: 16,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  pressed: {
    opacity: 0.82,
  },
  label: {
    color: colors.white,
    fontFamily,
    fontSize: 22,
  },
});
