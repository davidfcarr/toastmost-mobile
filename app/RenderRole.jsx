import { Text, View, ScrollView, TextInput, Pressable, Image, AppState, Switch, FlatList } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { Inter_500Medium, useFonts } from "@expo-google-fonts/inter";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Octicons } from '@expo/vector-icons'
import FontAwesome from '@expo/vector-icons/FontAwesome';
import ProjectChooser from './ProjectChooser';
import EditRole from './EditRole';
import Timer from './(tabs)/Timer';
import Voting from './(tabs)/Voting';
/* import QRScanner from "./QRScanner"; */
import styles from './styles'
import RenderHtml from 'react-native-render-html';
import * as Linking from 'expo-linking';
import { useWindowDimensions } from 'react-native';
import { Platform } from 'react-native';
import useAgenda from './useAgenda';

export default function RenderRole({ item, index, updateRole, user_id, name }) {
      
  return (
    <View key={item.assignment_key}>
    <View style={{flexDirection: 'row',marginTop: 5,alignContent:'center'}}>
        {(item.ID == 0) ? <Pressable style={styles.addButton} onPress={() => { const newitem = {...item}; newitem.ID = user_id; newitem.name = name; console.log('newitem',newitem); updateRole(newitem); }}><Text  style={styles.addButtonText}>+</Text></Pressable> : null}
        {(item.ID == user_id) ? <Pressable style={[styles.addButton,{backgroundColor:'red'}]} onPress={() => { const newitem = {...item}; newitem.ID = 0; newitem.name=''; updateRole(newitem);  }}><Text  style={styles.addButtonText}>-</Text></Pressable>: null}
        <Text style={{paddingTop: 10,fontSize: 20, marginLeft: ((item.ID != 0) && (item.ID != user_id)) ? 33: 5}}> 
          {item.role} {item.name} 
        </Text>
    </View>
        {(item.ID == user_id && 'Speaker' == item.role) ? <View>
        <ProjectChooser {...item} updateRole={updateRole} styles={styles} />
 </View> : null}
      </View>
)

}
