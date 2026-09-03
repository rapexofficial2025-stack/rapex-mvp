import { StyleSheet, TextInput, TextInputProps, View } from "react-native";

type Props = TextInputProps & {
  placeholder: string;
  secureTextEntry?: boolean;
};

export function InputField({ placeholder, secureTextEntry = false, ...rest }: Props) {
  return (
    <View style={styles.container}>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#888"
        secureTextEntry={secureTextEntry}
        style={styles.input}
        autoCapitalize="none"
        autoCorrect={false}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 56,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    justifyContent: "center",
    marginBottom: 14,
  },
  input: { fontSize: 16, color: "#222" },
});
