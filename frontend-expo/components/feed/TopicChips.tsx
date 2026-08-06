import {
  ScrollView,
  Pressable,
  Text,
} from "react-native";

import { TOPICS } from "../../constants/topics";
import { useExploreStore } from "../../stores/exploreStore";
import { styles } from "../../styles/feed/topicChips.styles";

export default function TopicChips() {
  const category = useExploreStore(
    (state) => state.category
  );

  const setCategory = useExploreStore(
    (state) => state.setCategory
  );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
      style={styles.container}
    >
      {TOPICS.map((topic) => {
        const selected =
          topic.value === category;

        return (
          <Pressable
            key={topic.value}
            onPress={() =>
              setCategory(topic.value)
            }
            style={[
              styles.chip,
              selected &&
                styles.activeChip,
            ]}
          >
            <Text
              style={[
                styles.text,
                selected &&
                  styles.activeText,
              ]}
            >
              {topic.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}