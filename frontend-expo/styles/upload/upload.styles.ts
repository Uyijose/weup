import { StyleSheet } from "react-native";

export const uploadStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000000",
  },

  container: {
    flex: 1,
    backgroundColor: "#000000",
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 8,
  },

  subtitle: {
    color: "#AAAAAA",
    fontSize: 14,
    marginBottom: 24,
  },

  pickerContainer: {
    width: "100%",
  },

  selectedVideo: {
    marginTop: 20,
    width: "100%",
    height: 240,
    borderRadius: 12,
    backgroundColor: "#111111",
  },

  selectedVideoText: {
    color: "#FFFFFF",
    fontSize: 14,
    marginTop: 8,
  },

  error: {
    color: "#FF6B6B",
    fontSize: 14,
    marginTop: 16,
  },
});