import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    marginBottom: 18,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    height: 56,
    paddingHorizontal: 16,
  },

  inputContainerError: {
    borderColor: "#EF4444",
  },

  input: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
  },

  eyeButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },

  eyeText: {
    color: "#6A00F4",
    fontSize: 14,
    fontWeight: "700",
  },

  error: {
    marginTop: 6,
    marginLeft: 4,
    fontSize: 13,
    color: "#EF4444",
  },
});