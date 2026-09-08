import { Button, Text } from "@milindvpatil05-dev/react-native-fieldops-ui";
import { View } from "react-native";
import { styles } from "../styles/navBar.styles";

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
