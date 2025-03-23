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
import TranslatedText from '../TranslatedText'; /* <TranslatedText term="" /> */

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
    const {clubs, meeting, queryData, agenda} = useClubMeetingStore();
    const [subject, setSubject] = useState((agenda && agenda.title) ? 'Sign up for '+agenda.title+', '+queryData.sitename : '');
    const [note, setNote] = useState('');
    const {emailAgenda} = useAgenda();

  if (!clubs || !clubs.length) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View>
          <BrandHeader />
          <Text>Once you connect to a Toastmost (or compatible) club website, you will be able to see meeting agendas here and share them via email.</Text>
        </View>
      </SafeAreaView>
    );
  }

    if(!agenda || !agenda.html || !agenda.title)
      return <SafeAreaView><BrandHeader /><Text>Loading ...</Text><Text>If this message does not appear after a few seconds, go back to the Home screen and ensure that the agenda is fully loaded. Check your club settings on the Settings screen and your network connection.</Text></SafeAreaView>;
  
    const source = (agenda.html) ? {'html':'<html><body>'+agenda.html+'</body></html>'} : {};
      
      return (
        <SafeAreaView  style={styles.container}>
        <ScrollView>

          <BrandHeader />
        <View style={{width: '100%', marginBottom: 50, paddingBottom: 50 }}>
        <TextInput style={{width: '100%', height: 40, borderColor: 'gray', borderWidth: 1}} placeholder="Subject" value={subject}  onChangeText={(input) => setSubject(input)} />
        <TextInput style={{width: '100%', height: 40, borderColor: 'gray', borderWidth: 1}} placeholder="Note (optional)" value={note} onChangeText={(input) => setNote(input)}/>
        <Pressable style={styles.button} onPress={()=>{ emailAgenda({post_id: agenda.post_id,agendaemail: 'members',emailagenda: 'members',subject:subject,note:note}) }}><Text style={styles.buttonText}><TranslatedText term="Send Email" /></Text></Pressable>
        <Text>Email version includes one-click signup links</Text>
        {source ? <RenderHtml source={source} contentWidth={width - 20} /> : <Text>Agenda not loaded</Text>}
        </View>
        </ScrollView>
        </SafeAreaView> 
      )
}
  