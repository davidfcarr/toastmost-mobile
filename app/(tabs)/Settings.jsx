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
    <SafeAreaView><BrandHeader {...queryData} />
    <View>
    <Text style={{color:'red'}}>{error.message}</Text>
    <Pressable onPress={retry} style={{backgroundColor:'black',padding: 10, borderRadius: 5, margin: 10}}><Text style={{color:'white'}}>Try Again?</Text></Pressable>
  </View>
</SafeAreaView>
  );
}

export default function Settings (props) {
    const [emailPrompt,setEmailPrompt] = useState(false);
    const {toastmostData, sendEmail, setReset, saveLanguage} = useAgenda();
    const url = Linking.useURL();
    const {setAgenda, queryData, setQueryData,clubs, setClubs, setDefaultClub, addClub, meeting, setMeeting, message, setMessage, language} = useClubMeetingStore();
    const [tempClub,setTempClub] = useState(!clubs || !clubs.length ? {domain:'demo.toastmost.org',code:'',url:''} : {domain:'',code:'',url:''});

    const languageChoices = [{code:'',label:'Not set'},{code:'en_EN',label:'English'},{code:'fr_FR',label:'French'},{code:'es_ES',label:'Spanish'}];

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
          resetClubData();
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

    function resetClubData() {
      setQueryData({});
      setMeeting(0);
      setQueryData({...queryData,agendas:[]});
      setAgenda({roles:[]});
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
          <Pressable onPress={() => {if(emailPrompt) {sendEmail({...tempClub,email:tempClub.code}); setTempClub({domain:'',code:''}); setEmailPrompt(false); } else { const newclub = {...tempClub,url:makeUrl(tempClub.domain,tempClub.code)}; addClub(newclub);setTempClub({domain:'',code:''});resetClubData();} }} style={styles.addButton}>
            <Text style={styles.addButtonText}>{emailPrompt ? <TranslatedText term="Request by Email" /> : <TranslatedText term="Add" />}</Text>
          </Pressable>
          </View>
          </View>
          <View style={{flex:1}}>
        <ScrollView>
          <TranslatedText style={styles.instructions} term="If you have copied a domain|code string, paste it in the first field above. To get instructions emailed to you, enter your club website domain into the first blank and your email address in the second." /><Text style={styles.instructions} ><TranslatedText style={{fontWeight: 'bold'}} term="Demo Accounts:" /><TranslatedText term="If you do not have a Toastmost account, enter demo.toastmost.org in the first blank and your email address in the second to have a demo account created for you." /></Text>
  
        {clubs.length && (!queryData || !queryData.agendas || !queryData.agendas.length) ? <View ><Text style={{'backgroundColor':'black','color':'white',padding: 10, margin:5}}>Loading agenda. If this takes more than a few seconds, check the club access code.</Text></View> : null}
        {(clubs.length > 0) ? clubs.map(
          (clubChoice, index) => {
            return (
              <View style={{flexDirection: 'row'}} key={index}>
                <Pressable key={'remove'+index} onPress={() => { let current = [...clubs]; current.splice(index, 1); setClubs(current); } } style={[styles.chooseButton,{'backgroundColor': 'red','width':25}]}>
                  <Text style={styles.addButtonText}>-</Text>
                </Pressable>
                <Pressable key={'choose'+index} onPress={() => {const newclubs = [...clubs]; newclubs.splice(index,1); newclubs.unshift(clubChoice); setClubs(newclubs); setMessage('Reloading ...'); resetClubData(); } } style={styles.chooseButton}>
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
                <Pressable key={'choose'+index} onPress={() => {addDomainSame(domain); resetClubData()} } style={styles.chooseButton}>
                  <Text style={styles.addButtonText}><TranslatedText props="Add" /> {domain}</Text>
                </Pressable>
              </View>
            )
          }) : null
        }  
<Text style={styles.h2}>Language Preference (beta)</Text>
<SelectDropdown
        data={languageChoices}
        defaultValue={languageChoices.find((item) => item.code == language)}
        onSelect={(selectedItem, index) => {
          saveLanguage(selectedItem.code);
          console.log('attempting to set Language to '+selectedItem.code);
          setMessage('Setting language to '+selectedItem.label);
        }}
        renderButton={(selectedItem, isOpened) => {
          return (
            <View style={styles.dropdownButtonStyle}>
              <Octicons name="chevron-down" size={24} color='black' selectable={undefined} style={{ width: 24 }} />
              <Text style={styles.dropdownButtonTxtStyle}>
                {selectedItem && selectedItem.label}
              </Text>
            </View>
          );
        }}
        renderItem={(item, index, isSelected) => {
          return (
            <View key={index} style={{...styles.dropdownItemStyle, ...(isSelected && {backgroundColor: '#D2D9DF'})}}>
              <Text style={styles.dropdownItemTxtStyle}>{item.label}</Text>
            </View>
          );
        }}
        showsVerticalScrollIndicator={false}
        dropdownStyle={styles.dropdownMenuStyle}
      />
<TranslatedText term="Initial support includes French translation of role names; planned support for button names." />
        <Promo />
        </ScrollView>
        </View>
        </View>
        </SafeAreaView> 
      )
}
