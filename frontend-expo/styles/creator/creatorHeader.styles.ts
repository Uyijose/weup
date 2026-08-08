import { StyleSheet } from "react-native";

export const creatorHeaderStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 18,
    flexDirection: "row",
    alignItems: "center",
  },

  avatarWrapper: {
    width: 82,
    height: 82,
    borderRadius: 41,
    overflow: "hidden",
  },

  avatar: {
    width: "100%",
    height: "100%",
  },

  avatarPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6A00F4",
  },

  avatarPlaceholderText: {
    color: "#FFFFFF",
    fontSize: 30,
    fontWeight: "700",
  },

  info: {
    flex: 1,
    marginLeft: 16,
  },

  platformTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
  },

  username: {
    marginTop: 6,
    color: "#AAAAAA",
    fontSize: 14,
  },
});