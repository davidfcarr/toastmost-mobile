import { Text, View, ScrollView, TextInput, Pressable, Image, AppState, Switch, FlatList } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useState, useContext, useEffect } from "react";
import { Octicons } from '@expo/vector-icons'
import EditRole from '../EditRole';
import RenderRole from '../RenderRole';
/* import QRScanner from "./QRScanner"; */
import styles from '../styles'
import { useWindowDimensions } from 'react-native';
import BrandHeader from '../BrandHeader';
import useAgenda from '../useAgenda';
import Settings from './Settings';

export default function Home (props) {
    const [edit,setEdit] = useState(false);
    const {club, meeting, setMeeting,queryData, message, updateRole,getAgenda} = useAgenda();
    const agenda = getAgenda();
    const toggleSwitch = () => setEdit(previousState => !previousState);

    console.log('Home club',club);
    console.log('Home agenda',agenda);

    if(!club.code)  {
      return <Settings />;
    }

    if(!club || !agenda || !agenda.domain || agenda.domain != club.domain || !agenda.roles.length) {
      return <SafeAreaView><View><BrandHeader /><Text>Loading ...</Text></View></SafeAreaView>;
    }
    console.log('agenda domain',agenda.domain);
    console.log('club domain',club.domain);
    
      return (
        <SafeAreaView  style={styles.container}>
        <View style={{width: '100%', flex:1 }}>
        <BrandHeader />
        <Text>{club.domain}</Text>
  
        {message ? <View ><Text style={{'backgroundColor':'black','color':'white',padding: 10, margin:5}}>{message}</Text></View> : null}
        {club.url && (!agenda.roles || !agenda.roles.length) ? <View ><Text style={{'backgroundColor':'black','color':'white',padding: 10, margin:5}}>Loading agenda. If this takes more than a few seconds, check the club access code.</Text></View> : null}
  
        <View style={{flexDirection: 'row',paddingLeft: 10}}>
        {club.domain && agenda ? <Text>{agenda && agenda.title}</Text> : null}
        {queryData && queryData.agendas && queryData.agendas.length ? (
        <Pressable onPress={() => { setMeeting( (prev) => { prev++; if(queryData && queryData.agendas && (prev < queryData.agendas.length - 1 )) return prev; else return 0; } ) }} style={{ marginLeft: 10 }}>
        <Octicons name="arrow-right" size={24} color="black" selectable={undefined} style={{ width: 24 }} />
        </Pressable>
        ) : null}
        </View>
   <View style={{flexDirection: 'row',padding: 5}}>
        <Switch
          trackColor={{false: '#767577', true: '#81b0ff'}}
          thumbColor={edit ? '#f5dd4b' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleSwitch}
          value={edit}
        /><Text>Edit</Text>
        </View>
        {(club.domain && agenda.roles.length > 0) ? 
        <View style={{width: '100%', flex: 1 }}>
        {edit ? null : <Text style={{fontStyle:'italic', padding: 5}}>Click the + to take a role, - to withdraw</Text>}
        <FlatList
        data={agenda.roles}
        renderItem={({item,itemindex}) => {
          if(edit)
            return <EditRole key={item.assignment_key} item={{...item,'projects':queryData.projects,'index':itemindex}} updateRole={updateRole} user_id={queryData.user_id} name={queryData.name} style={styles} members={queryData.members} />
          else
            return <RenderRole key={item.assignment_key} item={{...item,'projects':queryData.projects,'index':itemindex}} updateRole={updateRole} user_id={queryData.user_id} name={queryData.name} style={styles} />
        }}
        keyExtractor={item => item.assignment_key}
        />
        </View>
   : null
  }
        </View>
        </SafeAreaView> 
      )
}
  