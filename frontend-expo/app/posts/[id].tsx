import {
  useLocalSearchParams,
} from "expo-router";

import {
  SafeAreaView,
  Text,
  View,
} from "react-native";

export default function PostViewerScreen() {
  const params =
    useLocalSearchParams<{
      id: string;
      part?: string;
    }>();

  const postId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const part = Array.isArray(
    params.part
  )
    ? params.part[0]
    : params.part;

  console.log(
    "[POST VIEWER] Opened post:",
    postId
  );

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#000000",
      }}
    >
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}
      >
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 20,
            fontWeight: "600",
            marginBottom: 12,
          }}
        >
          Post Viewer
        </Text>

        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 16,
          }}
        >
          Post ID: {postId}
        </Text>

        {part && (
          <Text
            style={{
              color: "#AAAAAA",
              marginTop: 8,
            }}
          >
            Part: {part}
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
}