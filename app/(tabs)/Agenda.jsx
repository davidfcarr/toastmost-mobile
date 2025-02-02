import { Text, View, ScrollView, TextInput, Pressable, Image, AppState, Switch, FlatList } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useState, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Octicons } from '@expo/vector-icons'
import FontAwesome from '@expo/vector-icons/FontAwesome';
import ProjectChooser from '../ProjectChooser';
import EditRole from '../EditRole';
import RenderRole from '../RenderRole';
import Timer from './Timer';
import Voting from './Voting';
/* import QRScanner from "./QRScanner"; */
import styles from '../styles'
import RenderHtml from 'react-native-render-html';
import * as Linking from 'expo-linking';
import { useWindowDimensions } from 'react-native';
import { Platform } from 'react-native';
import useAgenda from '../useAgenda';
import { ClubContext } from '../ClubContext';

export default function Agenda (props) {
    const { width, height } = useWindowDimensions();
    const context = useContext(ClubContext);
    const {agenda} = context;
 
    if(!agenda.html)
      return <Text>Loading ...</Text>;
  
    const source = (agenda.html) ? {'html':'<html><body>'+agenda.html+'</body></html>'} : {};
      
      return (
        <SafeAreaView  style={styles.container}>
        <View style={{width: '100%', marginBottom: 50, paddingBottom: 50 }}>
        {source ? <ScrollView><RenderHtml source={source} contentWidth={width - 20} /></ScrollView> : <Text>Agenda not loaded</Text>}
        </View>
        </SafeAreaView> 
      )
}
  