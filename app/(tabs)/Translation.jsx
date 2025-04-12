import { Text, View, ScrollView, TextInput, Pressable, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect} from "react";
import { Octicons } from '@expo/vector-icons'
//import Autocomplete from 'react-native-autocomplete-input';
import SelectDropdown from 'react-native-select-dropdown'
import BrandHeader from '../BrandHeader';
import useClubMeetingStore from '../store';
import TranslatedText from '../TranslatedText'; /* <TranslatedText term="" /> */
import styles from '../styles'
import { useWindowDimensions } from 'react-native';
import useAgenda from '../useAgenda';

export function ErrorBoundary({ error, retry }) {
  return (
  <SafeAreaView>
    <View>
    <Text style={{color:'red'}}>{error.message}</Text>
    <Pressable onPress={retry} style={{backgroundColor:'black',padding: 10, borderRadius: 5, margin: 10}}><Text style={{color:'white'}}>Try Again?</Text></Pressable>
    <Text>Try navigating to the <Link href="/Settings"  style={{textDecorationLine: 'underline'}}>Settings</Link> screen.</Text>
    </View>
</SafeAreaView>
  );
}

export default function Translation (props) {
    const { width, height } = useWindowDimensions();
    const {clubs, language, setLanguage, logMissedTranslation, setLogMissedTranslation, setMessage, queryData} = useClubMeetingStore();
    const languageChoices = [{code:'',label:'Not set'},{code:'en_EN',label:'English'},{code:'fr_FR',label:'French'},{code:'es_ES',label:'Spanish'}];
    const [suggestions, setSuggestions] = useState({});
    const {saveLanguage, suggestTranslations} = useAgenda();

    if (!clubs || !clubs.length) {
        return (
          <SafeAreaView style={{ flex: 1 }}>
            <View>
              <BrandHeader />
              <TranslatedText term="Please connect to a Toastmost (or compatible) club website." />
            </View>
          </SafeAreaView>
        );
      }
          return (
        <SafeAreaView  style={styles.container}>    
              <BrandHeader page="Translation" />
              <View style={{flexDirection: 'row'}}>
              <Text style={styles.h2}><TranslatedText term="Language Preference" /> (<TranslatedText term="beta" />)</Text>
              </View>
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
                <View style={{marginBottom: 15}}>
              
              </View>
              {queryData.missedTranslation && queryData.missedTranslation.length ? <Text><TranslatedText style={styles.h2} term="Words and Phrases Not Translated" />: {queryData.missedTranslation.length}</Text> : null}
        <ScrollView style={{margin:10}}>

              {language && language != 'en_EN' && queryData.missedTranslation && Array.isArray(queryData.missedTranslation) ? queryData.missedTranslation.map(
                (miss) => {
                    if(!miss || !isNaN(miss))
                        return null;
                    return (
                        <View>
                            <Text>{miss}</Text>
                            <TextInput style={styles.input} value={suggestions[miss] ? suggestions[miss] : ''} onChangeText={(input) => { const up = {...suggestions}; up[miss] = input; setSuggestions(up); }} />
                            </View>
                    )
                })
            : null}
              </ScrollView>
              {queryData.missedTranslation && queryData.missedTranslation.length ? 
              <View style={{margin:10, flexDirection: 'row'}} >
              <Pressable style={[styles.blueButton,{width: 100}]} onPress={() => {suggestTranslations(suggestions)}}><TranslatedText style={styles.yellowText} term="Save" /></Pressable>
              <Switch
                        trackColor={{false: '#767577', true: '#81b0ff'}}
                        thumbColor={logMissedTranslation ? '#f5dd4b' : '#f4f3f4'}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={() => {
                          const newlog = !logMissedTranslation;
                          setLogMissedTranslation(newlog);
                        }}
                        value={logMissedTranslation}
                      /><TranslatedText term="Log missed translations" style={{marginLeft: 10}} />
              </View> : null}
              
        </SafeAreaView>
    )
} 
