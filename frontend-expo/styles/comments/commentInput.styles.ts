import { StyleSheet } from "react-native";

export const commentInputStyles =
  StyleSheet.create({
    container: {
      borderTopWidth: 1,
      borderTopColor: "#E5E5E5",
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: "#FFFFFF",
    },

    row: {
      flexDirection: "row",
      alignItems: "flex-end",
    },

    input: {
      flex: 1,
      minHeight: 42,
      maxHeight: 120,
      borderWidth: 1,
      borderColor: "#DDDDDD",
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 10,
      fontSize: 15,
      backgroundColor: "#F8F8F8",
    },

    sendButton: {
      marginLeft: 12,
      justifyContent: "center",
      alignItems: "center",
      paddingBottom: 8,
    },

    sendText: {
      fontSize: 16,
      fontWeight: "700",
      color: "#007AFF",
    },

    disabled: {
      opacity: 0.4,
    },

    counter: {
      marginTop: 8,
      alignSelf: "flex-end",
      color: "#888888",
      fontSize: 12,
    },
  });