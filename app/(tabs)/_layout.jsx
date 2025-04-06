import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Tabs } from 'expo-router';
import { ClubProvider } from '../ClubContext';
import useClubMeetingStore from '../store';

export default function TabLayout() {
  const {queryData, language} = useClubMeetingStore();
  function translate(term) {
    if(('en_EN' == language))
        ;//console.log('do not mess with English');
    else if(queryData && queryData.translations && queryData.translations[term])
    {
        term = queryData.translations[term];
    }
    else 
      console.log('translation not found',term);
    return term;  
  } 

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
          title: translate('Agenda'),
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="list" color={color} />,
          headerShown: false
        }}
      />
      <Tabs.Screen
        name="Timer"
        options={{
          title: translate('Timer'),
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="clock-o" color={color} />,
          headerShown: false
        }}
      />
      <Tabs.Screen
        name="Voting"
        options={{
          title: translate('Voting'),
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="ballot" size={24} color="black" />,
          headerShown: false
        }}
      />
      <Tabs.Screen
        name="More"
        options={{
          title: translate('More'),
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="cog" color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="Settings"
        options={{
          headerShown: false,
          href: null
        }}
      />
      <Tabs.Screen
        name="Translation"
        options={{
          headerShown: false,
          href: null
        }}
      />
      <Tabs.Screen
        name="Evaluation"
        options={{
          headerShown: false,
          href: null
        }}
      />
      <Tabs.Screen
        name="Progress"
        options={{
          headerShown: false,
          href: null
        }}
      />
    </Tabs>
</ClubProvider>
  );
}
