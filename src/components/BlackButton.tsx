import { Pressable, StyleSheet, type PressableProps, type StyleProp, type ViewStyle } from "react-native";

import { colors, fontFamily } from "../theme";
import { AppText } from "./AppText";

type Props = Omit<PressableProps, "style"> & {
  label: string;
  tone?: "black" | "white";
  style?: StyleProp<ViewStyle>;
};

export function BlackButton({ label, tone = "black", style, ...rest }: Props) {
  const white = tone === "white";
  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [styles.button, white && styles.whiteButton, pressed && styles.pressed, style]}
      {...rest}
    >
      <AppText style={[styles.label, white && styles.whiteLabel]}>{label}</AppText>
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
  whiteButton: {
    backgroundColor: colors.white,
  },
  label: {
    color: colors.white,
    fontFamily,
    fontSize: 22,
  },
  whiteLabel: {
    color: colors.black,
  },
});
