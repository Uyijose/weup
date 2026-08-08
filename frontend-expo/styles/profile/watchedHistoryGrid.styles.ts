import { StyleSheet } from "react-native";

export const watchedHistoryGridStyles =
  StyleSheet.create({
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingBottom: 30,
    },

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

    emptyContainer: {
      marginHorizontal: 20,
      marginTop: 10,
      paddingHorizontal: 20,
      paddingVertical: 42,
      borderRadius: 16,
      backgroundColor: "#F7F7F7",
      alignItems: "center",
      justifyContent: "center",
    },

    emptyTitle: {
      textAlign: "center",
      fontSize: 15,
      lineHeight: 21,
      color: "#666666",
    },

    emptyButton: {
      marginTop: 18,
      paddingHorizontal: 20,
      paddingVertical: 11,
      borderRadius: 10,
      backgroundColor: "#6A00F4",
    },

    emptyButtonText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "700",
    },

    viewAllButton: {
      marginHorizontal: 20,
      marginTop: 2,
      marginBottom: 24,
      paddingVertical: 13,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: "#6A00F4",
    },

    viewAllText: {
      color: "#6A00F4",
      fontSize: 14,
      fontWeight: "700",
    },
  });