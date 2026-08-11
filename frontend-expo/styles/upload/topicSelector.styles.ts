import { StyleSheet } from "react-native";

export const topicSelectorStyles =
  StyleSheet.create({
    container: {
      marginTop: 24,
    },

    title: {
      fontSize: 20,
      fontWeight: "700",
      color: "#111111",
    },

    subtitle: {
      marginTop: 4,
      fontSize: 14,
      color: "#777777",
    },

    selectedSection: {
      marginTop: 16,
    },

    selectedLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: "#333333",
      marginBottom: 8,
    },

    selectedList: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },

    selectedChip: {
      flexDirection: "row",
      alignItems: "center",
      maxWidth: "100%",
      paddingLeft: 12,
      paddingRight: 6,
      paddingVertical: 7,
      borderRadius: 18,
      backgroundColor: "#F0E8FF",
    },

    selectedChipText: {
      maxWidth: 180,
      fontSize: 13,
      color: "#6A00F4",
      fontWeight: "500",
    },

    removeButton: {
      width: 24,
      height: 24,
      marginLeft: 4,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 12,
    },

    removeButtonText: {
      fontSize: 18,
      lineHeight: 20,
      color: "#6A00F4",
    },

    searchInput: {
      marginTop: 16,
      height: 48,
      paddingHorizontal: 14,
      borderWidth: 1,
      borderColor: "#DDDDDD",
      borderRadius: 10,
      backgroundColor: "#FFFFFF",
      color: "#111111",
      fontSize: 15,
    },

    loadingContainer: {
      minHeight: 120,
      alignItems: "center",
      justifyContent: "center",
    },

    loadingText: {
      marginTop: 8,
      fontSize: 14,
      color: "#777777",
    },

    topicList: {
      marginTop: 12,
      maxHeight: 320,
    },

    topicListContent: {
      paddingBottom: 8,
    },

    topicItem: {
      minHeight: 48,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 14,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: "#E0E0E0",
      borderRadius: 10,
      backgroundColor: "#FFFFFF",
    },

    topicItemSelected: {
      borderColor: "#6A00F4",
      backgroundColor: "#F0E8FF",
    },

    topicName: {
      flex: 1,
      marginRight: 8,
      fontSize: 15,
      color: "#222222",
    },

    topicNameSelected: {
      color: "#6A00F4",
      fontWeight: "600",
    },

    postCount: {
      fontSize: 13,
      color: "#777777",
    },

    postCountSelected: {
      color: "#6A00F4",
    },

    emptyText: {
      paddingVertical: 24,
      textAlign: "center",
      fontSize: 14,
      color: "#777777",
    },

    customContainer: {
      marginTop: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },

    customInput: {
      flex: 1,
      height: 48,
      paddingHorizontal: 14,
      borderWidth: 1,
      borderColor: "#DDDDDD",
      borderRadius: 10,
      backgroundColor: "#FFFFFF",
      color: "#111111",
      fontSize: 15,
    },

    doneButton: {
      height: 48,
      paddingHorizontal: 18,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 10,
      backgroundColor: "#6A00F4",
    },

    doneButtonText: {
      fontSize: 14,
      fontWeight: "600",
      color: "#FFFFFF",
    },

    errorText: {
      marginTop: 8,
      fontSize: 13,
      color: "#D32F2F",
    },
  });