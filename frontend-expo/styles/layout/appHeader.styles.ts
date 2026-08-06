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
});