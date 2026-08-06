import { StyleSheet } from "react-native";

export const userInfoStyles =
  StyleSheet.create({
    container: {
      width: "75%",
      bottom: 40,
    },

    header: {
      flexDirection: "row",
      alignItems: "flex-end",
    },

    avatar: {
      width: 52,
      height: 52,
      borderRadius: 26,
      marginRight: 12,
      backgroundColor: "#222",
      bottom:10,
    },

    avatarPlaceholder: {
      width: 52,
      height: 52,
      borderRadius: 26,
      marginRight: 12,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#444",
    },

    avatarLetter: {
      color: "#FFF",
      fontSize: 20,
      fontWeight: "700",
    },

    userSection: {
      flex: 1,
    },

    usernameRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 6,
    },

    username: {
      color: "#FFF",
      fontSize: 17,
      fontWeight: "700",
    },

    badge: {
      marginLeft: 8,
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: "#1DA1F2",
      justifyContent: "center",
      alignItems: "center",
    },

    badgeText: {
      color: "#FFF",
      fontSize: 11,
      fontWeight: "700",
    },

    caption: {
      color: "#FFF",
      fontSize: 15,
      lineHeight: 21,
      marginBottom: 6,
    },

    topic: {
      color: "#FF4FA3",
      fontSize: 14,
      fontWeight: "600",
    },
  });