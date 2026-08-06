import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  container: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 32,
  },

  errorBox: {
    backgroundColor: "#FEE2E2",
    borderRadius: 12,
    padding: 12,
    marginBottom: 18,
  },

  errorText: {
    color: "#DC2626",
    fontSize: 14,
    textAlign: "center",
  },

  buttonContainer: {
    marginTop: 6,
    marginBottom: 18,
    height: 56,
    borderRadius: 14,
    backgroundColor: "#6A00F4",
    justifyContent: "center",
    alignItems: "center",
  },

  button: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  buttonDisabled: {
    opacity: 0.8,
  },

  loader: {
    position: "absolute",
    right: 18,
  },

  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 18,
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },

  or: {
    marginHorizontal: 12,
    color: "#6B7280",
    fontWeight: "600",
  },
});