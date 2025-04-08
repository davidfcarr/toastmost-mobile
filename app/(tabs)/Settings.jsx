import React from 'react';
import { Text, View, ScrollView, TextInput, Pressable} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
/* import QRScanner from "./QRScanner"; */
import styles from '../styles'
import * as Linking from 'expo-linking';
import useAgenda from '../useAgenda';
import useClubMeetingStore from '../store';
import { router } from 'expo-router';
import BrandHeader from '../BrandHeader';
import Promo from '../Promo';
import SelectDropdown from 'react-native-select-dropdown'
import { Octicons } from '@expo/vector-icons'
import TranslatedText from '../TranslatedText'; /* <TranslatedText term="" /> */

export function ErrorBoundary({ error, retry }) {
  return (
    <SafeAreaView>
    <View>
    <Text style={{color:'red'}}>{error.message}</Text>
    <Pressable onPress={retry} style={{backgroundColor:'black',padding: 10, borderRadius: 5, margin: 10}}><Text style={{color:'white'}}>Try Again?</Text></Pressable>
      <Text>Try navigating to the <Link href="/" style={{textDecorationLine: 'underline'}}>Home</Link> screen.</Text>
  </View>
</SafeAreaView>
  );
}

export default function Settings (props) {
    const [emailPrompt,setEmailPrompt] = useState(false);
    const {toastmostData, sendEmail, setReset, saveLanguage, initAgendaPolling} = useAgenda();
    const url = Linking.useURL();
    const {setAgenda, queryData, setQueryData,clubs, setClubs, setDefaultClub, addClub, meeting, setMeeting, message, setMessage, language} = useClubMeetingStore();
    const [tempClub,setTempClub] = useState(!clubs || !clubs.length ? {domain:'demo.toastmost.org',code:'',url:''} : {domain:'',code:'',url:''});

    function addFromUrl() {
      if (url) {
        const { hostname, path, queryParams } = Linking.parse(url);
        if(queryParams.code && queryParams.domain) {
          if(clubs.length) {
            const match = clubs.find((item) => item.domain == queryParams.domain);
            if(match)
              return;
          }
          addClub({domain:queryParams.domain,code:queryParams.code,url:makeUrl(queryParams.domain,queryParams.code)});
          resetClubData({domain:queryParams.domain,code:queryParams.code,url:makeUrl(queryParams.domain,queryParams.code)});
        }
        console.log(
          `Linked to app with hostname: ${hostname}, path: ${path} and data: ${JSON.stringify(
            queryParams
          )}`
        );
      }  
    }

    useEffect(() => {
      addFromUrl();
    },
    [])

    useEffect(() => {
      addFromUrl();
    },
    [url])

    function resetClubData(newclub = null) {
      /*
      setQueryData({});
      setMeeting(0);
      setQueryData({...queryData,agendas:[]});
      setAgenda({roles:[]});
      */
      initAgendaPolling(newclub);      
      if(clubs.length)
        router.replace('/');
    }
        
    function diffClubs () {
      if(!queryData || !queryData.userblogs || !clubs || !clubs.length) return [];
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
  
    function makeUrl(domain,code) {
      return 'https://'+domain+'/wp-json/rsvptm/v1/mobile/'+code;
    }

    function addDomainSame(domain) {
      const newclubs = [...clubs];
      const newclub = {'domain':domain,'code':queryData.code,'url':'https://'+domain+'/wp-json/rsvptm/v1/mobile/'+queryData.code};
      newclubs.unshift(newclub);
      setClubs(newclubs);
      //setScreen('home');
      setQueryData({});
    }
      
      const different = diffClubs();

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
            placeholder={queryData.translations && queryData.translations["Domain or domain|code"] ? queryData.translations["Domain or domain|code"] : "Domain or domain|code"}
            placeholderTextColor="gray"
            value={tempClub.domain}
            onChangeText={(input) => {
              if(input.includes('://'))
                input = input.replace(/http[s]{0,1}:\/\//,'');
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
      placeholder={queryData.translations && queryData.translations["Code or email"] ? queryData.translations["Code or email"] : "Code or email"}
      placeholderTextColor="gray"
      value={tempClub.code}
      onChangeText={(input) => {if(input.includes('@')) {setEmailPrompt(true); setTempClub({...tempClub,code:input})} else setTempClub({...tempClub,code:input})}  }
    />
    </View>
<View>
          <Pressable onPress={() => {if(emailPrompt) {sendEmail({...tempClub,email:tempClub.code}); setTempClub({domain:'',code:''}); setEmailPrompt(false); } else { const newclub = {...tempClub,url:makeUrl(tempClub.domain,tempClub.code)}; addClub(newclub);setTempClub({domain:'',code:''});resetClubData(newclub);} }} style={styles.addButton}>
            <Text style={styles.addButtonText}>{emailPrompt ? <TranslatedText term="Request by Email" /> : <TranslatedText term="Add" />}</Text>
          </Pressable>
          </View>
          </View>
          <View style={{flex:1}}>
        <ScrollView>
          {!clubs || !clubs.length ? 
          <View>
         <TranslatedText style={styles.instructions} term="To you have an account on a Toastmost club website (or one that uses the compatible WordPress software), enter the web domain in the first blank. Or you may use demo.toastmost.org for testing. The app does not work with Free Toast Host (toastmastersclubs.org) websites." />
          <TranslatedText style={styles.instructions} term="Enter your email address into the second field and click Request by Email. You will be emailed instructions with a link you can click to authorize the app to access the club agenda." />
          <TranslatedText style={styles.instructions} term="Alternate process: If you have a domain|code string, paste it in the first field above. Then click Add." />
          <TranslatedText style={styles.instructions} term="You can add multiple clubs and switch between them." />
          </View>
          : null}
  
        {clubs.length && (!queryData || !queryData.agendas || !queryData.agendas.length) ? <View ><Text style={{'backgroundColor':'black','color':'white',padding: 10, margin:5}}>Loading agenda. If this takes more than a few seconds, check the club access code.</Text></View> : null}
        {(clubs.length > 0) ? clubs.map(
          (clubChoice, index) => {
            return (
              <View style={{flexDirection: 'row'}} key={index}>
                <Pressable key={'remove'+index} onPress={() => { let current = [...clubs]; current.splice(index, 1); setClubs(current); } } style={[styles.chooseButton,{'backgroundColor': 'red','width':25}]}>
                  <Text style={styles.addButtonText}>-</Text>
                </Pressable>
                <Pressable key={'choose'+index} onPress={() => {const newclubs = [...clubs]; newclubs.splice(index,1); newclubs.unshift(clubChoice); setClubs(newclubs); setMessage('Reloading ...'); resetClubData(newclubs[0]); } } style={styles.chooseButton}>
                  <Text style={styles.addButtonText}><TranslatedText term="Choose" /> {clubChoice.domain}</Text>
                </Pressable>
              </View>
            )
          }
        )
        : null}
        {(clubs.length > 0) ?
        <Pressable onPress={() => {setReset(true); setClubs([]); resetClubData(); setQueryData({}); } } style={styles.chooseButton}>
        <TranslatedText style={styles.addButtonText} term="Reset Clubs List" />
        </Pressable>
         : null}
  
        {(queryData && different.length) ? different.map(
          (domain, index) => {
            return (
              <View style={{flexDirection: 'row'}} key={'different'+index}>
                <Pressable key={'choose'+index} onPress={() => {addDomainSame(domain); } } style={styles.chooseButton}>
                  <Text style={styles.addButtonText}><TranslatedText props="Add" /> {domain}</Text>
                </Pressable>
              </View>
            )
          }) : null
        }  
        <Promo />
        </ScrollView>
        </View>
        </View>
        </SafeAreaView> 
      )
}
