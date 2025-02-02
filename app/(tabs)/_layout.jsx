import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Tabs } from 'expo-router';
import { ClubProvider } from '../ClubContext';

export default function TabLayout() {
  return (
    <ClubProvider>
    <Tabs screenOptions={{ tabBarActiveTintColor: 'blue' }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />,
          headerShown: false
        }}
      />
      <Tabs.Screen
        name="Agenda"
        options={{
          title: 'Agenda',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="list" color={color} />,
          canGoBack: true
        }}
      />
      <Tabs.Screen
        name="Timer"
        options={{
          title: 'Timer',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="clock-o" color={color} />,
          canGoBack: true
        }}
      />
      <Tabs.Screen
        name="Voting"
        options={{
          title: 'Voting',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="ballot" size={24} color="black" />,
          canGoBack: true
        }}
      />
      <Tabs.Screen
        name="Settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="cog" color={color} />,
          canGoBack: true
        }}
      />
    </Tabs>
</ClubProvider>
  );
}
