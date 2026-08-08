import React from "react";

import {
  Text,
  View,
} from "react-native";

import { creatorDescriptionStyles } from "../../styles/creator/creatorDescription.styles";

type Props = {
  description?: string | null;
};

export default function CreatorDescription({
  description,
}: Props) {
  if (!description?.trim()) {
    return null;
  }

  return (
    <View style={creatorDescriptionStyles.container}>
      <Text style={creatorDescriptionStyles.title}>
        About
      </Text>

      <Text style={creatorDescriptionStyles.description}>
        {description.trim()}
      </Text>
    </View>
  );
}