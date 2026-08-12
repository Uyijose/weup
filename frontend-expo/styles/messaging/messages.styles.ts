import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1F1F1F",
  },

  headerTitle: {
    color: "#EDEDED",
    fontSize: 28,
    fontWeight: "700",
  },

  newMessageButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1E1E1E",
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 8,
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: "#1A1A1A",
  },

  searchIcon: {
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    color: "#EDEDED",
    fontSize: 15,
    paddingVertical: 0,
  },

  clearSearchButton: {
    padding: 4,
  },

  list: {
    flex: 1,
  },

  contentContainer: {
    paddingBottom: 24,
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },

  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1A1A1A",
    marginBottom: 16,
  },

  emptyTitle: {
    color: "#EDEDED",
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },

  emptyText: {
    color: "#888888",
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },

  emptyAction: {
    marginTop: 18,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: "#EDEDED",
  },

  emptyActionText: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "600",
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },

  loadingText: {
    color: "#888888",
    marginTop: 12,
    fontSize: 14,
  },

  errorContainer: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#211313",
    borderWidth: 1,
    borderColor: "#492020",
  },

  errorText: {
    color: "#FF8E8E",
    fontSize: 14,
    lineHeight: 20,
  },

  retryButton: {
    alignSelf: "flex-start",
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#2A2A2A",
  },

  retryButtonText: {
    color: "#EDEDED",
    fontSize: 13,
    fontWeight: "600",
  },

  authContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    backgroundColor: "#000000",
  },

  authTitle: {
    color: "#EDEDED",
    fontSize: 21,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },

  authText: {
    color: "#888888",
    fontSize: 14,
    textAlign: "center",
  },

  listEmptyContent: {
    flexGrow: 1,
  },
});