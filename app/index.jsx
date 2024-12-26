import { Text, View, TextInput, Pressable, Dimensions, StyleSheet, FlatList, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { Inter_500Medium, useFonts } from "@expo-google-fonts/inter";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Octicons } from '@expo/vector-icons'
import axios from 'axios';
import ProjectChooser from './ProjectChooser';
import styles from './styles'
import RenderHtml from 'react-native-render-html';
import { ScrollView } from "react-native-gesture-handler";
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

export default function Index() {
  const queryClient = new QueryClient()
  return (
    <GestureHandlerRootView>
      <QueryClientProvider client={queryClient}>
    <MobileAgenda />
  </QueryClientProvider>
  </GestureHandlerRootView>
  );
}

const RenderRole = ({ item, mutation, user_id }) => {
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

const [title,setTitle] = useState(item.title);

console.log('role to render',item);

  return (
    <View key={item.assignment_key}>
    <View style={styles.todoItem}>
        <Text> 
          {item.role} {item.name} 
        </Text>
        {(item.ID == 0) ? <Pressable style={styles.addButton} onPress={() => { mutation.mutate({'ID':user_id,'post_id':item.post_id,'key':item.assignment_key}) }}><Text  style={styles.addButtonText}>+</Text></Pressable> : null}
        {(item.ID == user_id) ? <Pressable style={[styles.addButton,{backgroundColor:'red'}]} onPress={() => {mutation.mutate({'ID':0,'post_id':item.post_id,'key':item.assignment_key}) }}><Text  style={styles.addButtonText}>-</Text></Pressable>: null}
    </View>
        {(item.ID == user_id && 'Speaker' == item.role) ? <View>
        <ProjectChooser {...item} mutation={mutation} styles={styles} />
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
  const [message,setMessage] = useState('');

  const [loaded, error] = useFonts({
    Inter_500Medium,
  })

  useEffect(() => {
    console.log('useEffect for checking local variables');
    const fetchData = async () => {
      try {
        const jsonValue = await AsyncStorage.getItem("clubslist")
        const storageClubs = jsonValue != null ? JSON.parse(jsonValue) : null
        console.log('clubs from local storage',storageClubs);
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
    console.log('useEffect for storing local');
    if(!clubs.length) {
      console.log('nothing to save');
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

    const { isPending, error:queryerror, data:querydata } = useQuery({
      queryKey: ['agendas', club.url],
      enabled: !!club.url && !showSettings,
      queryFn: () => {
        let d = fetch(club.url).then((res) =>
          res.json())
        return d;
      }
      }
    )
    const queryClient = useQueryClient();
    const mutation = useMutation({
      mutationFn: (role) => {
        console.log('post update',role);
        return axios.post(club.url, role)
      },
      onSuccess: (data) => {
        console.log('onSuccess',data);
        queryClient.setQueryData(['agendas', club.url], data.data)
      },
    })

    const { isPending:updateIsPending, submittedAt, variables:updateVariables, mutate, isError } = mutation;

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
    console.log('update club ' +input+' '+name);
    const update = {...club};
    update[name] = input;
    update.url = 'https://'+update.domain+'/wp-json/rsvptm/v1/mobile/'+update.code;
    console.log('update',update);
    setClub(update);
  }

  const agenda = (querydata && querydata.agendas && querydata.agendas.length) ? querydata.agendas[meeting] : {'title':'','date':'','roles':[]};
  const source = (agenda.html) ? {'html':'<html><body>'+agenda.html+'</body></html>'} : {};
  const scrollheight = Dimensions.get('window').height - 100;
    return (
      <SafeAreaView style={styles.container}>
      <View style={{width: '100%' }}>
      {(!clubs.length || showSettings) ?
      <View style={styles.inputContainer}>
      <View>
        <TextInput
          style={styles.input}
          maxLength={30}
          placeholder="Club domain"
          placeholderTextColor="gray"
          value={club.domain}
          onChangeText={(input) => {updateClub(input,'domain')}}
        />
        </View>
        <View>
        <TextInput
          style={styles.input}
          maxLength={30}
          placeholder="Mobile code"
          placeholderTextColor="gray"
          value={club.code}
          onChangeText={(input) => {updateClub(input,'code')}}
        />
        </View>
        <Pressable onPress={addClub} style={styles.addButton}>
          <Text style={styles.addButtonText}>Add</Text>
        </Pressable>
      </View> : null
      }
      <View>
      {(showSettings && clubs.length > 0) ? clubs.map(
        (clubChoice, index) => {
          return (
              <Pressable onPress={() => {setClub(clubChoice); setShowSettings(false); } } style={styles.chooseButton}>
                <Text style={styles.addButtonText}>Choose {clubChoice.domain}</Text>
              </Pressable>
          )
        }
      ) : null}
      </View>
      <View style={styles.inputContainer}>
      <Text>{club.domain}</Text>
      <Pressable onPress={() => { setShowSettings(!showSettings) }} style={{ marginLeft: 10 }}>
      <Octicons name="pencil" size={24} color='black' selectable={undefined} style={{ width: 24, borderWidth: 1, borderColor: (showSettings) ? 'red' : 'white' }} />
      </Pressable>
      <Pressable onPress={() => { setViewAgenda(!viewAgenda) }} style={{ marginLeft: 10, borderWidth: 1, borderColor: (viewAgenda) ? 'red' : 'white' }}>
      <Octicons name="eye" size={24} color='black' selectable={undefined} style={{ width: 24 }} />
      </Pressable>
      </View>
      <View style={{flexDirection: 'row',paddingLeft: 10}}>
      <Text>{agenda && agenda.title}</Text>
      <Pressable onPress={() => { setMeeting( (prev) => { prev++; if(prev < querydata.agendas.length - 1 ) return prev; else return 0; } ) }} style={{ marginLeft: 10 }}>
      <Octicons name="arrow-right" size={24} color="black" selectable={undefined} style={{ width: 24 }} />
      </Pressable>
      </View>
      {viewAgenda ? <ScrollView style={{height: scrollheight, paddingBottom: 100}}><RenderHtml source={source} width="95%" /></ScrollView> : null}
      {(!viewAgenda && agenda.roles.length > 0) ? <ScrollView style={{height: scrollheight, paddingBottom: 100}}> {
      agenda.roles.map((item) => {
        if(updateIsPending) {
          let match = itemUpdateMatch(item,updateVariables)
          if(match == 'add') {
            item.ID = querydata.ID;
            item.name = querydata.name + ' (saving ...)';
          }
          else if (match) {
            item.ID = 0;
            item.name = '';
          }
        }
        return <RenderRole key={item.assignment_key} item={{...item,'projects':querydata.projects}} mutation={mutation} user_id={querydata.user_id} style={styles} />
      })
      }
      </ScrollView> : null
      }
      </View>
      </SafeAreaView>  
    )
}

