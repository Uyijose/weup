import { SafeAreaView } from "react-native";

import AppHeader from "../../components/layout/AppHeader";
import FeedViewer from "../../components/feed/FeedViewer";

export default function PostsTab() {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#000",
      }}
    >
      <AppHeader />

      <FeedViewer />
    </SafeAreaView>
  );
}