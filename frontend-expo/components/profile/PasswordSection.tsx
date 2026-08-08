import React from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type PasswordSectionProps = {
  newPassword: string;
  confirmPassword: string;
  showNewPassword: boolean;
  showConfirmPassword: boolean;
  setNewPassword: (value: string) => void;
  setConfirmPassword: (value: string) => void;
  setShowNewPassword: (value: boolean) => void;
  setShowConfirmPassword: (value: boolean) => void;
};

export default function PasswordSection({
  newPassword,
  confirmPassword,
  showNewPassword,
  showConfirmPassword,
  setNewPassword,
  setConfirmPassword,
  setShowNewPassword,
  setShowConfirmPassword,
}: PasswordSectionProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>
        Password
      </Text>

      <View style={styles.field}>
        <Text style={styles.label}>
          New Password
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!showNewPassword}
            autoCapitalize="none"
            style={styles.input}
            placeholder="Enter new password"
            placeholderTextColor="#777"
          />

          <TouchableOpacity
            onPress={() =>
              setShowNewPassword(
                !showNewPassword
              )
            }
            style={styles.eyeButton}
          >
            <Text style={styles.eyeText}>
              {showNewPassword ? "Hide" : "Show"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>
          Confirm Password
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
            style={styles.input}
            placeholder="Confirm new password"
            placeholderTextColor="#777"
          />

          <TouchableOpacity
            onPress={() =>
              setShowConfirmPassword(
                !showConfirmPassword
              )
            }
            style={styles.eyeButton}
          >
            <Text style={styles.eyeText}>
              {showConfirmPassword ? "Hide" : "Show"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    marginBottom: 24,
  },
  sectionTitle: {
    color: "#EDEDED",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 18,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    color: "#EDEDED",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#160B24",
    borderWidth: 1,
    borderColor: "#332044",
    borderRadius: 10,
  },
  input: {
    flex: 1,
    color: "#EDEDED",
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  eyeButton: {
    paddingHorizontal: 12,
  },
  eyeText: {
    color: "#00D2FF",
    fontSize: 13,
    fontWeight: "600",
  },
});