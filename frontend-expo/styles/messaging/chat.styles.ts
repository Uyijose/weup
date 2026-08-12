import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 64,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#1F1F1F",
  },

  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTextContainer: {
    flex: 1,
    justifyContent: "center",
    marginLeft: 2,
  },

  headerTitle: {
    color: "#EDEDED",
    fontSize: 17,
    fontWeight: "700",
  },

  headerStatus: {
    marginTop: 2,
    color: "#888888",
    fontSize: 12,
  },

  headerStatusTyping: {
    color: "#BDBDBD",
  },

  messageList: {
    flex: 1,
  },

  messageListContent: {
    paddingTop: 14,
    paddingBottom: 10,
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },

  loadingText: {
    marginTop: 10,
    color: "#888888",
    fontSize: 14,
  },

  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },

  errorTitle: {
    color: "#EDEDED",
    fontSize: 19,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },

  errorText: {
    color: "#888888",
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },

  retryButton: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#EDEDED",
  },

  retryButtonText: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "600",
  },

  emptyMessagesContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },

  emptyMessagesTitle: {
    color: "#EDEDED",
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },

  emptyMessagesText: {
    marginTop: 6,
    color: "#777777",
    fontSize: 14,
    textAlign: "center",
  },

  composerWrapper: {
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: "#1F1F1F",
    backgroundColor: "#000000",
  },

  composerRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },

  composerInput: {
    flex: 1,
    maxHeight: 120,
    minHeight: 44,
    paddingHorizontal: 15,
    paddingVertical: 11,
    borderRadius: 22,
    backgroundColor: "#1A1A1A",
    color: "#EDEDED",
    fontSize: 15,
  },

  sendButton: {
    width: 44,
    height: 44,
    marginLeft: 8,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EDEDED",
  },

  sendButtonDisabled: {
    opacity: 0.35,
  },

  typingContainer: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 2,
  },

  typingText: {
    color: "#777777",
    fontSize: 12,
    fontStyle: "italic",
  },
});