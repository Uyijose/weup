import { StyleSheet } from "react-native";

export const videoControlsStyles = StyleSheet.create({
  controlsContainer: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 60,
    },

  centerButton: {
    position: "absolute",
    top: "45%",
    left: "45%",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontSize: 24,
  },

  muteButton: {
    position: "absolute",
    right: 20,
    bottom: 80,
    width: 45,
    height: 45,
    borderRadius: 22,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  progressContainer: {
    height: 4,
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 5,
    overflow: "hidden",
  },

  progressBar: {
    height: "100%",
    backgroundColor: "#FFFFFF",
  },

  loading: {
    position: "absolute",
    top: "50%",
    left: "50%",
  },
});