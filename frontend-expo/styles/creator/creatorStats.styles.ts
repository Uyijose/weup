import { StyleSheet } from "react-native";

export const creatorStatsStyles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    paddingVertical: 18,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#292929",
    flexDirection: "row",
    justifyContent: "space-between",
  },

  stat: {
    flex: 1,
    alignItems: "center",
  },

  value: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },

  label: {
    marginTop: 5,
    color: "#999999",
    fontSize: 11,
  },
});