import { StyleSheet } from "react-native";

export const profileStatsStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginHorizontal: 20,
    paddingVertical: 18,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E9E9E9",
  },

  stat: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  divider: {
    width: 1,
    backgroundColor: "#E5E5E5",
  },

  value: {
    fontSize: 19,
    fontWeight: "800",
    color: "#111111",
  },

  label: {
    marginTop: 4,
    fontSize: 12,
    color: "#777777",
  },
});