import { SafeAreaView } from "react-native";

import AppHeader from "../../components/layout/AppHeader";
import ExploreHeader from "../../components/feed/ExploreHeader";
import TopicChips from "../../components/feed/TopicChips";
import ExploreFeed from "../../components/feed/ExploreFeed";

export default function ExploreTab() {
  console.log("[SCREEN] Explore mounted");

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#000",
      }}
    >
      <AppHeader />

      <ExploreHeader />

      <TopicChips />

      <ExploreFeed />
    </SafeAreaView>
  );
}