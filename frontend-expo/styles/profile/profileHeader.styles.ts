import { StyleSheet } from "react-native";

export const profileHeaderStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 18,
  },

  avatarWrapper: {
    width: 88,
    height: 88,
    borderRadius: 44,
    overflow: "hidden",
    marginRight: 16,
    backgroundColor: "#EDEDED",
  },

  avatar: {
    width: "100%",
    height: "100%",
  },

  identity: {
    flex: 1,
    justifyContent: "center",
  },

  usernameRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  username: {
    fontSize: 21,
    fontWeight: "700",
    color: "#111111",
    maxWidth: "85%",
  },

  verifiedBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginLeft: 6,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6A00F4",
  },

  verifiedText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },

  fullName: {
    marginTop: 5,
    fontSize: 14,
    color: "#666666",
  },

  roleRow: {
    marginTop: 7,
    minHeight: 18,
  },

  roleText: {
    fontSize: 12,
    color: "#6A00F4",
    fontWeight: "600",
  },
});