import { StyleSheet } from "react-native";

export const creatorProfileStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },

  content: {
    paddingBottom: 30,
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#181818",
  },

  backText: {
    color: "#FFFFFF",
    fontSize: 22,
  },

  sectionHeader: {
    marginTop: 26,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },

  sectionCount: {
    color: "#888888",
    fontSize: 12,
  },

  subscribeButton: {
    marginHorizontal: 20,
    marginTop: 18,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#6A00F4",
  },

  subscribeText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  loadingText: {
    marginTop: 12,
    color: "#999999",
    fontSize: 14,
  },

  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  errorText: {
    color: "#FFFFFF",
    fontSize: 16,
    textAlign: "center",
  },

  errorDescription: {
    marginTop: 8,
    color: "#888888",
    fontSize: 13,
    textAlign: "center",
  },

  messageButton: {
    marginHorizontal: 20,
    marginTop: 10,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#181818",
    borderWidth: 1,
    borderColor: "#333333",
  },

  messageText: {
    color: "#1a1919",
    fontSize: 14,
    fontWeight: "700",
  },
});