import { Text, View, ScrollView, TextInput, Pressable, Dimensions, StyleSheet, AppState } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect} from "react";
import { Octicons } from '@expo/vector-icons'
//import Autocomplete from 'react-native-autocomplete-input';
import SelectDropdown from 'react-native-select-dropdown'
import BrandHeader from '../BrandHeader';
import useClubMeetingStore from '../store';
import TranslatedText from '../TranslatedText'; /* <TranslatedText term="" /> */
import styles from '../styles'
import { useWindowDimensions } from 'react-native';
import { useRouter } from "expo-router";
import useAgenda from '../useAgenda';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

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

export default function More (props) {
    const { width, height } = useWindowDimensions();
    const {clubs, setClubs, setMessage} = useClubMeetingStore();
    const {resetClubData} = useAgenda();
    const router = useRouter();

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
/*
            <Pressable style={styles.maroonButton} onPress={() => {router.navigate('/EvaluationTool')}}>
                <TranslatedText term={'Evaluation'} style={styles.buttonText} />
            </Pressable>

*/                
          return (
            <SafeAreaView  style={styles.container}>    
              <BrandHeader />
              <Pressable style={styles.blueButton} onPress={() => {router.navigate('/Progress')}}>
                <TranslatedText term={'Progress Report'} style={styles.yellowText} />
            </Pressable>
            <Pressable style={styles.maroonButton} onPress={() => {router.navigate('/EvaluationTool')}}>
                <TranslatedText term={'Evaluation'} style={styles.buttonText} />
            </Pressable>
            <Pressable style={styles.yellowButton} onPress={() => {router.navigate('/Translation')}}>
                <TranslatedText term={'Translation'} style={styles.blueText} />
            </Pressable>
            <Pressable style={styles.button} onPress={() => {router.navigate('/Settings')}}>
                <TranslatedText term={'Settings'} style={styles.buttonText} />
            </Pressable>
            {(clubs.length > 1) ? clubs.map(
          (clubChoice, index) => {
            if(index)
            return (
              <View style={{flexDirection: 'row'}} key={index}>
                <Pressable key={'choose'+index} onPress={() => {const newclubs = [...clubs]; newclubs.splice(index,1); newclubs.unshift(clubChoice); setClubs(newclubs); setMessage('Reloading ...'); resetClubData(newclubs[0]); } } style={styles.button}>
                  <Text style={styles.buttonText}>{clubChoice.domain}</Text>
                </Pressable>
              </View>
            )
          }
        )
        : null}

        </SafeAreaView>
    )
} 
