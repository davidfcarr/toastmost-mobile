import { Text, View, ScrollView, TextInput, Pressable, Image, AppState, Switch, FlatList } from "react-native";
import {useState} from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Linking from 'expo-linking';
import useClubMeetingStore from "./store";
import { Link } from 'expo-router';
import TranslatedText from "./TranslatedText";
import useAgenda from "./useAgenda";
import styles from './styles';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function BrandHeader(props) {
    const {message, queryData, setQueryData, setMessage, clubs} = useClubMeetingStore();
    const {getToastData} = useAgenda();
    const [changeName,setChangeName] = useState(false); 
    const [firstName,setFirstName] = useState(''); 
    const [lastName,setLastName] = useState('');

    function sendNameChange() {
        
        fetch(clubs[0].url+'?language=en_EN&mobileos=web', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
            },
            body: JSON.stringify({firstName:firstName,lastName:lastName})
        })
        .then(response => response.json())
        .then(data => {
          setQueryData(data);
          setMessage('');
        })
        .catch(error => {
            console.error('Error:', error);
            setMessage('Error updating name. Please try again.');
        });
    }

return (
    <View>
    <View style={{flexDirection: 'row',backgroundColor:'black',width:'100%'}}><Image style={{width:100,height:100}} source={require('../assets/images/ToastmostMobileLogo.png')} /><View style={{paddingLeft:10,alignContent:'center',justifyContent:'center'}}><Text style={{fontSize:30,color:'white',fontWeight:'bold'}}>Toastmost.org</Text><Text style={{fontSize:12,fontStyle:'italic',color:'white',fontWeight:'bold'}}>Digital tools for speakers and leaders</Text>
    <View style={{marginRight: 10, flexDirection: 'row'}} >
    <Pressable onPress={() => Linking.openURL('https://toastmost.org/mobile-support/')}>
    <MaterialIcons name="contact-support" size={24} color="white" />
    </Pressable>
    <Pressable
                  onPress={() => {
                    getToastData(clubs[0],'button in brandheader');
                    setMessage('Checking server for updates ...'+clubs[0].domain);
                  }}
                >
<MaterialCommunityIcons name="refresh" size={24} color="white" />
</Pressable></View>

    </View></View>
    {(queryData.sitename) ? <View style={{flexDirection:'row'}}>
    {props.isHome ? null : <Link href="/"><MaterialIcons name="home" size={24} color="black" /></Link>}
    {props.mode == 'edit' ? <Pressable onPress={() => props.setEdit('')}><MaterialIcons name="home" size={24} color="black" /></Pressable>: null}
      {(queryData && clubs.length && (!queryData.domain || queryData.domain == clubs[0].domain)) ? <Text style={{fontSize:20}}>{queryData.sitename}</Text> : null}
      </View> : null}
      {props.page ? <TranslatedText style={styles.h1} term={props.page} /> : null}
    {message ?
              <View>
                <TranslatedText style={{ backgroundColor: 'black', color: 'white', padding: 10, margin: 5 }} term={message} />
            </View>
            : 
            <View style={{flexDirection:'row', alignItems: 'center'}}>
            <Text style={{ padding: 10, margin: 5}}>
            {queryData && queryData.name ? queryData.name : ''} 
            </Text>
            {queryData && queryData.name  && queryData.name.includes('Test Account') ? <Pressable style={styles.plusbutton} onPress={() => {setChangeName(true)}}><TranslatedText style={styles.buttonText} term="Set Name" /></Pressable> : null}
          </View>
    }
    {changeName ? <View><TranslatedText term="First Name" /><TextInput style={styles.input} onChangeText={(input) => setFirstName(input)} /><TranslatedText term="Last Name" /><TextInput  style={styles.input} onChangeText={(input) => setLastName(input)} /><Pressable onPress={() => {sendNameChange(),setChangeName(false),setMessage('Updating name')}} style={styles.button} ><TranslatedText style={styles.buttonText} term="Save" /></Pressable> </View> : null}
    </View>
)
}