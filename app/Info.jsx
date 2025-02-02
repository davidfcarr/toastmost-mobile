import { Text, View, ScrollView } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import styles from './styles'
import RenderHtml from 'react-native-render-html';
import * as Linking from 'expo-linking';
import { useWindowDimensions } from 'react-native';
import { Platform } from 'react-native';
import useAgenda from './useAgenda';

export default function Info (props) {
    const { width, height } = useWindowDimensions();
  
    const {toastmostData, message} = useAgenda();
  
      return (
        <SafeAreaView  style={styles.container}>
        <View style={{width: '100%', marginBottom: 50, paddingBottom: 50 }}>
        <ScrollView>
      <View style={{borderWidth: 1, borderColor: 'gray'}}>
        <Text style={styles.instructions}>This app makes it easy to sign up for roles, update speech details, time speeches, and perform other useful functions TBD. The app works with websites that are hosted on Toastmost.org or that have installed the WordPress for Toastmasters software.</Text>
        <Text style={styles.instructions}>If you are a member of more than one club that uses the Toastmost service, you will be able to use the same access code for all of those clubs.</Text>
        {(toastmostData && toastmostData.infoScreen) ? <View style={{marginLeft: 5}}><RenderHtml source={{'html':'<html><body>'+toastmostData.infoScreen+'</body></html>'}} contentWidth={width - 20} /></View> : null}
      </View>
        </ScrollView>
        </View>
        </SafeAreaView> 
      )
}
