import { StyleSheet } from "react-native";

export const commentSheetStyles =
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: "#FFFFFF",
    },

    header: {
      fontSize: 18,
      fontWeight: "700",
      marginBottom: 20,
    },

    list: {
      flex: 1,
    },

    emptyText: {
      fontSize: 15,
      color: "#666666",
      marginBottom: 8,
    },

    postId: {
      fontSize: 12,
      color: "#999999",
    },

    inputArea: {
      borderTopWidth: 1,
      borderTopColor: "#EEEEEE",
      paddingTop: 16,
    },

    placeholder: {
      color: "#999999",
      fontSize: 14,
    },
  });