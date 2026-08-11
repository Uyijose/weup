import { StyleSheet } from "react-native";

export const captionInputStyles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: 20,
  },

  label: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },

  input: {
    width: "100%",
    minHeight: 52,
    backgroundColor: "#111111",
    borderWidth: 1,
    borderColor: "#333333",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#FFFFFF",
    fontSize: 16,
  },

  inputError: {
    borderColor: "#FF4444",
  },

  footer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },

  hint: {
    color: "#888888",
    fontSize: 12,
  },

  error: {
    color: "#FF4444",
    fontSize: 12,
  },

  counter: {
    color: "#777777",
    fontSize: 12,
  },
});