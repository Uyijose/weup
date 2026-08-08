import { StyleSheet } from "react-native";

export const becomeCreatorStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F9",
  },

  keyboardContainer: {
    flex: 1,
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: "#555555",
  },

  header: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },

  backText: {
    fontSize: 34,
    lineHeight: 36,
    color: "#1A0033",
    marginTop: -4,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A0033",
  },

  headerSpacer: {
    width: 42,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 20,
  },

  title: {
    fontSize: 25,
    fontWeight: "700",
    color: "#1A0033",
    marginBottom: 12,
  },

  introText: {
    fontSize: 15,
    lineHeight: 23,
    color: "#606060",
    marginBottom: 28,
  },

  formGroup: {
    marginBottom: 22,
  },

  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A0033",
    marginBottom: 7,
  },

  optionalText: {
    fontSize: 13,
    color: "#888888",
    marginBottom: 12,
  },

  helperText: {
    fontSize: 12,
    color: "#888888",
    marginBottom: 8,
  },

  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#222222",
    backgroundColor: "#FFFFFF",
  },

  textArea: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 14,
    fontSize: 15,
    color: "#222222",
    backgroundColor: "#FFFFFF",
  },

  avatarPicker: {
    width: 130,
    height: 130,
    borderRadius: 65,
    overflow: "hidden",
    alignSelf: "center",
  },

  avatarPreview: {
    width: 130,
    height: 130,
    borderRadius: 65,
  },

  avatarPlaceholder: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 1,
    borderColor: "#D8D8D8",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FAFAFA",
  },

  avatarPlaceholderText: {
    fontSize: 34,
    fontWeight: "300",
    color: "#6A00F4",
    lineHeight: 38,
  },

  avatarPlaceholderLabel: {
    fontSize: 12,
    color: "#666666",
    marginTop: 3,
  },

  changeImageButton: {
    alignSelf: "center",
    marginTop: 10,
  },

  changeImageText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6A00F4",
  },

  actions: {
    marginTop: 8,
    gap: 12,
  },

  confirmButton: {
    minHeight: 52,
    borderRadius: 10,
    backgroundColor: "#6A00F4",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },

  confirmText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  disabledButton: {
    opacity: 0.65,
  },

  cancelButton: {
    minHeight: 52,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D8D8D8",
    alignItems: "center",
    justifyContent: "center",
  },

  cancelText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333333",
  },
});