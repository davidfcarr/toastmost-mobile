import { Text, View, Pressable, AppState, FlatList } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect, useCallback } from "react";
import { Octicons } from '@expo/vector-icons'
import EditRole from '../EditRole';
/* import RenderRole from '../RenderRole'; */
import styles from '../styles'
import BrandHeader from '../BrandHeader';
import useAgenda from '../useAgenda';
import Settings from './Settings';
import { useFocusEffect } from 'expo-router';
import useClubMeetingStore from '../store';

export default function Home (props) {
    const [edit,setEdit] = useState('');
    const [pollingInterval,setPollingInterval] = useState(null);
    const refreshTime = 60000;
    const {queryData, message, setMessage, updateRole, getAgenda, getToastData} = useAgenda();
    const [lastUpdate, setLastUpdate] = useState(0);
    const timeNow = Date.now();
    const {clubs, setClubs, meeting, setMeeting,agenda,setAgenda} = useClubMeetingStore();
    const club = (clubs && clubs.length) ? clubs[0] : {};
    useFocusEffect(
      useCallback(() => {
        console.log('focus Home');// Do something when the screen is focused
        getToastData(club);
        setLastUpdate(timeNow);
        //polling();
          return () => {
          if(pollingInterval)
            clearInterval(pollingInterval);
          console.log('unfocus Home');
        };
      }, [])
    );
    useEffect(() => {
        setLastUpdate(timeNow);
        console.log('fetch fresh data getToastData',club);
        getToastData(club);  
    }
    ,[]);
    useEffect(() => {
      setLastUpdate(timeNow);
      console.log('fetch fresh data getToastData',club);
      getToastData(club);
    }
    ,[clubs]);

    useEffect(() => {
      const newagenda = (queryData && queryData.agendas) ? queryData.agendas[meeting] : {};
      console.log('meeting change '+meeting,newagenda);
      //console.log('agendas',queryData.agendas.length);
      setAgenda(newagenda);
    }
    ,[meeting]);

    if(!club) {
      return <SafeAreaView><View><BrandHeader /><Text>Loading clubs list ...</Text></View></SafeAreaView>;
    }
    
    if(!club.code)  {
      return <Settings />;
    }

    console.log('home agenda',agenda)
    if(!agenda || !agenda.roles || !agenda.roles.length) {
      return <SafeAreaView><View><BrandHeader /><Text>Loading ...</Text></View></SafeAreaView>;
    }

    if(edit) {
      const item = agenda.roles.find((element) => {if(element.assignment_key == edit) return element;});
      return (<SafeAreaView><View><BrandHeader />
      <EditRole item={item} members={queryData.members} updateRole={updateRole} queryData={queryData} setEdit={setEdit} />
      <Pressable style={[styles.addButton,{marginTop:50}]} onPress={() => setEdit('')}><Text style={styles.buttonText}>Done</Text></Pressable>
      </View></SafeAreaView>);
    }

      return (
        <SafeAreaView style={styles.container}>
          <View style={{ width: '100%', flex: 1 }}>
            <BrandHeader {...queryData} />

            {message ? (
              <View>
                <Text style={{ backgroundColor: 'black', color: 'white', padding: 10, margin: 5 }}>
                  {message}
                </Text>
              </View>
            ) : null}
            {club.url && (!agenda.roles || !agenda.roles.length) ? (
              <View>
                <Text style={{ backgroundColor: 'black', color: 'white', padding: 10, margin: 5 }}>
                  Loading agenda. If this takes more than a few seconds, check the club access code.
                </Text>
              </View>
            ) : null}

            <View style={{ flexDirection: 'row', paddingLeft: 10 }}>
              {club.domain && agenda ? <Text>{agenda && agenda.title}</Text> : null}
              {queryData && queryData.agendas && queryData.agendas.length ? (
                <Pressable
                  onPress={() => {
                    const nextMeeting = meeting + 1;
                    if (queryData.agendas.length > nextMeeting) setMeeting(nextMeeting);
                    else setMeeting(0);
                  }}
                  style={{ marginLeft: 10 }}
                >
                  <Octicons name="arrow-right" size={24} color="black" style={{ width: 24 }} />
                </Pressable>
              ) : null}
            </View>

            {club.domain && agenda.roles.length > 0 ? (
              <View style={{ width: '100%', flex: 1 }}>
                {edit ? null : (
                  <Text style={{ fontStyle: 'italic', padding: 5 }}>
                    Click the + to take a role, - to withdraw
                  </Text>
                )}
                <FlatList
                  data={agenda.roles}
                  renderItem={({ item, itemIndex }) => {
                    const roleid = parseInt(item.ID);
                    const isMe = (roleid == queryData.user_id);
                    console.log('item isMe '+item.role,isMe);
                    const name = (item.name) ? item.name : 'Open';

                      if(item.ID && item.ID != '0' && !isMe) {
                        console.log('nobutton item',item);
                        return (
                          <View style={{ flexDirection: 'row', justifyContent: 'start', padding: 10 }}>
                            <Pressable onPress={() => {setEdit(item.assignment_key);}}>
                            <Octicons name="pencil" size={24} color="black" style={{ width: 24 }} />
                            </Pressable>
                            <View style={styles.nobutton}><Text style={styles.plusMinusText}>✓</Text></View>
                            <Text style={styles.role}>{item.role}</Text>
                            <Text style={styles.name}>{name}</Text>
                          </View>
                        )  
                      }

                      if(isMe)
                      return (
                        <View style={{ flexDirection: 'row', justifyContent: 'start', padding: 10 }}>
                          <Pressable onPress={() => {setEdit(item.assignment_key);}}>
                          <Octicons name="pencil" size={24} color="black" style={{ width: 24 }} />
                          </Pressable>
                          <Pressable style={styles.minusbutton} onPress={() => {const update = {...item,index:itemIndex,ID:0,name:''}; console.log('updateRole',update); updateRole(update); }}>
                            <Text style={styles.plusMinusText}>-</Text>
                          </Pressable>
                          <Text style={styles.role}>{item.role}</Text>
                          <Text style={styles.name}>{name}</Text>
                        </View>
                      )
                    return (
                      <View style={{ flexDirection: 'row', justifyContent: 'start', padding: 10 }}>
                          <Pressable onPress={() => {setEdit(item.assignment_key);}}>
                          <Octicons name="pencil" size={24} color="black" style={{ width: 24 }} />
                          </Pressable>
                        <Pressable style={styles.plusbutton} onPress={() => {const update = {...item,index:itemIndex,ID:queryData.user_id,name:queryData.name}; console.log('updateRole',update); updateRole(update); if('Speaker' == item.role) setEdit(item.assignment_key); }}>
                          <Text style={styles.plusMinusText}>+</Text>
                        </Pressable>
                        <Text style={styles.role}>{item.role}</Text>
                        <Text style={styles.name}>{name}</Text>
                      </View>
                    )

                  }}
                />
              </View>
            ) : null}
          </View>
        </SafeAreaView>
      );


  function polling() {
    if(pollingInterval) {
      console.log('cleared pollingInterval',pollingInterval);
      clearInterval(pollingInterval);
    }
    const newInterval = setInterval(() => {
      if('active' == AppState.currentState) {
        setMessage('Checking server for updates ...'+club.domain);
        getToastData(club);  
      }
      else {
        console.log('do not poll server for updates if not in foreground');
      }
    }, refreshTime);
    console.log('set pollingInterval',newInterval);
    setPollingInterval(newInterval);
  }

}