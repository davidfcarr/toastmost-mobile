import { Text, View, ScrollView, TextInput, Pressable, Dimensions, StyleSheet, FlatList, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { Inter_500Medium, useFonts } from "@expo-google-fonts/inter";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Octicons } from '@expo/vector-icons'
import ProjectChooser from './ProjectChooser';
import styles from './styles'
import RenderHtml from 'react-native-render-html';

export default function Index() {
  return (
    <MobileAgenda />
  );
}

const RenderRole = ({ item, index, updateRole, user_id, name }) => {
  const styles = {
    addButton: {
    backgroundColor: 'blue',
    borderRadius: 5,
    padding: 5,
  },
  addButtonText: {
    fontSize: 15,
    color: 'white',
    width: 18,
    textAlign: 'center',
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
    padding: 5,
    width: '100%',
    maxWidth: 1024,
    marginHorizontal: 'auto',
    pointerEvents: 'auto',
  },
  todoText: {
    flex: 1,
    fontSize: 18,
    fontFamily: 'Inter_500Medium',
  },
};

  return (
    <View key={item.assignment_key}>
    <View style={{flexDirection: 'row',marginTop: 5}}>
        {(item.ID == 0) ? <Pressable style={styles.addButton} onPress={() => { const newitem = {...item}; newitem.ID = user_id; newitem.name = name; updateRole(newitem); }}><Text  style={styles.addButtonText}>+</Text></Pressable> : null}
        {(item.ID == user_id) ? <Pressable style={[styles.addButton,{backgroundColor:'red'}]} onPress={() => { const newitem = {...item}; newitem.ID = 0; newitem.name=''; updateRole(newitem);  }}><Text  style={styles.addButtonText}>-</Text></Pressable>: null}
        <Text style={{marginLeft: ((item.ID != 0) && (item.ID != user_id)) ? 33: 5}}> 
          {item.role} {item.name} 
        </Text>
    </View>
        {(item.ID == user_id && 'Speaker' == item.role) ? <View>
        <ProjectChooser {...item} updateRole={updateRole} styles={styles} />
 </View> : null}
      </View>
      )
} 

function MobileAgenda (props) {
  const [meeting, setMeeting] = useState(0)
  const [clubs, setClubs] = useState([])
  const [club, setClub] = useState({'domain':'','code':'','url':''})
  const [showSettings, setShowSettings] = useState(false)
  const [viewAgenda, setViewAgenda] = useState(false)
  const [queryData, setQueryData] = useState({})
  const [message,setMessage] = useState('');

  const [loaded, error] = useFonts({
    Inter_500Medium,
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem("clubslist")
        const storageClubs = jsonValue != null ? JSON.parse(jsonValue) : null
        if (storageClubs && storageClubs.length) {
          setClubs(storageClubs)
          setClub(storageClubs[0])
        }
      } catch (e) {
        console.error(e)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    if(!clubs.length) {
      return;
    }
    const storeData = async () => {
      try {
        const jsonValue = JSON.stringify(clubs)
        await AsyncStorage.setItem("clubslist", jsonValue)
      } catch (e) {
        console.error(e)
      }
    }
    storeData()
  }, [clubs])

  useEffect(() => {
      if(club.domain && club.code && club.url) {
        fetch(club.url).then((res) => res.json()).then((data) => {
          ('data for '+club.url,data);
          setQueryData(data);
        })
      }
    }, [club]
  )

    function itemUpdateMatch(i,v) {
      if((i.post_id == v.post_id) && (i.assignment_key == v.key)) {
        return (v.ID == 0) ? 'remove' : 'add';
      }
      return false;
    }

    if (!loaded && !error) {
    return null
  }

  const addClub = () => {
      setClubs([club, ...clubs]);
      setClub({'domain':'','code':'','url':''});
  }

  function updateClub (input, name) {
    const update = {...club};
    update[name] = input;
    update.url = 'https://'+update.domain+'/wp-json/rsvptm/v1/mobile/'+update.code;
    setClub(update);
  }

  function updateRole(roleData) {
    const currentData = {...queryData};
    currentData.agendas[meeting].roles[roleData.index] = roleData;
    setQueryData(currentData);
    fetch(club.url, {method: 'POST', body: JSON.stringify(roleData)}).then((res) => res.json()).then((data) => {
      console.log('results of role update',data);
    })
  }

  const agenda = (queryData && queryData.agendas && queryData.agendas.length) ? queryData.agendas[meeting] : {'title':'','date':'','roles':[]};
  const source = (agenda.html) ? {'html':'<html><body>'+agenda.html+'</body></html>'} : {};

    return (
      <SafeAreaView style={styles.container}>
      <View style={{width: '100%' }}>
      {(!clubs.length || showSettings) ?
      <View>
        <View>
        <TextInput
          style={styles.input}
          maxLength={30}
          placeholder="Club domain"
          placeholderTextColor="gray"
          value={(club && club.domain) ? club.domain : ''}
          onChangeText={(input) => {updateClub(input,'domain')}}
        />
        </View>
        <View>
        <TextInput
          style={styles.input}
          maxLength={30}
          placeholder="Mobile code"
          placeholderTextColor="gray"
          value={(club && club.code) ? club.code : ''}
          onChangeText={(input) => {updateClub(input,'code')}}
        />
        </View>
        <View>
        <Pressable onPress={addClub} style={styles.addButton}>
          <Text style={styles.addButtonText}>Add</Text>
        </Pressable>
        </View>
      </View> : null
      }
      <View>
      {(showSettings && clubs.length > 0) ? clubs.map(
        (clubChoice, index) => {
          return (
            <View style={{flexDirection: 'row'}} key={index}>
              <Pressable key={'remove'+index} onPress={() => { setClubs(() => {let current = [...clubs]; current.splice(index, 1); setClub({}); return current;} ); } } style={[styles.chooseButton,{'backgroundColor': 'red','width':25}]}>
                <Text style={styles.addButtonText}>-</Text>
              </Pressable>
              <Pressable key={'choose'+index} onPress={() => {setClub(clubChoice); setShowSettings(false); } } style={styles.chooseButton}>
                <Text style={styles.addButtonText}>Choose {clubChoice.domain}</Text>
              </Pressable>
            </View>
          )
        }
      ) : null}
      </View>
      <View style={styles.inputContainer}>
      <Text>{club.domain}</Text>
      <Pressable onPress={() => { if(!showSettings); setClub({'domain':'','code':'','url':''}); setShowSettings(!showSettings) }} style={{ marginLeft: 10 }}>
      <Octicons name="pencil" size={24} color='black' selectable={undefined} style={{ width: 24, borderWidth: 1, borderColor: (showSettings) ? 'red' : 'white' }} />
      </Pressable>
      <Pressable onPress={() => { setViewAgenda(!viewAgenda) }} style={{ marginLeft: 10, borderWidth: 1, borderColor: (viewAgenda) ? 'red' : 'white' }}>
      <Octicons name="eye" size={24} color='black' selectable={undefined} style={{ width: 24 }} />
      </Pressable>
      </View>
      <View style={{flexDirection: 'row',paddingLeft: 10}}>
      <Text>{agenda && agenda.title}</Text>
      <Pressable onPress={() => { setMeeting( (prev) => { prev++; if(prev < queryData.agendas.length - 1 ) return prev; else return 0; } ) }} style={{ marginLeft: 10 }}>
      <Octicons name="arrow-right" size={24} color="black" selectable={undefined} style={{ width: 24 }} />
      </Pressable>
      </View>
      {viewAgenda ? <ScrollView><RenderHtml source={source} width="95%" /></ScrollView> : null}
      {(!viewAgenda && agenda.roles.length > 0) ? 
      <ScrollView ><Text>Agenda goes here. Roles: {agenda.roles.length}</Text> 
{
      agenda.roles.map((item, itemindex) => {
        return <RenderRole key={item.assignment_key} item={{...item,'projects':queryData.projects,'index':itemindex}} updateRole={updateRole} user_id={queryData.user_id} name={queryData.name} style={styles} />
      })
}
</ScrollView> : null
      }

      </View>
      </SafeAreaView>  
    )
}
