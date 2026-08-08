import { StyleSheet } from "react-native";

export const historyVideoCardStyles =
  StyleSheet.create({
    card: {
      width: "48.5%",
      marginBottom: 18,
    },

    thumbnailWrapper: {
      width: "100%",
      aspectRatio: 0.72,
      borderRadius: 14,
      overflow: "hidden",
      backgroundColor: "#EAEAEA",
      position: "relative",
    },

    thumbnail: {
      width: "100%",
      height: "100%",
      resizeMode: "cover",
    },

    videoPlaceholder: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#171717",
    },

    playIcon: {
      fontSize: 26,
      color: "#FFFFFF",
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
      fontSize: 13,
      lineHeight: 18,
      color: "#222222",
      fontWeight: "500",
    },
  });