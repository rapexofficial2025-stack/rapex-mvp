import { useState } from "react";
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "../hooks/useAppTheme";

type PickerFieldProps = {
  label: string;
  value: string | null;
  placeholder?: string;
  options: string[];
  onSelect: (value: string) => void;
  disabled?: boolean;
};

/**
 * Modal-based single-select field -- deliberately not a native date/dropdown
 * component (e.g. @react-native-community/datetimepicker) since that would
 * add a new native module this sandbox has no way to verify builds cleanly
 * on a real device. Pure JS/Modal, so it works identically on web/iOS/
 * Android and needs no native linking. Used for DOB (month/day/year),
 * Gender, ID type, and the Step 7 cascading address selects.
 */
export function PickerField({ label, value, placeholder = "Select", options, onSelect, disabled }: PickerFieldProps) {
  const theme = useAppTheme();
  const [open, setOpen] = useState(false);

  return (
    <View style={{ gap: theme.spacing.xs, opacity: disabled ? 0.5 : 1 }}>
      <Text style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.textSecondary }}>{label}</Text>
      <Pressable
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={{
          borderWidth: 1,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.lg,
          backgroundColor: theme.colors.surface,
        }}
      >
        <Text
          style={{
            fontSize: theme.typography.fontSize.base,
            color: value ? theme.colors.textPrimary : theme.colors.textDisabled,
          }}
        >
          {value ?? placeholder}
        </Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={[styles.sheet, { backgroundColor: theme.colors.surface, borderRadius: theme.radius.lg }]}>
            <Text
              style={{
                fontSize: theme.typography.fontSize.lg,
                fontWeight: "700",
                color: theme.colors.textPrimary,
                padding: theme.spacing.lg,
              }}
            >
              {label}
            </Text>
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              style={{ maxHeight: 360 }}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    onSelect(item);
                    setOpen(false);
                  }}
                  style={{
                    paddingVertical: theme.spacing.md,
                    paddingHorizontal: theme.spacing.lg,
                    backgroundColor: item === value ? theme.colors.surfaceAlt : "transparent",
                  }}
                >
                  <Text style={{ fontSize: theme.typography.fontSize.base, color: theme.colors.textPrimary }}>{item}</Text>
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    maxHeight: "70%",
  },
});
