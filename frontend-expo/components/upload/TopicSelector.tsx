import { useEffect, useMemo, useState } from "react";

import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import { useTopicsStore } from "../../stores/topicsStore";
import { topicSelectorStyles } from "../../styles/upload/topicSelector.styles";

type Topic = {
  name: string;
  total_posts: number;
};

type TopicSelectorProps = {
  selectedTopics: string[];
  onTopicsChange: (topics: string[]) => void;
};

export default function TopicSelector({
  selectedTopics,
  onTopicsChange,
}: TopicSelectorProps) {
  const topics = useTopicsStore(
    (state) => state.topics as Topic[]
  );

  const loading = useTopicsStore(
    (state) => state.loading
  );

  const fetchTopics = useTopicsStore(
    (state) => state.fetchTopics
  );

  const [searchQuery, setSearchQuery] =
    useState("");

  const [customTopicInput, setCustomTopicInput] =
    useState("");

  const [customTopicInputVisible, setCustomTopicInputVisible] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  const filteredTopics = useMemo(() => {
    const query = searchQuery
      .trim()
      .toLowerCase();

    if (!query) {
      return topics;
    }

    return topics.filter((topic) =>
      topic.name
        .toLowerCase()
        .includes(query)
    );
  }, [topics, searchQuery]);

  const isSelected = (name: string) => {
    return selectedTopics.includes(name);
  };

  const handleTopicPress = (name: string) => {
    setError("");

    if (isSelected(name)) {
      onTopicsChange(
        selectedTopics.filter(
          (topic) => topic !== name
        )
      );

      return;
    }

    if (selectedTopics.length >= 3) {
      setError(
        "You can select up to 3 topics"
      );

      return;
    }

    onTopicsChange([
      ...selectedTopics,
      name,
    ]);
  };

  const handleOtherPress = () => {
    setError("");

    if (
      !customTopicInputVisible &&
      selectedTopics.length >= 3
    ) {
      setError(
        "You can select up to 3 topics"
      );
      return;
    }

    if (customTopicInputVisible) {
      setCustomTopicInputVisible(false);
      setCustomTopicInput("");
      return;
    }

    setCustomTopicInputVisible(true);
    setCustomTopicInput("");
  };

  const handleCustomTopicDone = () => {
    const trimmed =
      customTopicInput.trim();

    if (!trimmed) {
      setError("Enter a custom topic");
      return;
    }

    if (trimmed.length < 3) {
      setError(
        "Custom topic must be at least 3 characters"
      );
      return;
    }

    if (
      selectedTopics.length >= 3
    ) {
      setError(
        "You can select up to 3 topics"
      );
      return;
    }

    const customTopic =
      trimmed.replace(/\s+/g, "_");

    const withoutOther =
      selectedTopics.filter(
        (topic) => topic !== "Other"
      );

    onTopicsChange([
      ...withoutOther,
      customTopic,
    ]);

    console.log(
      "[TOPIC] Custom topic selected:",
      customTopic
    );

    setCustomTopicInput("");
    setCustomTopicInputVisible(false);
    setError("");
  };

  const handleRemoveSelected = (
    topic: string
  ) => {
    onTopicsChange(
      selectedTopics.filter(
        (item) => item !== topic
      )
    );
  };

  const renderTopic = ({
    item,
  }: {
    item: Topic;
  }) => {
    const selected =
      isSelected(item.name);

    return (
      <Pressable
        onPress={() =>
          handleTopicPress(item.name)
        }
        style={[
          topicSelectorStyles.topicItem,
          selected
            ? topicSelectorStyles.topicItemSelected
            : null,
        ]}
      >
        <Text
          style={[
            topicSelectorStyles.topicName,
            selected
              ? topicSelectorStyles.topicNameSelected
              : null,
          ]}
          numberOfLines={1}
        >
          {item.name}
        </Text>

        <Text
          style={[
            topicSelectorStyles.postCount,
            selected
              ? topicSelectorStyles.postCountSelected
              : null,
          ]}
        >
          ({item.total_posts})
        </Text>
      </Pressable>
    );
  };

  return (
    <View
      style={
        topicSelectorStyles.container
      }
    >
      <Text
        style={
          topicSelectorStyles.title
        }
      >
        Topics
      </Text>

      <Text
        style={
          topicSelectorStyles.subtitle
        }
      >
        Select up to 3 topics
      </Text>

      {selectedTopics.length > 0 && (
        <View
          style={
            topicSelectorStyles.selectedSection
          }
        >
          <Text
            style={
              topicSelectorStyles.selectedLabel
            }
          >
            Selected topics
          </Text>

          <View
            style={
              topicSelectorStyles.selectedList
            }
          >
            {selectedTopics.map(
              (topic) => (
                <View
                  key={topic}
                  style={
                    topicSelectorStyles.selectedChip
                  }
                >
                  <Text
                    style={
                      topicSelectorStyles.selectedChipText
                    }
                    numberOfLines={1}
                  >
                    {topic}
                  </Text>

                  <Pressable
                    onPress={() =>
                      handleRemoveSelected(
                        topic
                      )
                    }
                    style={
                      topicSelectorStyles.removeButton
                    }
                  >
                    <Text
                      style={
                        topicSelectorStyles.removeButtonText
                      }
                    >
                      ×
                    </Text>
                  </Pressable>
                </View>
              )
            )}
          </View>
        </View>
      )}

      <TextInput
        value={searchQuery}
        onChangeText={(value) => {
          setSearchQuery(value);
          setError("");
        }}
        placeholder="Search topics..."
        placeholderTextColor="#888888"
        style={
          topicSelectorStyles.searchInput
        }
        autoCapitalize="none"
        autoCorrect={false}
      />

      {loading ? (
        <View
          style={
            topicSelectorStyles.loadingContainer
          }
        >
          <ActivityIndicator
            size="small"
            color="#6A00F4"
          />

          <Text
            style={
              topicSelectorStyles.loadingText
            }
          >
            Loading topics...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredTopics}
          keyExtractor={(item) =>
            item.name
          }
          renderItem={renderTopic}
          style={
            topicSelectorStyles.topicList
          }
          contentContainerStyle={
            topicSelectorStyles.topicListContent
          }
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text
              style={
                topicSelectorStyles.emptyText
              }
            >
              No topics found
            </Text>
          }
          ListFooterComponent={
            <Pressable
              onPress={handleOtherPress}
              style={[
                topicSelectorStyles.topicItem,
                customTopicInputVisible
                  ? topicSelectorStyles.topicItemSelected
                  : null,
              ]}
            >
              <Text
                style={[
                  topicSelectorStyles.topicName,
                  customTopicInputVisible
                    ? topicSelectorStyles.topicNameSelected
                    : null,
                ]}
              >
                Other
              </Text>
            </Pressable>
          }
        />
      )}

      {customTopicInputVisible && (
        <View
          style={
            topicSelectorStyles.customContainer
          }
        >
          <TextInput
            value={customTopicInput}
            onChangeText={(value) => {
              setCustomTopicInput(value);
              setError("");
            }}
            placeholder="Type custom topic"
            placeholderTextColor="#888888"
            style={
              topicSelectorStyles.customInput
            }
            maxLength={50}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Pressable
            onPress={handleCustomTopicDone}
            style={
              topicSelectorStyles.doneButton
            }
          >
            <Text
              style={
                topicSelectorStyles.doneButtonText
              }
            >
              Done
            </Text>
          </Pressable>
        </View>
      )}

      {error !== "" && (
        <Text
          style={
            topicSelectorStyles.errorText
          }
        >
          {error}
        </Text>
      )}
    </View>
  );
}