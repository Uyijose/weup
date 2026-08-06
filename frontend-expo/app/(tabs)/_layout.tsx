import { Tabs } from "expo-router";

import TabIcon from "../../components/navigation/TabIcon";
import { Colors } from "../../styles/colors";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: Colors.background,
          borderTopWidth: 0,
          height: 70,
          paddingTop: 8,
          paddingBottom: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Explore",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              icon="compass"
              title="Explore"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="posts"
        options={{
          title: "Posts",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              icon="film"
              title="Posts"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="upload"
        options={{
          title: "Upload",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              icon="add-circle"
              title="Upload"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="subscriptions"
        options={{
          title: "Subscriptions",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              icon="star"
              title="Subscriptions"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              icon="person"
              title="Profile"
            />
          ),
        }}
      />
    </Tabs>
  );
}