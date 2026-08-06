import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
    paddingLeft: 18,
    backgroundColor: "#000000",
  },

  content: {
    paddingRight: 18,
  },

  chip: {
    height: 38,
    borderRadius: 20,
    paddingHorizontal: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    backgroundColor: "#222222",
  },

  activeChip: {
    backgroundColor: "#FF4FA3",
  },

  text: {
    color: "#EDEDED",
    fontSize: 13,
    fontWeight: "600",
  },

  activeText: {
    color: "#FFFFFF",
  },
});