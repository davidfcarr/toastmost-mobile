import { Text, View, ScrollView, TextInput, Pressable, Image, AppState, Switch, FlatList } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import styles from '../styles'
import RenderHtml from 'react-native-render-html';
import { useWindowDimensions } from 'react-native';
import useAgenda from '../useAgenda';
import BrandHeader from '../BrandHeader';
import useClubMeetingStore from "../store";
import { ErrorBoundaryProps } from 'expo-router';
import TranslatedText from '../TranslatedText'; /* <TranslatedText term="" /> */
import {Link} from 'expo-router';
import { useState, useEffect } from "react";

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

export default function Progress (props) {
    const { width, height } = useWindowDimensions();
    const {clubs, meeting, queryData, agenda} = useClubMeetingStore();
    const [progress, setProgress] = useState('');
    const {getProgress, fetchToastData,initToastmost} = useAgenda();

    useEffect(() => {
        if(clubs.length)
        getProgress();
        else
        initToastmost();
      },[]);

      useEffect(() => {
        if(clubs.length)
        getProgress();
      },[clubs]);
    
  if (!clubs || !clubs.length) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View>
          <BrandHeader page="Progress Report" />
          <Text>Once you connect to a Toastmost (or compatible) club website, you will be able to see meeting agendas here and share them via email.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if(!progress && queryData.progress)
        setProgress(queryData.progress);

    if(!progress)
      return <SafeAreaView><BrandHeader page="Progress Report" /><Text>Loading Progress Report ...</Text></SafeAreaView>;
  
    const source = {'html':'<html><body>'+progress+'</body></html>'};
      
      return (
        <SafeAreaView  style={styles.container}>
        <ScrollView>

          <BrandHeader page="Progress Report" />
        <View style={{width: '100%', marginBottom: 50, paddingBottom: 50 }}>
        {source ? <RenderHtml source={source} contentWidth={width - 20} /> : null}
        </View>
        </ScrollView>
        </SafeAreaView> 
      )
}
