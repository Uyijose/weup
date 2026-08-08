import { StyleSheet } from "react-native";

export const searchPostCardStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },

  videoContainer: {
    width: 110,
    height: 145,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#1A1A1A",
  },

  video: {
    width: "100%",
    height: "100%",
  },

  videoFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1A1A1A",
  },

  playIcon: {
    fontSize: 24,
    color: "#FFFFFF",
  },

  content: {
    flex: 1,
    justifyContent: "center",
    paddingLeft: 14,
  },

  caption: {
    fontSize: 15,
    lineHeight: 21,
    color: "#FFFFFF",
  },

  topic: {
    marginTop: 8,
    fontSize: 13,
    color: "#999999",
  },
});