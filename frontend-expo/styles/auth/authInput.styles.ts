import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    marginBottom: 18,
  },

  input: {
    height: 56,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
    fontSize: 16,
    color: "#111827",
  },

  inputError: {
    borderColor: "#EF4444",
  },

  error: {
    marginTop: 6,
    marginLeft: 4,
    fontSize: 13,
    color: "#EF4444",
  },
});