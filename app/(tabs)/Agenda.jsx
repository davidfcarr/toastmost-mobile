import { Text, View, ScrollView, TextInput, Pressable, Image, AppState, Switch, FlatList } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import styles from '../styles'
import RenderHtml from 'react-native-render-html';
import { useWindowDimensions } from 'react-native';
import useAgenda from '../useAgenda';
import BrandHeader from '../BrandHeader';
import useClubMeetingStore from "../store";
import { ErrorBoundaryProps } from 'expo-router';
import { useState } from "react";

export function ErrorBoundary({ error, retry }) {
  return (
  <SafeAreaView><BrandHeader {...queryData} />
    <View>
    <Text style={{color:'red'}}>{error.message}</Text>
    <Pressable onPress={retry} style={{backgroundColor:'black',padding: 10, borderRadius: 5, margin: 10}}><Text style={{color:'white'}}>Try Again?</Text></Pressable>
  </View>
</SafeAreaView>
  );
}

export default function Agenda (props) {
    const { width, height } = useWindowDimensions();
    const {meeting, queryData} = useClubMeetingStore();
    const agenda = (queryData && queryData.agendas) ? queryData.agendas[meeting] : {};
    const [subject, setSubject] = useState((agenda && agenda.title) ? 'Sign up for '+agenda.title+', '+queryData.sitename : '');
    const [note, setNote] = useState('');
    const {emailAgenda} = useAgenda();

    if(!agenda || !agenda.html || !agenda.title)
      return <SafeAreaView><BrandHeader /><Text>Loading ...</Text></SafeAreaView>;
  
    const source = (agenda.html) ? {'html':'<html><body>'+agenda.html+'</body></html>'} : {};
      
      return (
        <SafeAreaView  style={styles.container}>
        <ScrollView>

          <BrandHeader />
        <View style={{width: '100%', marginBottom: 50, paddingBottom: 50 }}>
        <TextInput style={{width: '100%', height: 40, borderColor: 'gray', borderWidth: 1}} placeholder="Subject" value={subject}  onChangeText={(input) => setSubject(input)} />
        <TextInput style={{width: '100%', height: 40, borderColor: 'gray', borderWidth: 1}} placeholder="Note (optional)" value={note} onChangeText={(input) => setNote(input)}/>
        <Pressable style={{backgroundColor:'black',padding: 10, borderRadius: 5, margin: 10}} onPress={()=>{ emailAgenda({post_id: agenda.post_id,agendaemail: 'members',emailagenda: 'members',subject:subject,note:note}) }}><Text style={{color:'white'}}>Email to Members</Text></Pressable>
        <Text>Email version includes one-click signup links</Text>
        {source ? <RenderHtml source={source} contentWidth={width - 20} /> : <Text>Agenda not loaded</Text>}
        </View>
        </ScrollView>
        </SafeAreaView> 
      )
}
  