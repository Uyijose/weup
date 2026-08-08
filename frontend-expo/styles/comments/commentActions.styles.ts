import { StyleSheet } from "react-native";

export const commentActionsStyles =
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 8,
      gap: 18,
    },

    action: {
      paddingVertical: 4,
    },

    text: {
      fontSize: 13,
      color: "#777777",
      fontWeight: "600",
    },
  });