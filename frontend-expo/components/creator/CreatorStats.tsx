import React from "react";

import {
  Text,
  View,
} from "react-native";

import { creatorStatsStyles } from "../../styles/creator/creatorStats.styles";

type Props = {
  videos: number;
  subscribers: number;
  views: number;
  wup: number;
};

export default function CreatorStats({
  videos,
  subscribers,
  views,
  wup,
}: Props) {
  return (
    <View style={creatorStatsStyles.container}>
      <View style={creatorStatsStyles.stat}>
        <Text style={creatorStatsStyles.value}>
          {videos}
        </Text>

        <Text style={creatorStatsStyles.label}>
          Videos
        </Text>
      </View>

      <View style={creatorStatsStyles.stat}>
        <Text style={creatorStatsStyles.value}>
          {subscribers}
        </Text>

        <Text style={creatorStatsStyles.label}>
          Subscribers
        </Text>
      </View>

      <View style={creatorStatsStyles.stat}>
        <Text style={creatorStatsStyles.value}>
          {views}
        </Text>

        <Text style={creatorStatsStyles.label}>
          Views
        </Text>
      </View>

      <View style={creatorStatsStyles.stat}>
        <Text style={creatorStatsStyles.value}>
          {wup}
        </Text>

        <Text style={creatorStatsStyles.label}>
          WUP
        </Text>
      </View>
    </View>
  );
}