import React from 'react';
import { Text, View, ScrollView, TextInput, Pressable} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
/* import QRScanner from "./QRScanner"; */
import styles from '../styles'
import RenderHtml from 'react-native-render-html';
import * as Linking from 'expo-linking';
import { useWindowDimensions } from 'react-native';
import { Platform } from 'react-native';
import { ClubContext } from '../ClubContext';
import { router } from 'expo-router';
import BrandHeader from '../BrandHeader';
import useAgenda from '../useAgenda';

export default function Settings (props) {
  const {club, setClub,setMeeting,setAgenda, pollingInterval,clubs, setClubs, queryData, setQueryData, toastmostData, message, setMessage, addClub, sendEmail, setReset} = useAgenda();
  const [emailPrompt,setEmailPrompt] = useState(false);
    const [tempClub,setTempClub] = useState(!club || !club.domain ? {domain:'demo.toastmost.org',code:'',url:''} : {domain:'',code:'',url:''});
    const { width, height } = useWindowDimensions();

    function resetClubData() {
      setQueryData({});
      setMeeting(0);
      setQueryData({...queryData,agendas:[]});
      setAgenda({roles:[]});
      router.replace('/');
      if(pollingInterval) {
        console.log('cleared pollingInterval',pollingInterval);
        clearInterval(pollingInterval);
      }
      }
    
    console.log('clubs',clubs);
    console.log('club',clubs);
    
    function diffClubs () {
      if(!queryData || !queryData.userblogs)
        return [];
      let diff = [... queryData.userblogs];
      let index;
      clubs.forEach(
        (club) => {
          index = diff.indexOf(club.domain);
          diff[index] = null;
        }
      );
      return diff.filter(Boolean);
    }
  
    function addDomainSame(domain) {
      const newclubs = [...clubs];
      const newclub = {'domain':domain,'code':queryData.code,'url':'https://'+domain+'/wp-json/rsvptm/v1/mobile/'+queryData.code};
      newclubs.push(newclub);
      setClubs(newclubs);
      setClub(newclub);
      //setScreen('home');
      setQueryData({});
    }
  
    function addAllClubs() {
      const newclubs = [...clubs];
      const diffclubs = diffClubs();
      diffclubs.forEach(
        (domain) => {
          newclubs.push({'domain':domain,'code':queryData.code,'url':'https://'+domain+'/wp-json/rsvptm/v1/mobile/'+queryData.code});
        }
      );
      setClubs(newclubs);
    }
/*         {toastmostData && toastmostData.androidUpdatePrompt && ('android' == Platform.OS) ? <View style={{marginLeft:5,marginRight: 5, padding: 5, borderWidth:1,borderColor:'red'}}><RenderHtml source={{'html':toastmostData.androidUpdatePrompt}} contentWidth={width - 10} /></View> : null}

*/
    
      const different = diffClubs();
      console.log('different',different);

      return (
        <SafeAreaView  style={styles.container}>
        <View style={{width: '100%', flex: 1 }}>
        {!props.hideHeader ? <BrandHeader /> : null}
        <View>
          <View>
          <TextInput
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="Domain or domain|code"
            placeholderTextColor="gray"
            value={tempClub.domain}
            onChangeText={(input) => {
              console.log('domain input',input);
              if(input.includes('|')) {
                const parts = input.split('|');
                setTempClub({domain:parts[0],code:parts[1],url:''});
              }
              else {
                setTempClub({...tempClub,domain:input})
              }}
            }
          />
          </View>
<View>
    <TextInput
      style={styles.input}
      autoCapitalize="none"
      autoCorrect={false}
      maxLength={30}
      placeholder="Code or email"
      placeholderTextColor="gray"
      value={tempClub.code}
      onChangeText={(input) => {if(input.includes('@')) {setEmailPrompt(true); setTempClub({...tempClub,code:input})} else setTempClub({...tempClub,code:input})}  }
    />
    </View>
<View>
          <Pressable onPress={() => {if(emailPrompt) {sendEmail({...tempClub,email:tempClub.code}); setTempClub({domain:'',code:''}); setEmailPrompt(false); } else {addClub(tempClub);resetClubData();} }} style={styles.addButton}>
            <Text style={styles.addButtonText}>{emailPrompt ? <Text>Request by Email</Text> : <Text>Add</Text>}</Text>
          </Pressable>
          </View>
          {message ? <View ><Text style={{'backgroundColor':'black','color':'white',padding: 10, margin:5}}>{message}</Text></View> : null}
          <Text style={styles.instructions}>If you have copied a domain|code string, paste it in the first field above. To get instructions emailed to you, enter your club website domain into the first blank and your email address in the second.</Text><Text style={styles.instructions}><Text style={{fontWeight: 'bold'}}>Demo Accounts:</Text> If you do not have a Toastmost account, enter demo.toastmost.org in the first blank and your email address in the second to have a demo account created for you.</Text>
          </View>
  
        {club.url && (!queryData || !queryData.agendas || !queryData.agendas.length) ? <View ><Text style={{'backgroundColor':'black','color':'white',padding: 10, margin:5}}>Loading agenda. If this takes more than a few seconds, check the club access code.</Text></View> : null}
        <View style={{flex:1}}>
        <ScrollView>
        {(clubs.length > 0) ? clubs.map(
          (clubChoice, index) => {
            return (
              <View style={{flexDirection: 'row'}} key={index}>
                <Pressable key={'remove'+index} onPress={() => { setClubs(() => {let current = [...clubs]; current.splice(index, 1); setClub({}); return current;} ); } } style={[styles.chooseButton,{'backgroundColor': 'red','width':25}]}>
                  <Text style={styles.addButtonText}>-</Text>
                </Pressable>
                <Pressable key={'choose'+index} onPress={() => {console.log('setClub',clubChoice); setClub(clubChoice); setMessage('Reloading ...'); resetClubData(); } } style={styles.chooseButton}>
                  <Text style={styles.addButtonText}>Choose {clubChoice.domain}</Text>
                </Pressable>
              </View>
            )
          }
        )
        : null}
        {(clubs.length > 0) ?
        <Pressable onPress={() => {setClub({domain:'',code:'',url:''}); setReset(true); setClubs([]); resetClubData(); setQueryData({}); } } style={styles.chooseButton}>
        <Text style={styles.addButtonText}>Reset Clubs List</Text>
        </Pressable>
         : null}
  
        {(queryData && different.length) ? different.map(
          (domain, index) => {
            return (
              <View style={{flexDirection: 'row'}} key={'different'+index}>
                <Pressable key={'choose'+index} onPress={() => {addDomainSame(domain); resetClubData()} } style={styles.chooseButton}>
                  <Text style={styles.addButtonText}>Add {domain}</Text>
                </Pressable>
              </View>
            )
          }) : null
        }  
      {(toastmostData && toastmostData.infoScreen) ? <View style={{marginLeft: 5}}><RenderHtml source={{'html':'<html><body>'+toastmostData.infoScreen+'</body></html>'}} contentWidth={width - 20} /></View> : null}
        </ScrollView>
        </View>
        </View>
        </SafeAreaView> 
      )
}
