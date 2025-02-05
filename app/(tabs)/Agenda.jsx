import { Text, View, ScrollView, TextInput, Pressable, Image, AppState, Switch, FlatList } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useState, useContext } from "react";
import styles from '../styles'
import RenderHtml from 'react-native-render-html';
import { useWindowDimensions } from 'react-native';
import { ClubContext } from '../ClubContext';
import BrandHeader from '../BrandHeader';

export default function Agenda (props) {
    const { width, height } = useWindowDimensions();
    const context = useContext(ClubContext);
    const {agenda} = context;
 
    if(!agenda.html)
      return <Text>Loading ...</Text>;
  
    const source = (agenda.html) ? {'html':'<html><body>'+agenda.html+'</body></html>'} : {};
      
      return (
        <SafeAreaView  style={styles.container}>
        <BrandHeader />
        <View style={{width: '100%', marginBottom: 50, paddingBottom: 50 }}>
        {source ? <ScrollView><RenderHtml source={source} contentWidth={width - 20} /></ScrollView> : <Text>Agenda not loaded</Text>}
        </View>
        </SafeAreaView> 
      )
}
  