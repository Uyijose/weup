import { StyleSheet } from "react-native";

export const profileActionsStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },

  primaryButton: {
    minHeight: 42,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6A00F4",
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  secondaryButton: {
    minHeight: 42,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D9D9D9",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },

  secondaryButtonText: {
    color: "#222222",
    fontSize: 14,
    fontWeight: "700",
  },

  adminButton: {
    minHeight: 42,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1A0033",
  },

  adminButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  creatorButton: {
    minHeight: 42,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FF4FA3",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF7FC",
  },

  creatorButtonText: {
    color: "#C00067",
    fontSize: 14,
    fontWeight: "700",
  },
});