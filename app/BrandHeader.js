import { Text, View, ScrollView, TextInput, Pressable, Image, AppState, Switch, FlatList } from "react-native";
export default function BrandHeader() {
return (
    <View style={{flexDirection: 'row'}}><Image style={{width:100,height:100}} source={require('../assets/images/ToastmostMobileLogo.png')} /><View style={{width:'100%',paddingLeft:10,alignContent:'center',justifyContent:'center',backgroundColor:'black'}}><Text style={{fontSize:30,color:'white',fontWeight:'bold'}}>Toastmost.org</Text><Text style={{fontSize:14,fontStyle:'italic',color:'white',fontWeight:'bold'}}>Digital tools for speakers and leaders</Text></View></View>
)
}