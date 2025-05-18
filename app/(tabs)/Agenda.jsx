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
import {Link} from 'expo-router';

export function ErrorBoundary({ error, retry }) {
  return (
  <SafeAreaView>
    <View>
    <Text style={{color:'red'}}>{error.message}</Text>
    <Pressable onPress={retry} style={{backgroundColor:'black',padding: 10, borderRadius: 5, margin: 10}}><Text style={{color:'white'}}>Try Again?</Text></Pressable>
    <Text>Try navigating to the <Link href="/Settings"  style={{textDecorationLine: 'underline'}}>Settings</Link> screen.</Text>
  </View>
</SafeAreaView>
  );
}

export default function Agenda (props) {
    const { width, height } = useWindowDimensions();
    const {clubs, meeting, queryData, agenda} = useClubMeetingStore();
    const [subject, setSubject] = useState((agenda && agenda.title) ? 'Sign up for '+agenda.title+', '+queryData.sitename : '');
    const [note, setNote] = useState('');
    const [emailControls, setEmailControls] = useState(false);
    const {emailAgenda} = useAgenda();
    const [showIntros,setShowIntros] = useState(false);

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
    console.log('agenda object',agenda);
    const source = (agenda.html) ? {'html':'<html><body>'+(emailControls? agenda.html: agenda.html.replaceAll(/\- <a[^>]+[^<]+<\/a>/g,''))+'</body></html>'} : {};
      
      return (
        <SafeAreaView  style={styles.container}>
        <ScrollView>

          <BrandHeader />
        <View style={{width: '100%', marginBottom: 50, paddingBottom: 50 }}>
          {agenda.intros ? (
            <View style={{flexDirection: 'row', alignItems: 'center',marginBottom:10}}>
              <Switch
                trackColor={{false: '#767577', true: '#81b0ff'}}
                thumbColor={showIntros ? '#f5dd4b' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={() => {
                  const newshow = !showIntros;
                  setShowIntros(newshow);
                }}
                value={showIntros}
              />
              <TranslatedText term="Show Speech Introductions" style={{marginLeft: 10}} />
            </View>
          ) : null}
        {showIntros ?  <RenderHtml source={{html:agenda.intros}} /> : null}

        {emailControls ? 
        <View>
        <TranslatedText term="Email Subject Line" />
        <TextInput multiline={true} style={{width: '100%', height: 50, borderColor: 'gray', borderWidth: 1, textAlign: 'left'}} placeholder="Subject" value={subject}  onChangeText={(input) => setSubject(input)} />
        <TextInput multiline={true} style={{width: '100%', height: 50, borderColor: 'gray', borderWidth: 1}} placeholder="Note (optional)" value={note} onChangeText={(input) => setNote(input)}/>
        <Pressable style={styles.button} onPress={()=>{ emailAgenda({post_id: agenda.post_id,agendaemail: 'members',emailagenda: 'members',subject:subject,note:note}) }}><Text style={styles.buttonText}><TranslatedText term="Send Email" /></Text></Pressable>
        <Text>Email version includes one-click signup links</Text>
        </View>
        : null}
        <View style={{flexDirection:'row'}}>
        <Switch
        trackColor={{false: '#767577', true: '#81b0ff'}}
        thumbColor={emailControls ? '#f5dd4b' : '#f4f3f4'}
        ios_backgroundColor="#3e3e3e"
        onValueChange={() => {
          const newc = !emailControls;
          setEmailControls(newc);
        }}
        value={emailControls}
      /><TranslatedText term="Show Email Controls" style={{marginLeft: 10}} />
        </View>
        {source ? <RenderHtml source={source} contentWidth={width - 20} /> : <Text>Agenda not loaded</Text>}
        </View>
        </ScrollView>
        </SafeAreaView> 
      )
}
  