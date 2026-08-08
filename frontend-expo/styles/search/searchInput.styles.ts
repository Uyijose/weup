import { StyleSheet } from "react-native";

export const searchInputStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingLeft: 14,
    paddingRight: 6,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#1E1E1E",
  },

  input: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 10,
    color: "#EDEDED",
    fontSize: 15,
  },

  clearButton: {
    padding: 4,
    marginRight: 4,
  },

  searchButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6A00F4",
  },
});