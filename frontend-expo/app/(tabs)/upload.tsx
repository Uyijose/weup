import { SafeAreaView, Text, View } from "react-native";

import AppHeader from "../../components/layout/AppHeader";

export default function UploadTab() {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#000",
      }}
    >
      <AppHeader />

      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: "#FFFFFF",
          }}
        >
          Upload
        </Text>
      </View>
    </SafeAreaView>
  );
}