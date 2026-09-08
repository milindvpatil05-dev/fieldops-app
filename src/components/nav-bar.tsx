import { Button, Text } from "@milindvpatil05-dev/react-native-fieldops-ui";
import { View } from "react-native";

// Shared page header: optional back button + page title, used on every screen.
export function NavBar({ title, onBack }: { title: string; onBack?: () => void }) {
  return (
    <View style={styles.container}>
      {onBack && (
        <Button
          label="←"
          variant="ghost"
          size="sm"
          onPress={onBack}
          style={styles.back}
        />
      )}
      <Text variant="title" style={styles.title}>
        {title}
      </Text>
    </View>
  );
}

const styles = {
  container: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  back: { paddingHorizontal: 4 },
  title: { flexShrink: 1 },
};
