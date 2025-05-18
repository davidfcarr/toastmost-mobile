import { Text, View, ScrollView, TextInput, Pressable, Image, AppState, Switch } from "react-native";
import { useState, useEffect } from "react";
import ProjectChooser from './ProjectChooser';
import SelectDropdown from 'react-native-select-dropdown'
import styles from './styles'
import { Octicons } from '@expo/vector-icons'
import useAgenda from "./useAgenda";
import useClubMeetingStore from "./store";
import TranslatedText, {translateTerm} from './TranslatedText'; /* <TranslatedText term="" /> */

export default function EditableNote ({ item, post_id }) {
    const [note,setNote] = useState(item.content);
    const {clubs,setMessage,setQueryData} = useClubMeetingStore();

function sendNoteUpdate(payload) {
    fetch(clubs[0].url, {method: 'POST', body: JSON.stringify(payload)}).then((res) => res.json()).then((data) => {
        setMessage('Updated note');
        console.log('results of note update update',data);
        setQueryData(data);
      }).catch((e) => {
        console.log('update error',e);
        setMessage('Data update error');
      })  
}
if(!item || !item.headline)
  return <Text>Error loading item to edit</Text>

return (<View>
    <Text style={styles.h2}>{item.headline}</Text>
   <TextInput value={note} multiline={true} numberOfLines = {10} 
    style={{ 
        borderColor: 'gray',
        borderWidth: 1,
        height: 100,
        textAlignVertical: 'top',
        padding: 10
    }} onChangeText={(text) => { setNote(text); }} />
    <Pressable onPress={() => {sendNoteUpdate({note_update:note,note_update_key:item.key,post_id}) }} style={styles.addButton}><TranslatedText style={styles.addButtonText} term="Update" /></Pressable>
    </View>);
}