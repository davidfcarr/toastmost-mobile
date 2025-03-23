import { Text, View, ScrollView, TextInput, Pressable, Image, AppState, Switch, FlatList } from "react-native";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Linking from 'expo-linking';
import useClubMeetingStore from "./store";
import { Link } from 'expo-router';
import TranslatedText from "./TranslatedText";

export default function BrandHeader(props) {
    const {message, queryData} = useClubMeetingStore();
    
return (
    <View>
    <View style={{flexDirection: 'row',backgroundColor:'black',width:'100%'}}><Image style={{width:100,height:100}} source={require('../assets/images/ToastmostMobileLogo.png')} /><View style={{paddingLeft:10,alignContent:'center',justifyContent:'center'}}><Text style={{fontSize:30,color:'white',fontWeight:'bold'}}>Toastmost.org</Text><Text style={{fontSize:12,fontStyle:'italic',color:'white',fontWeight:'bold'}}>Digital tools for speakers and leaders</Text>
    <Pressable onPress={() => Linking.openURL('https://toastmost.org/mobile-support/')}>
    <MaterialIcons name="contact-support" size={24} color="white" />
    </Pressable>
    </View></View>
    {(queryData.sitename) ? <View style={{flexDirection:'row'}}>
    {props.isHome ? null : <Link href="/"><MaterialIcons name="home" size={24} color="black" /></Link>}
    {props.mode == 'edit' ? <Pressable onPress={() => props.setEdit('')}><MaterialIcons name="home" size={24} color="black" /></Pressable>: null}
      <Text style={{fontSize:20}}>{queryData.sitename}</Text>
      </View> : null}
    {message ?
              <View>
                <TranslatedText style={{ backgroundColor: 'black', color: 'white', padding: 10, margin: 5 }} term={message} />
            </View>
            : 
            <View>
            <Text style={{ padding: 10, margin: 5}}>
            {queryData.name ? queryData.name : ''}
            </Text>
          </View>
    }
    </View>
)
}