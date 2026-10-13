import { Modal, Pressable, StyleSheet, TextInput } from "react-native";

import { colors, fontFamily } from "../theme";
import { AppText } from "./AppText";
import { BlackButton } from "./BlackButton";

type Props = {
  visible: boolean;
  title: string;
  value: string;
  hint: string;
  error: string | null;
  keyboard: "number-pad" | "numbers-and-punctuation";
  onChange: (value: string) => void;
  onSubmit: () => void;
  onClose: () => void;
};

export function EntryModal({
  visible,
  title,
  value,
  hint,
  error,
  keyboard,
  onChange,
  onSubmit,
  onClose,
}: Props) {
  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <Pressable accessibilityLabel="Close" style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card} onPress={() => undefined}>
          <AppText style={styles.title}>{title}</AppText>
          <TextInput
            autoFocus
            keyboardType={keyboard}
            maxLength={keyboard === "number-pad" ? 2 : 5}
            allowFontScaling={false}
            selectionColor={colors.black}
            style={styles.input}
            value={value}
            onChangeText={onChange}
            onSubmitEditing={onSubmit}
          />
          <AppText style={styles.hint}>{error ?? hint}</AppText>
          <BlackButton label="OK" onPress={onSubmit} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
    gap: 16,
    padding: 24,
    width: "100%",
  },
  title: {
    fontSize: 22,
  },
  input: {
    borderBottomWidth: 1,
    borderColor: colors.black,
    color: colors.black,
    fontFamily,
    fontSize: 40,
    paddingVertical: 8,
  },
  hint: {
    fontSize: 16,
  },
});
