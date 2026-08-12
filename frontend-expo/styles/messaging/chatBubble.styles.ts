import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  row: {
    width: "100%",
    paddingHorizontal: 12,
    marginBottom: 6,
  },

  rowMe: {
    alignItems: "flex-end",
  },

  rowOther: {
    alignItems: "flex-start",
  },

  bubble: {
    maxWidth: "82%",
    paddingHorizontal: 13,
    paddingTop: 9,
    paddingBottom: 7,
    borderRadius: 18,
  },

  bubbleMe: {
    backgroundColor: "#EDEDED",
    borderBottomRightRadius: 5,
  },

  bubbleOther: {
    backgroundColor: "#1E1E1E",
    borderBottomLeftRadius: 5,
  },

  messageText: {
    fontSize: 15,
    lineHeight: 21,
  },

  messageTextMe: {
    color: "#000000",
  },

  messageTextOther: {
    color: "#EDEDED",
  },

  timestamp: {
    marginTop: 3,
    fontSize: 10,
  },

  timestampMe: {
    color: "#666666",
    textAlign: "right",
  },

  timestampOther: {
    color: "#777777",
  },
});