import { Text, View, Pressable, AppState, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect, useCallback } from "react";
import { Octicons } from '@expo/vector-icons'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import EditRole from '../EditRole';
import styles from '../styles'
import BrandHeader from '../BrandHeader';
import useAgenda from '../useAgenda';
import Settings from './Settings';
import { useFocusEffect } from 'expo-router';
import useClubMeetingStore from '../store';
import { ErrorBoundaryProps } from 'expo-router';

export function ErrorBoundary({ error, retry }) {
  return (
    <View style={{ flex: 1, backgroundColor: "red" }}>
      <Text>{error.message}</Text>
      <Pressable onPress={retry} style={{backgroundColor:'black',padding: 10, borderRadius: 5, margin: 10}}><Text style={{color:'white'}}>Try Again?</Text></Pressable>
    </View>
  );
}

export default function Home (props) {
    const [edit,setEdit] = useState('');
    const [pollingInterval,setPollingInterval] = useState(null);
    const refreshTime = 60000;
    const {updateRole, getToastData, absence} = useAgenda();
    const [lastUpdate, setLastUpdate] = useState(0);
    const timeNow = Date.now();
    const {clubs, setClubs, meeting, setMeeting,agenda,setAgenda, message, setMessage,queryData} = useClubMeetingStore();
    const club = (clubs && clubs.length) ? clubs[0] : {};
    useFocusEffect(
      useCallback(() => {
        getToastData(club);
        setLastUpdate(timeNow);
      }, [])
    );
    useEffect(() => {
        setLastUpdate(timeNow);
        getToastData(club);
        polling();
    }
    ,[]);
    useEffect(() => {
      setLastUpdate(timeNow);
      getToastData(club);
      polling();//reset polling for new club
    }
    ,[clubs,meeting]);

    useEffect(() => {
      const newagenda = (queryData && queryData.agendas) ? queryData.agendas[meeting] : {};
      setAgenda(newagenda);
    }
    ,[meeting]);

    if(!club) {
      return <SafeAreaView><View><BrandHeader  isHome={true} /><Text>Loading clubs list ...</Text></View></SafeAreaView>;
    }
    
    if(!club.code)  {
      return <Settings />;
    }

    console.log('home agenda',agenda)
    if(!agenda || !agenda.roles || !agenda.roles.length) {
      return <SafeAreaView><View><BrandHeader  isHome={true} /><Text>Loading ...</Text></View></SafeAreaView>;
    }

    if(edit) {
      const item = agenda.roles.find((element) => {if(element.assignment_key == edit) return element;});
      item.index = agenda.roles.findIndex((element) => (element.assignment_key == edit));
      return (<SafeAreaView><View><BrandHeader isHome={true} />
      <EditRole item={item} members={queryData.members} updateRole={updateRole} queryData={queryData} setEdit={setEdit} />
      <Pressable style={[styles.addButton,{marginTop:50}]} onPress={() => setEdit('')}><Text style={styles.buttonText}>Done</Text></Pressable>
      </View></SafeAreaView>);
    }

      return (
        <SafeAreaView style={styles.container}>
          <View style={{ width: '100%', flex: 1 }}>
            <BrandHeader isHome={true} />

            {club.url && (!agenda.roles || !agenda.roles.length) ? (
              <View>
                <Text style={{ backgroundColor: 'black', color: 'white', padding: 10, margin: 5 }}>
                  Loading agenda. If this takes more than a few seconds, check the club access code.
                </Text>
              </View>
            ) : null}
            <View style={{ flexDirection: 'row', paddingLeft: 10 }}>
              {club.domain && agenda ? (<View style={{flexDirection: 'row'}}>
                {meeting > 0 ? <Pressable
                  onPress={() => {
                    const prevMeeting = (meeting > 0) ? meeting - 1 : queryData.agendas.length - 1;
                    setMeeting(prevMeeting);
                  }}
                  style={{ marginLeft: 10 }}
                >
                  <Octicons name="arrow-left" size={24} color="black" style={{ width: 24 }} />
                </Pressable> : null}
                <Text>{agenda && agenda.title}</Text>
                {meeting < queryData.agendas.length -1 ?
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
                : null }
                <Pressable
                  onPress={() => {
                    setLastUpdate(timeNow);
                    getToastData(club);
                    setMessage('Checking server for updates ...'+club.domain);
                  }}
                  style={{ marginLeft: 10 }}
                >
<MaterialCommunityIcons name="refresh" size={24} color="black" />
</Pressable>
              </View>)
               : null}
            </View>

            {club.domain && agenda.roles.length > 0 ? (
              <View style={{ width: '100%', flex: 1 }}>
                {edit ? null : (
                  <Text style={{ fontStyle: 'italic', padding: 5 }}>
                    Press + to take a role, - to withdraw, <Octicons name="pencil" size={15} color="black" style={{ width: 15 }} /> to edit

                  </Text>
                )}
                <FlatList
                  data={agenda.roles}
                  renderItem={({ item, index:itemIndex }) => {
                    const roleid = parseInt(item.ID);
                    const isMe = (roleid == queryData.user_id);
                    const name = (item.name) ? item.name : 'Open';

                      if(item.ID && item.ID != '0' && !isMe) {
                        return (
                          <View style={{ flexDirection: 'row', justifyContent: 'start', padding: 10 }}>
                            <Pressable onPress={() => {setEdit(item.assignment_key);}}>
                            <Octicons name="pencil" size={24} color="black" style={{ width: 24 }} />
                            </Pressable>
                            <View style={styles.nobutton}><Text style={styles.plusMinusText}>✓</Text></View>
                            <View>
                              <Text style={styles.role}>{item.role}</Text>
                              <Text style={styles.name}>{name}</Text>
                            </View>
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
                          <View>
                          <Text style={styles.role}>{item.role}</Text>
                          <Text style={styles.name}>{name}</Text>
                          </View>
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
                        <View>
                        <Text style={styles.role}>{item.role}</Text>
                        <Text style={styles.name}>{name}</Text>
                        </View>
                      </View>
                    )

                  }}
                />
              </View>
            ) : null}
          </View>
        </SafeAreaView>
      );


function getToastUpdate() {
    if(lastUpdate + refreshTime > timeNow) {
      console.log('do not poll server for updates if last update was recent');
      return;
    }
    if(!club || !club.domain) {
      console.log('server update deferred, no club domain');
      return;
    }
    setMessage('Checking server for updates ...'+club.domain);
    getToastData(club);  
}

  function polling() {
    if(pollingInterval) {
      console.log('cleared pollingInterval',pollingInterval);
      clearInterval(pollingInterval);
    }
    const newInterval = setInterval(() => {
      if('active' == AppState.currentState) {
        getToastUpdate();
      }
      else {
        console.log('do not poll server for updates if not in foreground');
      }
    }, refreshTime);
    console.log('set pollingInterval',newInterval);
    setPollingInterval(newInterval);
  }

}