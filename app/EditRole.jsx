import { Text, View, ScrollView, TextInput, Pressable, Image, AppState, Switch } from "react-native";
import { useState, useEffect } from "react";
import ProjectChooser from './ProjectChooser';
import SelectDropdown from 'react-native-select-dropdown'
import styles from './styles'
import { Octicons } from '@expo/vector-icons'
import TranslatedText from './TranslatedText'; /* <TranslatedText term="" /> */

export default function EditRole ({ item, updateRole, members, queryData, setEdit }) {

const [guestBlank, setGuestBlank] = useState(false);
const [guestName, setGuestName] = useState('');
const targetMember = members.find(member => member.ID == item.ID);
if(targetMember) {
    item.name = targetMember.name;
}
const memberlist = [{ID:'',name:'Choose member or "guest"'},{ID:'guest',name:'Guest (enter name)'},...members];
if(item.name.includes('(guest)')) {
  memberlist.push({'ID':item.ID,'name':item.name});
}
const defaultValue = (item.ID) ? {'ID':(isNaN(item.ID)) ? item.ID : parseInt(item.ID),'name':item.name} : memberlist[0];

return (<View>
    <TranslatedText term={item.role} />
  <View>
    <SelectDropdown
        data={memberlist}
        defaultValue={defaultValue}
        onSelect={(selectedItem, index) => {
            if(selectedItem.ID == 'guest') {
                setGuestBlank(true);
            } else {
            const newitem = {...item}; newitem.ID = selectedItem.ID; newitem.name = selectedItem.name; updateRole(newitem);
            }
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
          return (
            <View key={index} style={{...styles.dropdownItemStyle, ...(isSelected && {backgroundColor: '#D2D9DF'})}}>
              <Text style={styles.dropdownItemTxtStyle}>{dropitem.name}</Text>
            </View>
          );
        }}
        showsVerticalScrollIndicator={false}
        dropdownStyle={styles.dropdownMenuStyle}
      />
      </View>
   {guestBlank ? <View style={{flexDirection:'row'}}><TextInput style={styles.input} placeholder="Enter name" onChangeText={(text) => { setGuestName(text); }}/><Pressable onPress={() => {const newitem = {...item}; newitem.ID = guestName; newitem.name = guestName; console.log('newitem',newitem); updateRole(newitem); memberlist.push({'ID':newitem,'name':newitem+' (guest)'}); setGuestBlank(false);}} style={styles.addButton}><Text style={styles.addButtonText}>Add</Text></Pressable></View> : <Text></Text>}
   {'Speaker' == item.role ? <ProjectChooser item={item} updateRole={updateRole} styles={styles} {...queryData} setEdit={setEdit} /> : null}
    </View>
    )
}