import { StyleSheet } from "react-native";

export const creatorVideoGridStyles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  loader: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  loaderText: {
    marginTop: 10,
    color: "#999999",
    fontSize: 13,
  },

  empty: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    alignItems: "center",
  },

  emptyText: {
    color: "#888888",
    fontSize: 14,
  },

  viewAllButton: {
    marginTop: 4,
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: "#6A00F4",
    alignItems: "center",
  },

  viewAllText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});