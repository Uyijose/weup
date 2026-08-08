import { StyleSheet } from "react-native";

export const searchStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  header: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },

  backButton: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },

  backText: {
    fontSize: 38,
    lineHeight: 40,
    color: "#111111",
    fontWeight: "300",
  },

  headerTextContainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 8,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111111",
  },

  query: {
    marginTop: 2,
    fontSize: 13,
    color: "#777777",
  },

  headerSpacer: {
    width: 42,
  },

  listContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 40,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111111",
    marginBottom: 12,
  },

  postsSectionTitle: {
    marginTop: 4,
  },

  sectionDivider: {
    height: 1,
    backgroundColor: "#EEEEEE",
    marginTop: 8,
    marginBottom: 20,
  },

  accountItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    marginBottom: 8,
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#6A00F4",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  accountInfo: {
    flex: 1,
    marginLeft: 14,
  },

  accountUsername: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111111",
  },

  accountLabel: {
    marginTop: 3,
    fontSize: 13,
    color: "#777777",
  },

  postItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#F7F7F7",
  },

  postPreview: {
    width: 90,
    height: 110,
    borderRadius: 8,
    backgroundColor: "#222222",
    alignItems: "center",
    justifyContent: "center",
  },

  playIcon: {
    fontSize: 25,
    color: "#FFFFFF",
  },

  postInfo: {
    flex: 1,
    marginLeft: 14,
  },

  postText: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: "500",
    color: "#111111",
  },

  postTopic: {
    marginTop: 8,
    fontSize: 13,
    color: "#6A00F4",
  },

  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  stateText: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 21,
    color: "#777777",
    textAlign: "center",
  },

  emptyTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#111111",
    textAlign: "center",
  },

  errorTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#111111",
    textAlign: "center",
  },

  retryButton: {
    marginTop: 18,
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 8,
    backgroundColor: "#6A00F4",
  },

  retryText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});