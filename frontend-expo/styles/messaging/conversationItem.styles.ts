import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 78,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#171717",
  },

  pressed: {
    opacity: 0.65,
  },

  avatarContainer: {
    width: 54,
    height: 54,
    marginRight: 12,
    position: "relative",
  },

  avatarImage: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#252525",
  },

  avatarFallback: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#252525",
  },

  avatarText: {
    color: "#EDEDED",
    fontSize: 18,
    fontWeight: "700",
  },

  onlineDot: {
    position: "absolute",
    right: 0,
    bottom: 1,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: "#EDEDED",
    borderWidth: 2,
    borderColor: "#000000",
  },

  content: {
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },

  title: {
    flex: 1,
    color: "#F2F2F2",
    fontSize: 16,
    fontWeight: "600",
    marginRight: 8,
  },

  titleUnread: {
    fontWeight: "700",
  },

  timestamp: {
    color: "#777777",
    fontSize: 12,
  },

  timestampUnread: {
    color: "#BDBDBD",
  },

  messageRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  lastMessage: {
    flex: 1,
    color: "#8E8E8E",
    fontSize: 14,
    lineHeight: 19,
  },

  lastMessageUnread: {
    color: "#D8D8D8",
    fontWeight: "500",
  },

  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    marginLeft: 8,
    paddingHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EDEDED",
  },

  unreadBadgeText: {
    color: "#000000",
    fontSize: 11,
    fontWeight: "700",
  },
});