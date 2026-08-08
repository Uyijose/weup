import { StyleSheet } from "react-native";

export const becomeCreatorModalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  modal: {
    width: "100%",
    maxWidth: 440,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 24,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A0033",
    marginBottom: 12,
  },

  description: {
    fontSize: 15,
    lineHeight: 23,
    color: "#555555",
    marginBottom: 24,
  },

  actions: {
    flexDirection: "row",
    gap: 12,
  },

  secondaryButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D6D6D6",
    alignItems: "center",
    justifyContent: "center",
  },

  secondaryText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333333",
  },

  primaryButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 10,
    backgroundColor: "#6A00F4",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },

  primaryText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
  },
});