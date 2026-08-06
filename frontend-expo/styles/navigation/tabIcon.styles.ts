import { StyleSheet } from "react-native";

import { Typography } from "../typography";

export const styles = StyleSheet.create({
  container: {
    width: 70,

    alignItems: "center",

    justifyContent: "center",
  },

  label: {
    marginTop: 2,

    textAlign: "center",

    ...Typography.tab,
  },
});