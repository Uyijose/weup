import { StyleSheet } from "react-native";

export const videoPickerStyles = StyleSheet.create({
  container: {
    width: "100%",
  },

  button: {
    minHeight: 54,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: "#FF4FA3",
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  selectedInfo: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#171717",
  },

  selectedTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 8,
  },

  selectedText: {
    color: "#CCCCCC",
    fontSize: 14,
    marginBottom: 5,
  },

  actions: {
    marginTop: 16,
    gap: 10,
  },

  useButton: {
    minHeight: 48,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#8B5CF6",
  },

  useButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  removeButton: {
    minHeight: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#333333",
  },

  removeButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },

  errorText: {
    marginTop: 12,
    color: "#FF6B6B",
    fontSize: 14,
  },
});