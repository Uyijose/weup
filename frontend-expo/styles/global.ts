import { Colors } from "./colors";

export const GlobalStyles = {
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  center: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    backgroundColor: Colors.background,
  },
};