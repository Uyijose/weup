import { StyleSheet } from "react-native";

export const videoPlayerStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },

  video: {
    width: "100%",
    height: "100%",
  },

  loadingContainer: {
    ...StyleSheet.absoluteFill,

    justifyContent: "center",
    alignItems: "center",
  },

  poster: {
    width: "100%",
    height: "100%",
  },
});