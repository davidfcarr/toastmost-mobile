import { Text, View, ScrollView, TextInput, Pressable, Image, AppState, Switch } from "react-native";
import { useState, useEffect } from "react";
import ProjectChooser from './ProjectChooser';
import SelectDropdown from 'react-native-select-dropdown'
import styles from './styles'
import { Octicons } from '@expo/vector-icons'
import useAgenda from "./useAgenda";
import useClubMeetingStore from "./store";

export default function SuggestRole ({ item, members, queryData, setSuggest }) {
const {askForData} = useAgenda();
const [member,setMember] = useState({});
const [history,setHistory] = useState({});
const [note,setNote] = useState('I am nominating you for '+item.role+'!');
const {clubs,setMessage} = useClubMeetingStore();

useEffect(() => {

        let queryString = '?ask=role_status&role='+item.role;
        fetch(clubs[0].url+queryString).then((res) => {
          if(res.ok) {
            setMessage('');
            return res.json();
          }
          else {
            console.log('getToastData fetch not ok',res);
            if('401' == res.status)
            setMessage('Problem connecting to server. Check access code.');
            else
            setMessage('Problem connecting, status code: '+res.status);
    
            if(pollingInterval)
              clearInterval(pollingInterval);  
          }
        }).then((data) => {
          //ask data returned
          console.log('askForData data',data);
          setHistory(data.memberstatus);
        }).catch(
          (error) => {
            console.log('fetch error',error);
            setMessage('Unable to connect. Possibly a network error or typo in domain name '+clubs[0].domain+'.');
          }
        )
    
    }
,[]);

const memberlist = [{ID:'',name:'Choose member'},...members];
const defaultValue = {ID:'',name:'Choose member'};

function sendSuggestion(payload) {
    fetch(clubs[0].url, {method: 'POST', body: JSON.stringify(payload)}).then((res) => res.json()).then((data) => {
        setMessage('Successfully sent message');
        console.log('results of role update',data);
      }).catch((e) => {
        console.log('update error',e);
        setMessage('Data update error');
      })  
}

return (<View>
    <Text>Suggest Role: {item.role}</Text>
  <View>
    <SelectDropdown
        data={memberlist}
        defaultValue={defaultValue}
        onSelect={(selectedItem, index) => {
            const newitem = {...item}; newitem.ID = selectedItem.ID; newitem.name = selectedItem.name; setMember(newitem);
        }}
        renderButton={(selectedItem, isOpened) => {
          return (
            <View style={styles.dropdownButtonStyle}>
              <Octicons name="chevron-down" size={24} color='black' selectable={undefined} style={{ width: 24 }} />
              <Text style={styles.dropdownButtonTxtStyle}>
                {selectedItem ? selectedItem.name : ''}
              </Text>
            </View>
          );
        }}
        renderItem={(dropitem, index, isSelected) => {
        console.log('dropitem',dropitem);
          return (
            <View key={index} style={{...styles.dropdownItemStyle, ...(isSelected && {backgroundColor: '#D2D9DF'})}}>
              <Text style={styles.dropdownItemTxtStyle}>{dropitem.name}{dropitem && dropitem.ID && history[dropitem.ID] ? ' ('+history[dropitem.ID]+')' : ''}</Text>
            </View>
          );
        }}
        showsVerticalScrollIndicator={false}
        dropdownStyle={styles.dropdownMenuStyle}
      />
      </View>
   <TextInput value={note} multiline={true} numberOfLines = {10} 
    style={{ 
        borderColor: 'gray',
        borderWidth: 1,
        height: 100,
        textAlignVertical: 'top',
        padding: 10
    }} placeholder="Note" onChangeText={(text) => { setNote(text); }}/>
    <Pressable onPress={() => {const payload = {...member}; payload.suggest_note = note; payload.suggest = payload.ID; delete payload.ID; console.log('suggest payload',payload); sendSuggestion(payload); }} style={styles.addButton}><Text style={styles.addButtonText}>Send</Text></Pressable>
    <Text>Use this function to recommend that another member take the selected role.</Text>
    </View>);
}