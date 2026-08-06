import { Ionicons } from "@expo/vector-icons";
import { View, Text } from "react-native";

import { styles } from "../../styles/navigation/tabIcon.styles";
import { Colors } from "../../styles/colors";

type IconName =
  | "compass"
  | "film"
  | "add-circle"
  | "star"
  | "person";

type Props = {
  focused: boolean;
  icon: IconName;
  title: string;
};

export default function TabIcon({
  focused,
  icon,
  title,
}: Props) {
  const color = focused ? Colors.accent : Colors.textMuted;

  return (
    <View style={styles.container}>
      <Ionicons
        name={
          focused
            ? icon
            : (`${icon}-outline` as keyof typeof Ionicons.glyphMap)
        }
        size={26}
        color={color}
      />

      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.75}
        style={[
            styles.label,
            {
            color,
            },
        ]}
        >
        {title}
      </Text>
    </View>
  );
}