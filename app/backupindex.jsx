import { Text, View, ScrollView, TextInput, Pressable, Image, AppState, Switch, FlatList } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { Inter_500Medium, useFonts } from "@expo-google-fonts/inter";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Octicons } from '@expo/vector-icons'
import FontAwesome from '@expo/vector-icons/FontAwesome';
import ProjectChooser from './ProjectChooser';
import EditRole from './EditRole';
import Timer from './(tabs)/Timer';
import Voting from './(tabs)/Voting';
/* import QRScanner from "./QRScanner"; */
import styles from './styles'
import RenderHtml from 'react-native-render-html';
import * as Linking from 'expo-linking';
import { useWindowDimensions } from 'react-native';
import { Platform } from 'react-native';
import useAgenda from './useAgenda';

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
        {(item.ID == 0) ? <Pressable style={styles.addButton} onPress={() => { const newitem = {...item}; newitem.ID = user_id; newitem.name = name; console.log('newitem',newitem); updateRole(newitem); }}><Text  style={styles.addButtonText}>+</Text></Pressable> : null}
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
  const [showLogo,setShowLogo] = useState(true);
  const [emailPrompt,setEmailPrompt] = useState(false);
  const { width, height } = useWindowDimensions();

  const {clubs, setClubs, club, setClub, screen, setScreen, queryData, setQueryData, toastmostData, message, setMessage, reset, setReset, timeNow, setTimeNow, lastUpdate, setLastUpdate, refreshTime, version, meeting, setMeeting, addClub, updateClub, updateRole, sendEmail, takeVoteCounter} = useAgenda();

  const toggleSwitch = () => setEmailPrompt(previousState => !previousState);

  const [loaded, error] = useFonts({
    Inter_500Medium,
  })

  setTimeout(() => {setShowLogo(false)},10000);

  function diffClubs () {
    if(!queryData || !queryData.userblogs)
      return [];
    let diff = [... queryData.userblogs];
    let index;
    clubs.forEach(
      (club) => {
        index = diff.indexOf(club.domain);
        diff[index] = null;
      }
    );
    return diff.filter(Boolean);
  }

  function addDomainSame(domain) {
    const newclubs = [...clubs];
    const newclub = {'domain':domain,'code':queryData.code,'url':'https://'+domain+'/wp-json/rsvptm/v1/mobile/'+queryData.code};
    newclubs.push(newclub);
    setClubs(newclubs);
    setClub(newclub);
    setScreen('home');
    setQueryData({});
  }

  function addAllClubs() {
    const newclubs = [...clubs];
    const diffclubs = diffClubs();
    diffclubs.forEach(
      (domain) => {
        newclubs.push({'domain':domain,'code':queryData.code,'url':'https://'+domain+'/wp-json/rsvptm/v1/mobile/'+queryData.code});
      }
    );
    setClubs(newclubs);
  }

  const agenda = (queryData && queryData.agendas && queryData.agendas.length) ? queryData.agendas[meeting] : {'title':'','date':'','roles':[]};
  const source = (agenda.html) ? {'html':'<html><body>'+agenda.html+'</body></html>'} : {};
  
    if('timer' == screen && agenda.roles) {
      return <Timer roles={agenda.roles} members={queryData.members}  setScreen={setScreen} />
    }

    if('voting' == screen) {
      return <Voting club={club} post_id={agenda.post_id} agenda={agenda} members={queryData.members} setScreen={setScreen} userName={queryData.name} user_id={queryData.user_id} takeVoteCounter={takeVoteCounter} />
    }

    const different = diffClubs();
 //,position: 'absolute',bottom: 0, 
    return (
      <SafeAreaView  style={styles.container}>
      <View style={{position: 'absolute', top: 0, flexDirection: 'row',width: '100%', padding: 20, paddingBottom: 50, zIndex: 3, backgroundColor: 'white'}}>
      <Pressable onPress={() => { if(club.code) setScreen('home'); else setMessage('You must choose a club first'); }} style={{ marginLeft: 10 }}>
      <View style={{justifyContent: 'center', alignItems: 'center'}}>
      <FontAwesome name="home" size={24} color="black" />
      <Text style={{fontSize:8}}>Settings</Text>
      </View>
      </Pressable>
      <Pressable onPress={() => { setScreen('edit'); }} style={{ marginLeft: 10 }}>
      <View style={{justifyContent: 'center', alignItems: 'center'}}>
      <Octicons name="pencil" size={24} color='black' selectable={undefined} style={{ width: 24}} />
      <Text style={{fontSize:8}}>Settings</Text>
      </View>
      </Pressable>
      <Pressable onPress={() => { setScreen(''); setClub({'domain':'','code':'','url':''}); }} style={{ marginLeft: 10 }}>
      <View style={{justifyContent: 'center', alignItems: 'center'}}>
      <Octicons name="gear" size={24} color='black' selectable={undefined} style={{ width: 24}} />
      <Text style={{fontSize:8}}>Edit</Text>
      </View>
      </Pressable>
      <Pressable onPress={() => { setScreen('info'); }} style={{ marginLeft: 10}}>
      <View style={{justifyContent: 'center', alignItems: 'center'}}>
      <Octicons name="info" size={24} color='black' selectable={undefined} style={{ width: 24 }} />
      <Text style={{fontSize:8}}>Info</Text>
      </View>      
      </Pressable>
      {agenda.title ? <Pressable onPress={() => { setScreen('agenda'); }} style={{ marginLeft: 10}}>
      <View style={{justifyContent: 'center', alignItems: 'center'}}>
        <Octicons name="eye" size={24} color='black' selectable={undefined} style={{ width: 24 }} />
        <Text style={{fontSize:8}}>Agenda</Text>
        </View>
        </Pressable> : null}
      {agenda ?
      <Pressable onPress={() => { setScreen('timer'); }} style={{ marginLeft: 10 }}>
      <View style={{justifyContent: 'center', alignItems: 'center'}}>
      <Octicons name="clock" size={24} color='black' selectable={undefined} style={{ width: 24 }} />
      <Text style={{fontSize:8}}>Timer</Text>
      </View>
      </Pressable>
 : null}
      {agenda ?
      <Pressable onPress={() => { setScreen('voting'); }} style={{ marginLeft: 10 }}>
      <View style={{justifyContent: 'center', alignItems: 'center'}}>
        <Octicons name="check" size={24} color='black' selectable={undefined} style={{ width: 24 }} />
        <Text style={{fontSize:8}}>Voting</Text>
        </View>
      </Pressable>
 : null}
      {club.url ?
      <Pressable onPress={() => { getToastData(); setMessage('Checking for updates ...'); }} style={{ marginLeft: 10 }}>
      <View style={{justifyContent: 'center', alignItems: 'center'}}>
        <FontAwesome name="refresh" size={24} color="black" />
        <Text style={{fontSize:8}}>Refresh</Text>
      </View></Pressable>
 : null}
      </View>
      <View style={{width: '100%', marginBottom: 50, paddingBottom: 50 }}>
      <Text>{club.domain}</Text>
      {(!clubs.length || '' == screen) ?
      <View>
        <View>
        <TextInput
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="Domain or domain|code"
          placeholderTextColor="gray"
          value={(club && club.domain) ? club.domain : ''}
          onChangeText={(input) => {
            if(input.includes('|')) {
              const parts = input.split('|');
              setClub({domain:parts[0],code:parts[1],url:''});
            }
            else updateClub(input,'domain')}}
        />
        </View>
        {emailPrompt ? <View>
        <TextInput
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={30}
          placeholder="Enter your email address"
          placeholderTextColor="gray"
          value={(club && club.email) ? club.email : ''}
          onChangeText={(input) => {updateClub(input,'email')}}
        />
</View>
  : <View>
  <TextInput
    style={styles.input}
    autoCapitalize="none"
    autoCorrect={false}
    maxLength={30}
    placeholder="Mobile code"
    placeholderTextColor="gray"
    value={(club && club.code) ? club.code : ''}
    onChangeText={(input) => {updateClub(input,'code')}}
  />
  </View>
}
        <View style={{flexDirection: 'row',padding: 5}}>
        <Switch
          trackColor={{false: '#767577', true: '#81b0ff'}}
          thumbColor={emailPrompt ? '#f5dd4b' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={toggleSwitch}
          value={emailPrompt}
        /> Show Email Prompt
        </View>
        <View>
        <Pressable onPress={emailPrompt ? sendEmail : addClub} style={styles.addButton}>
          <Text style={styles.addButtonText}>{emailPrompt ? 'Request by Email' : 'Add'}</Text>
        </Pressable>
        </View>
        <Text style={styles.instructions}>If you have copied a domain|code string, paste it in the first field above. Toggle <Text style={{fontWeight: 'bold'}}>Show Email Prompt</Text> on to have instructions emailed to you.</Text>
        </View>

        : null
      }

      {message ? <View ><Text style={{'backgroundColor':'black','color':'white',padding: 10, margin:5}}>{message}</Text></View> : null}
      {club.url && (!queryData || !queryData.agendas || !queryData.agendas.length) ? <View ><Text style={{'backgroundColor':'black','color':'white',padding: 10, margin:5}}>Loading agenda. If this takes more than a few seconds, check the club access code.</Text></View> : null}

      <ScrollView>
      {('' == screen && clubs.length > 0) ? clubs.map(
        (clubChoice, index) => {
          return (
            <View style={{flexDirection: 'row'}} key={index}>
              <Pressable key={'remove'+index} onPress={() => { setClubs(() => {let current = [...clubs]; current.splice(index, 1); setClub({}); return current;} ); } } style={[styles.chooseButton,{'backgroundColor': 'red','width':25}]}>
                <Text style={styles.addButtonText}>-</Text>
              </Pressable>
              <Pressable key={'choose'+index} onPress={() => {console.log('setClub',clubChoice); setClub(clubChoice); setMessage('Reloading ...'); setScreen('home'); setQueryData({}); } } style={styles.chooseButton}>
                <Text style={styles.addButtonText}>Choose {clubChoice.domain}</Text>
              </Pressable>
            </View>
          )
        }
      )
      : null}
      {('' == screen && clubs.length > 0) ?
      <Pressable onPress={() => {setClub({domain:'',code:'',url:''}); setReset(true); setClubs([]); setQueryData({}); } } style={styles.chooseButton}>
      <Text style={styles.addButtonText}>Reset Clubs List</Text>
      </Pressable> : null}

      {('' == screen && queryData && different.length) ? different.map(
        (domain, index) => {
          return (
            <View style={{flexDirection: 'row'}} key={index}>
              <Pressable key={'choose'+index} onPress={() => {addDomainSame(domain);} } style={styles.chooseButton}>
                <Text style={styles.addButtonText}>Add {domain}</Text>
              </Pressable>
            </View>
          )
        }) : null
      }

      </ScrollView>
      <View style={{flexDirection: 'row',paddingLeft: 10}}>
      {club.domain && agenda ? <Text>{agenda && agenda.title}</Text> : null}
      {queryData && queryData.agendas && queryData.agendas.length ? (
      <Pressable onPress={() => { setMeeting( (prev) => { prev++; if(queryData && queryData.agendas && (prev < queryData.agendas.length - 1 )) return prev; else return 0; } ) }} style={{ marginLeft: 10 }}>
      <Octicons name="arrow-right" size={24} color="black" selectable={undefined} style={{ width: 24 }} />
      </Pressable>
      ) : null}
      </View>
 
      {showLogo ? <View><Text style={{width:'100%',fontSize:18}}>Welcome to the Toastmost Mobile App (Beta)</Text><Image style={{width:300,height:300}} source={require('../assets/images/ToastmostMobileLogo.png')} />
      {(toastmostData && toastmostData.infoScreen) ? <View style={{marginLeft: 5}}><RenderHtml source={{'html':'<html><body>'+toastmostData.infoScreen+'</body></html>'}} contentWidth={width - 20} /></View> : null}
      </View> : null}

      {'info' == screen || !queryData || !queryData.agendas || !queryData.agendas.length ? (
      <View style={{borderWidth: 1, borderColor: 'gray'}}>
        <Text style={styles.instructions}>This app makes it easy to sign up for roles, update speech details, time speeches, and perform other useful functions TBD. The app works with websites that are hosted on Toastmost.org or that have installed the WordPress for Toastmasters software.</Text>
        <Text style={styles.instructions}>If you are a member of more than one club that uses the Toastmost service, you will be able to use the same access code for all of those clubs.</Text>
        {(!showLogo && toastmostData && toastmostData.infoScreen) ? <View style={{marginLeft: 5}}><RenderHtml source={{'html':'<html><body>'+toastmostData.infoScreen+'</body></html>'}} contentWidth={width - 20} /></View> : null}
      </View>
      ) : null}
      
      {'agenda' == screen ? <ScrollView><RenderHtml source={source} contentWidth={width - 20} /></ScrollView> : null}
      {(club.domain && ('home' == screen || 'edit' == screen) && agenda.roles.length > 0) ? 
      <FlatList
      data={agenda.roles}
      renderItem={({item,itemindex}) => {
        if('edit' == screen)
          return <EditRole key={item.assignment_key} item={{...item,'projects':queryData.projects,'index':itemindex}} updateRole={updateRole} user_id={queryData.user_id} name={queryData.name} style={styles} members={queryData.members} />
        else
          return <RenderRole key={item.assignment_key} item={{...item,'projects':queryData.projects,'index':itemindex}} updateRole={updateRole} user_id={queryData.user_id} name={queryData.name} style={styles} />
      }}
      keyExtractor={item => item.assignment_key}
      />
 : null
}
      </View>
      </SafeAreaView> 
    )
}
