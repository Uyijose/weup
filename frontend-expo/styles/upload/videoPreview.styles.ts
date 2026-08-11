import { StyleSheet } from "react-native";

export const videoPreviewStyles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: 20,
    alignItems: "center",
  },

  video: {
    width: "100%",
    height: 420,
    borderRadius: 16,
    backgroundColor: "#111",
  },

  removeButton: {
    marginTop: 14,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    backgroundColor: "#DC2626",
    alignItems: "center",
    justifyContent: "center",
  },

  removeButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
});