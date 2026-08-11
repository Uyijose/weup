import { StyleSheet } from "react-native";

import { Colors } from "../colors";
import { Spacing } from "../spacing";
import { Typography } from "../typography";

export const styles = StyleSheet.create({
  container: {
    height: 60,

    backgroundColor: Colors.background,

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    paddingHorizontal: Spacing.lg,

    borderBottomWidth: 1,

    borderBottomColor: Colors.border,
  },

  logo: {
    ...Typography.title,

    color: Colors.accent,
  },

  actions: {
    flexDirection: "row",

    alignItems: "center",

    gap: Spacing.xl,
  },

  headerSearchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  headerBackButton: {
    padding: 4,
  },

  headerSearchInput: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: "#1E1E1E",
    color: "#EDEDED",
    fontSize: 15,
  },

  headerSearchSubmitButton: {
    padding: 6,
  },
});