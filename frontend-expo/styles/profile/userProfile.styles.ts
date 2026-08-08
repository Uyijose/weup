import { StyleSheet } from "react-native";

export const userProfileStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  content: {
    paddingBottom: 40,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    backgroundColor: "#FFFFFF",
  },

  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: "#777777",
  },

  errorTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111111",
    textAlign: "center",
  },

  errorText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: "#777777",
    textAlign: "center",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111111",
  },

  sectionCount: {
    fontSize: 12,
    color: "#888888",
  },

  historyLoader: {
    minHeight: 160,
    alignItems: "center",
    justifyContent: "center",
  },

  pagination: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 30,
    alignItems: "center",
  },

  pageIndicator: {
    fontSize: 13,
    color: "#777777",
    marginBottom: 12,
  },

  paginationButtons: {
    flexDirection: "row",
    gap: 10,
  },

  pageButton: {
    overflow: "hidden",
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 9,
    backgroundColor: "#F1F1F1",
    color: "#222222",
    fontSize: 13,
    fontWeight: "700",
  },

  disabledPageButton: {
    opacity: 0.35,
  },
});