import { StyleSheet } from "react-native";

export const searchAccountCardStyles =
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      marginHorizontal: 16,
      marginBottom: 10,
      padding: 10,
      borderRadius: 12,
      backgroundColor: "#1A1A1A",
    },

    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: "#2A2A2A",
    },

    info: {
      flex: 1,
      marginLeft: 12,
    },

    username: {
      color: "#EDEDED",
      fontSize: 15,
      fontWeight: "600",
    },

    label: {
      marginTop: 3,
      color: "#888888",
      fontSize: 12,
    },

    arrow: {
      marginLeft: 8,
      color: "#888888",
      fontSize: 28,
      fontWeight: "300",
    },
  });