import { Text, View, ScrollView, TextInput, Pressable, Image, AppState, Switch, FlatList } from "react-native";
export default function BrandHeader(props) {
    console.log('brandheader props',props);
return (
    <View>
    <View style={{flexDirection: 'row',backgroundColor:'black',width:'100%'}}><Image style={{width:100,height:100}} source={require('../assets/images/ToastmostMobileLogo.png')} /><View style={{width:'100%',paddingLeft:10,alignContent:'center',justifyContent:'center'}}><Text style={{fontSize:30,color:'white',fontWeight:'bold'}}>Toastmost.org</Text><Text style={{fontSize:14,fontStyle:'italic',color:'white',fontWeight:'bold'}}>Digital tools for speakers and leaders</Text></View></View>
    {(props.sitename) ? <View><Text style={{fontSize:20}}>{props.sitename}</Text></View> : null}
    {(props.name) ? <View><Text>Logged in as {props.name}</Text></View> : null}
    {(props.title) ? <View><Text>{props.title}</Text></View> : null}
    </View>
)
}