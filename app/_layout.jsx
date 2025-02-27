import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import LogRocket from '@logrocket/react-native';

export default function RootLayout() {


  useEffect(() => {
    LogRocket.init('dibbvn/toastmost', {
      updateId: Updates.isEmbeddedLaunch ? null : Updates.updateId,
      expoChannel: Updates.channel,
    });
  }, []);

  return (
      <SafeAreaProvider>
      <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
      </SafeAreaProvider>
  );
}