import { StyleSheet } from "react-native";

export const uploadProgressStyles =
  StyleSheet.create({
    container: {
      marginTop: 20,
      marginBottom: 20,
    },

    message: {
      fontSize: 14,
      color: "#FFFFFF",
      marginBottom: 10,
    },

    track: {
      height: 8,
      width: "100%",
      backgroundColor: "#2A2A2A",
      borderRadius: 8,
      overflow: "hidden",
    },

    fill: {
      height: "100%",
      backgroundColor: "#6A00F4",
      borderRadius: 8,
    },

    percentage: {
      marginTop: 8,
      fontSize: 13,
      color: "#AAAAAA",
      textAlign: "right",
    },
  });