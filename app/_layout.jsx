import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import ErrorBoundary from './ErrorBoundary';

export default function RootLayout() {

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
      <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}