import { StyleSheet } from "react-native";

export const postCardStyles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: "#000",
  },

  videoContainer: {
    flex: 1,
  },

  overlay: {
    position: "absolute",

    left: 16,
    right: 16,
    bottom: 24,
  },
});