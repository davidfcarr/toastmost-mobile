import { Text, View, ScrollView, TextInput, Pressable, Dimensions, StyleSheet, AppState } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect} from "react";
import { Octicons } from '@expo/vector-icons'
//import Autocomplete from 'react-native-autocomplete-input';
import SelectDropdown from 'react-native-select-dropdown'
import BrandHeader from '../BrandHeader';
import useClubMeetingStore from '../store';
import TranslatedText from '../TranslatedText'; /* <TranslatedText term="" /> */

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

export default function Evaluation (props) {
    return (
        <SafeAreaView>
            <View>
                <TranslatedText term={'Evaluation'} />
            </View>
        </SafeAreaView>
    )
} 
