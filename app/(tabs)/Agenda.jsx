import { Text, View, ScrollView, TextInput, Pressable, Image, AppState, Switch, FlatList } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import styles from '../styles'
import RenderHtml from 'react-native-render-html';
import { useWindowDimensions } from 'react-native';
import useAgenda from '../useAgenda';
import BrandHeader from '../BrandHeader';
import useClubMeetingStore from "../store";

export default function Agenda (props) {
    const { width, height } = useWindowDimensions();
    const {meeting, queryData} = useClubMeetingStore();
    const agenda = (queryData && queryData.agendas) ? queryData.agendas[meeting] : {};
     
    if(!agenda || !agenda.html)
      return <Text>Loading ...</Text>;
  
    const source = (agenda.html) ? {'html':'<html><body>'+agenda.html+'</body></html>'} : {};
      
      return (
        <SafeAreaView  style={styles.container}>
        <ScrollView>
          <BrandHeader />
        <View style={{width: '100%', marginBottom: 50, paddingBottom: 50 }}>
        {source ? <RenderHtml source={source} contentWidth={width - 20} /> : <Text>Agenda not loaded</Text>}
        </View>
        </ScrollView>
        </SafeAreaView> 
      )
}
  