import React from "react";
import {
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { profileStatsStyles } from "../../styles/profile/profileStats.styles";

type Props = {
  watchedCount: number;
  subscriptionsCount: number;
  onSubscriptionsPress?: () => void;
};

export default function ProfileStats({
  watchedCount,
  subscriptionsCount,
  onSubscriptionsPress,
}: Props) {
  return (
    <View style={profileStatsStyles.container}>
      <View style={profileStatsStyles.stat}>
        <Text style={profileStatsStyles.value}>
          {watchedCount}
        </Text>

        <Text style={profileStatsStyles.label}>
          Videos Watched
        </Text>
      </View>

      <View style={profileStatsStyles.divider} />

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onSubscriptionsPress}
        style={profileStatsStyles.stat}
      >
        <Text style={profileStatsStyles.value}>
          {subscriptionsCount}
        </Text>

        <Text style={profileStatsStyles.label}>
          Subscriptions
        </Text>
      </TouchableOpacity>
    </View>
  );
}