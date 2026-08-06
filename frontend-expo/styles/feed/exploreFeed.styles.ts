import { StyleSheet } from "react-native";

import { Theme } from "../theme";

export const styles = StyleSheet.create({
  loadingContainer: {
    marginTop: 40,
  },

  list: {
    paddingHorizontal: Theme.spacing.sm,
    paddingBottom: 100,
    paddingTop: Theme.spacing.sm,
  },

  card: {
    flex: 1,

    maxWidth: "31%",

    marginBottom: Theme.spacing.md,

    borderRadius: 14,

    overflow: "hidden",

    backgroundColor: Theme.colors.surface,

    borderWidth: 1,

    borderColor: Theme.colors.border,

    ...Theme.shadows.card,
  },

  image: {
    width: "100%",
    aspectRatio: 9 / 16,
  },

  placeholder: {
    width: "100%",
    aspectRatio: 9 / 16,

    backgroundColor: Theme.colors.surface2,
  },

  info: {
    paddingHorizontal: 10,
    paddingVertical: 10,
  },

  title: {
    color: Theme.colors.text,

    fontSize: 13,

    fontWeight: "700",
  },

  creator: {
    marginTop: 3,

    color: Theme.colors.textMuted,

    fontSize: 11,

    fontWeight: "500",
  },

  row: {
    justifyContent: "space-between",
  },

  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",

    marginTop: 12,

    marginBottom: 100,
  },

  pageButton: {
    backgroundColor: Theme.colors.surface,

    borderWidth: 1,

    borderColor: Theme.colors.border,

    borderRadius: 20,

    paddingHorizontal: 18,

    paddingVertical: 8,
  },

  disabledButton: {
    opacity: 0.4,
  },

  pageButtonText: {
    color: Theme.colors.text,

    fontWeight: "700",
  },

  pageIndicator: {
    color: Theme.colors.text,

    marginHorizontal: 16,

    fontWeight: "700",
  },

});