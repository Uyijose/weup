import { StyleSheet } from "react-native";

export const creatorVideoCardStyles = StyleSheet.create({
  container: {
    width: "48.5%",
    marginBottom: 20,
  },

  thumbnailWrapper: {
    width: "100%",
    aspectRatio: 0.72,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#171717",
    position: "relative",
  },

  thumbnail: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  playIcon: {
    color: "#FFFFFF",
    fontSize: 28,
  },

  playOverlay: {
    position: "absolute",
    left: 10,
    bottom: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.55)",
  },

  playText: {
    color: "#FFFFFF",
    fontSize: 13,
    marginLeft: 2,
  },

  caption: {
    marginTop: 7,
    color: "#FFFFFF",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
  },

  views: {
    marginTop: 4,
    color: "#888888",
    fontSize: 11,
  },

  deleteButton: {
    marginTop: 7,
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#3A1616",
  },

  deleteText: {
    color: "#FF6B6B",
    fontSize: 12,
    fontWeight: "700",
  },
});