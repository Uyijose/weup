import { Text, View } from "react-native";

import { styles } from "../../styles/feed/exploreHeader.styles";

export default function ExploreHeader() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Explore
      </Text>

      <Text style={styles.subtitle}>
        Discover trending videos
      </Text>
    </View>
  );
}