import { useState } from "react";
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { ChevronDown, X } from "lucide-react-native";

type Option = { label: string; value: string };

type Props = {
  label: string;
  value: string | null;
  options: Option[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
};

/** Lightweight modal-based dropdown -- no extra native picker dependency, keeps auth-preview's zero-native-deps promise. */
export function SelectField({ label, value, options, onChange, placeholder = "Select", disabled }: Props) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Pressable
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={[styles.trigger, disabled && styles.triggerDisabled]}
      >
        <Text style={[styles.triggerText, !selected && styles.triggerPlaceholder]}>
          {selected ? selected.label : placeholder}
        </Text>
        <ChevronDown color="rgba(255,255,255,0.6)" size={18} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{label}</Text>
              <Pressable onPress={() => setOpen(false)} hitSlop={10}>
                <X color="#FFFFFF" size={20} />
              </Pressable>
            </View>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <Pressable
                  style={[styles.option, item.value === value && styles.optionActive]}
                  onPress={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                >
                  <Text style={styles.optionText}>{item.label}</Text>
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
  fieldWrap: { gap: 4, marginBottom: 14 },
  fieldLabel: { fontSize: 10, fontWeight: "800", color: "rgba(255,255,255,0.7)", textTransform: "uppercase" },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  triggerDisabled: { opacity: 0.5 },
  triggerText: { color: "#FFFFFF", fontSize: 13, fontWeight: "600" },
  triggerPlaceholder: { color: "rgba(255,255,255,0.4)" },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#1A1030", borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: "60%", padding: 16 },
  sheetHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sheetTitle: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  option: { paddingVertical: 14, paddingHorizontal: 8, borderRadius: 10 },
  optionActive: { backgroundColor: "rgba(139, 92, 246, 0.25)" },
  optionText: { color: "#FFFFFF", fontSize: 14, fontWeight: "600" },
});
