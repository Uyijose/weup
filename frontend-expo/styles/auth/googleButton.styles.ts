import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },

  pressed: {
    opacity: 0.85,
  },

  disabled: {
    opacity: 0.6,
  },

  googleIcon: {
    fontSize: 22,
    fontWeight: "700",
    color: "#4285F4",
    marginRight: 10,
  },

  text: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
});