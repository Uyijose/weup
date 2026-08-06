import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

import { styles } from "../../styles/layout/appHeader.styles";

export default function AppHeader() {
  return (
    <View style={styles.container}>
      <Text style={styles.logo}>
        WeUp
      </Text>

      <View style={styles.actions}>
        <Pressable onPress={() => router.push("/search")}>
          <Ionicons
            name="search-outline"
            size={24}
            color="#EDEDED"
          />
        </Pressable>

        <Pressable onPress={() => router.push("/chat/new")}>
          <Ionicons
            name="chatbubble-outline"
            size={24}
            color="#EDEDED"
          />
        </Pressable>

        <Pressable>
          <Ionicons
            name="notifications-outline"
            size={24}
            color="#EDEDED"
          />
        </Pressable>
      </View>
    </View>
  );
}