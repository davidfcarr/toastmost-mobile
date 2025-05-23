import { Text, View, Pressable, FlatList, ScrollView, Switch, AppState } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect, useRef } from "react";
import { Octicons } from '@expo/vector-icons'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import EditRole from '../EditRole';
import EditableNote from '../EditableNote';
import SuggestRole from '../SuggestRole';
import styles from '../styles';
import BrandHeader from '../BrandHeader';
import useAgenda from '../useAgenda';
import Settings from './Settings';
import { useFocusEffect } from 'expo-router';
import useClubMeetingStore from '../store';
import Promo from '../Promo';
import TranslatedText from '../TranslatedText'; /* <TranslatedText term="" /> */
import { Link } from 'expo-router';
import RenderHtml from "react-native-render-html";

export function ErrorBoundary({ error, retry }) {
  return (
    <SafeAreaView>
    <View style={{ flex: 1}}>
      <Text>{error.message}</Text>
      <Pressable onPress={retry} style={{backgroundColor:'black',padding: 10, borderRadius: 5, margin: 10}}><Text style={{color:'white'}}>Try Again?</Text></Pressable>
      <Text>Try navigating to the <Link href="/Settings"  style={{textDecorationLine: 'underline'}}>Settings</Link> screen.</Text>
      </View>
    </SafeAreaView>
  );
}

export default function Home (props) {
    const [edit,setEdit] = useState('');
    const [suggest,setSuggest] = useState('');
    const [assign,setAssign] = useState(false);
    const [editNotes,setEditNotes] = useState(false);
    const {updateRole, getToastData, absence} = useAgenda();
    const timeNow = Date.now();
    const {clubs, setClubs, meeting, setMeeting,agenda,setAgenda, message, setMessage,queryData,language,nextUpdate,setNextUpdate,newsite} = useClubMeetingStore();
    const club = (clubs && clubs.length) ? clubs[0] : {};
    const appState = useRef(AppState.currentState);


      useEffect(() => {
        if(clubs.length)
          getToastData(clubs[0],'useEffect initial');
      }, []);
    
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

    if(!agenda || !agenda.roles || !agenda.roles.length || !queryData || !queryData.agendas) {
    console.log('loading message agenda',agenda);
    console.log('loading message queryData',queryData);
    return <SafeAreaView><View><BrandHeader  isHome={true} /><Text>Loading ...</Text>
            <Pressable
                  onPress={() => {
                    getToastData(clubs[0],'button');
                    setMessage('Checking server for updates ...'+clubs[0].domain);
                  }}
                >
<MaterialCommunityIcons name="refresh" size={24} color="black" />
</Pressable>
      </View></SafeAreaView>;
    }

    if(edit) {
      const item = agenda.roles.find((element) => {if(element.assignment_key == edit) return element;});
      item.index = agenda.roles.findIndex((element) => (element.assignment_key == edit));
      return (<SafeAreaView><View><BrandHeader isHome={true} setEdit={setEdit} mode="edit" />
      <ScrollView>
      <EditRole item={item} members={queryData.members} updateRole={updateRole} queryData={queryData} setEdit={setEdit} mode="edit" />
      <Pressable style={[styles.addButton,{marginTop:50}]} onPress={() => setEdit('')}><Text style={styles.buttonText}><TranslatedText term="Done" /></Text></Pressable>
      <Promo />
      </ScrollView>
      </View>
      </SafeAreaView>);
    }

    if(suggest) {
      const item = agenda.roles.find((element) => {if(element.assignment_key == suggest) return element;});
      return (<SafeAreaView><View><BrandHeader isHome={true} setSuggest={setSuggest} mode="suggest" />
      <ScrollView>
      <SuggestRole item={item} members={queryData.members} queryData={queryData} setSuggest={setSuggest} mode="suggest" />
      <Pressable style={[styles.addButton,{marginTop:50}]} onPress={() => setSuggest('')}><Text style={styles.buttonText}>Done</Text></Pressable>
      <Promo />
      </ScrollView>
      </View>
      </SafeAreaView>);
    }

    if(clubs.length && queryData.domain && queryData.domain != clubs[0].domain) {
      console.log('wrong queryData.domain',queryData.domain);
      console.log('wrong clubs[0].domain',clubs[0].domain);
      return (<SafeAreaView><View><BrandHeader isHome={true} />
      <View style={styles.container}>
      <Text><TranslatedText term="New website" />: {clubs[0].domain}</Text>
      <Pressable
                  onPress={() => {
                    getToastData(clubs[0],'button new website');
                    setMessage('Checking server for updates ...'+clubs[0].domain);
                  }}
                >
<MaterialCommunityIcons name="refresh" size={24} color="black" />
</Pressable>
<TranslatedText term="Click the refresh button if the new site's agenda does not load within 60 seconds." />
</View>
      </View>
      </SafeAreaView>);
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
              {club.domain && agenda && queryData.agendas ? (<View style={{flexDirection: 'row'}}>
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
              </View>)
               : null}
            </View>

            {club.domain && agenda.roles.length > 0 ? (
              <View style={{ width: '100%', flex: 1 }}>
                <FlatList
                  data={agenda.roles}
                  ListHeaderComponent={<View>
                                      <View style={{ flexDirection: 'row',padding: 5, justifyContent: 'space-between' }}>
                    <Octicons name="plus" size={15} color="black" style={{ width: 15 }} /><TranslatedText term="Take Role" /><Octicons name="x-circle" size={15} color="red" style={{ width: 15 }} /><TranslatedText term="Cancel" /><Octicons name="pencil" size={15} color="black" style={{ width: 15 }} /><TranslatedText term="Edit" /><Octicons name="paper-airplane" size={15} color="black" style={{ width: 15 }} /><TranslatedText term="Suggest" />                
                  </View>
                  <View style={{flexDirection: 'row'}}>
                  <Switch
          trackColor={{false: '#767577', true: '#81b0ff'}}
          thumbColor={assign ? '#f5dd4b' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={() => {
            const newassign = !assign;
            setAssign(newassign);
          }}
          value={assign}
        /><TranslatedText term="Assign" style={{marginLeft: 10, marginRight: 10}} />
<Switch
          trackColor={{false: '#767577', true: '#81b0ff'}}
          thumbColor={editNotes ? '#f5dd4b' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={() => {
            const neweditn = !editNotes;
            setEditNotes(neweditn);
          }}
          value={editNotes}
        /><TranslatedText term="Notes" style={{marginLeft: 10}} /><Text> ({(agenda.editable && agenda.editable.length) ? agenda.editable.length : 0})</Text>
                  </View>
                  {editNotes && agenda.editable.length ? agenda.editable.map((item) => <EditableNote key={item.key} item={item} post_id={agenda.post_id} />) : null}
                    </View>}
                  ListFooterComponent={<Promo />}
                  renderItem={({ item, index:itemIndex }) => {
                    const roleid = parseInt(item.ID);
                    const isMe = (roleid == queryData.user_id);
                    const name = (item.name) ? item.name : 'Open';

                    if(assign)
                      return (
                        <EditRole item={item} members={queryData.members} updateRole={updateRole} queryData={queryData} setEdit={setEdit} mode="assign" />
                      )

                      if(item.ID && item.ID != '0' && !isMe) {
                        return (
                          <View style={{ flexDirection: 'row', justifyContent: 'start', padding: 10 }}>
                          {item.role.includes('Absence') ? <Octicons name="check" size={24} color="black" style={{ width: 24, marginRight: 15 }} /> : <Pressable onPress={() => {setEdit(item.assignment_key);}}>
                            <Octicons name="pencil" size={24} color="black" style={{ marginLeft: 80, width: 24 }} />
                            </Pressable>}
                            <View>
                              <Text style={styles.role}><TranslatedText term={item.role} /></Text>
                              <Text style={styles.name}>{name}</Text>
                            </View>
                          </View>
                        )  
                      }

                      if(isMe)
                      return (
                        <View style={{ flexDirection: 'row', justifyContent: 'start', padding: 10 }}>
                          <Pressable onPress={() => {const update = {...item,index:itemIndex,ID:0,name:''}; console.log('updateRole',update); updateRole(update); }}>
                          <Octicons name="x-circle" size={24} color="red" style={{ width: 24, marginRight: 15 }} />
                          </Pressable>
                          {item.role.includes('Absence') ? null : <View style={{flexDirection: 'row'}}><Pressable onPress={() => {const update = {...item,index:itemIndex,ID:0,name:''}; console.log('updateRole',update); updateRole(update); setSuggest(item.assignment_key);}}>
                          <Octicons name="paper-airplane" size={24} color="black" style={{ width: 24, marginRight: 15 }} />
                          </Pressable>
                          <Pressable onPress={() => {setEdit(item.assignment_key);}}>
                          <Octicons name="pencil" size={24} color="black" style={{ width: 24 }} />
                          </Pressable>
                          </View>}
                          <View>
                          <Text style={styles.role}><TranslatedText term={item.role} /></Text>
                          <Text style={styles.name}>{name}</Text>
                          </View>
                        </View>
                      )
                    return (
                      <View style={{ flexDirection: 'row', justifyContent: 'start', padding: 10 }}>
                        <Pressable onPress={() => {const update = {...item,index:itemIndex,ID:queryData.user_id,name:queryData.name,wasopen:true}; console.log('updateRole',update); updateRole(update); if('Speaker' == item.role) setEdit(item.assignment_key); }}>
                        <Octicons name="plus" size={24} color="black" style={{ width: 24, marginRight: 15 }} />
                        </Pressable>
                        {item.role.includes('Absence')  ? null:  <View style={{flexDirection: 'row'}}>
                          <Pressable onPress={() => {setSuggest(item.assignment_key);}}>
                          <Octicons name="paper-airplane" size={24} color="black" style={{ width: 24, marginRight: 15 }} />
                          </Pressable>
                          <Pressable onPress={() => {setEdit(item.assignment_key);}}>
                          <Octicons name="pencil" size={24} color="black" style={{ width: 24 }} />
                          </Pressable>
                        </View>}
                        <View>
                        <Text style={styles.role}><TranslatedText term={item.role} /></Text>
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

}