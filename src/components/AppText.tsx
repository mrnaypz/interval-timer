import { StyleSheet, Text, type TextProps } from "react-native";

import { colors, fontFamily } from "../theme";

export function AppText({ style, ...rest }: TextProps) {
  return <Text {...rest} allowFontScaling={false} style={[styles.text, style]} />;
}

const styles = StyleSheet.create({
  text: {
    color: colors.black,
    fontFamily,
  },
});
