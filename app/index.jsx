import { Text, View, ScrollView, TextInput, Pressable, Image, AppState } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { Inter_500Medium, useFonts } from "@expo-google-fonts/inter";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Octicons } from '@expo/vector-icons'
import FontAwesome from '@expo/vector-icons/FontAwesome';
import ProjectChooser from './ProjectChooser';
import Timer from './Timer';
import Voting from './Voting';
import styles from './styles'
import RenderHtml from 'react-native-render-html';
import * as Linking from 'expo-linking';
import { useWindowDimensions } from 'react-native';
import { Platform } from 'react-native';

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
  const timeNow = new Date().getTime();
  const version = 0.1;
  const refreshTime = 30000;
  const [lastUpdate, setLastUpdate] = useState(timeNow);
  const [meeting, setMeeting] = useState(0)
  const [clubs, setClubs] = useState([])
  const [club, setClub] = useState({'domain':'','code':'','url':''})
  const [showSettings, setShowSettings] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)
  const [viewAgenda, setViewAgenda] = useState(false)
  const [queryData, setQueryData] = useState({})
  const [toastmostData, setToastmostData] = useState({})
  const [message,setMessage] = useState('');
  const [showTimer,setShowTimer] = useState(false);
  const [screen,setScreen] = useState('');
  const [showLogo,setShowLogo] = useState(true);
  const [pollingInterval,setPollingInterval] = useState(null);
  const { width } = useWindowDimensions();

  const [loaded, error] = useFonts({
    Inter_500Medium,
  })

  setTimeout(() => {setShowLogo(false)},10000);

  if(('active' == AppState.currentState) && (timeNow > lastUpdate + 30000)) {
    setLastUpdate(timeNow);
    polling();/*fresh update needed after app was out of focus*/
  }

  useEffect(() => {
    let jsonValue;
    const fetchData = async () => {
      try {
        jsonValue = await AsyncStorage.getItem("infoScreen")
        const infoScreen = jsonValue != null ? JSON.parse(jsonValue) : null
        if (infoScreen && !toastmostData.infoScreen) {
          setToastmostData({infoScreen:infoScreen});
        }
      } catch (e) {
        console.error(e)
      }

      try {
        jsonValue = await AsyncStorage.getItem("clubslist")
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
    getToastInfo();

  }, [])

  const storeData = async () => {
    try {
      const jsonValue = JSON.stringify(clubs)
      await AsyncStorage.setItem("clubslist", jsonValue)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    if(!clubs.length) {
      return;
    }
    storeData()
  }, [clubs])

  function polling() {
    if(pollingInterval)
      clearInterval(pollingInterval);
    setPollingInterval(setInterval(() => {
      if('active' == AppState.currentState) {
        setMessage('Checking server for updates ...');
        getToastData();  
      }
      else {
        console.log('do not poll server for updates if not in foreground');
      }
    }, refreshTime)
    ) 
  }

  function getToastData() {
    if(message && message.includes('Updating ...'))
      return;
    fetch(club.url).then((res) => {
      if(res.ok) {
        console.log('fetch connection ok');
        setMessage('');
        return res.json();
      }
      else {
        console.log('fetch not ok',res);
        if('401' == res.status)
        setMessage('Problem connecting to server. Check access code.');
        else
        setMessage('Problem connecting, status code: '+res.status);
        if(pollingInterval)
          clearInterval(pollingInterval);  
      }
    }).then((data) => {setQueryData(data);}).catch(
      (error) => {
        console.log('fetch error',error);
        setMessage('Unable to connect. Possibly a network error or typo in domain name '+club.domain+'.');
      }
    )
  }

  function getToastInfo() {
    if(message && message.includes('Checking with Toastmost World Headquarters'))
      return;
    fetch('https://toastmost.org/wp-json/toastmost/v1/mobileinfo?t='+timeNow+'&version='+version).then((res) => {
      if(res.ok) {
        console.log('fetch connection ok');
        setMessage('');
        return res.json();
      }
      else {
        console.log('fetch not ok',res);
        if('401' == res.status)
        setMessage('Problem connecting to server. Check access code.');
        else
        setMessage('Problem connecting, status code: '+res.status);
      }
    }).then((data) => {
      ('data for '+club.url,data);
      setToastmostData(data);
    }   ).catch(
      (error) => {
        console.log('fetch error',error);
        setMessage('Unable to connect with Toastmost.org. Check your network connection');
      }
    )
  }

  useEffect(() => {
      if(club.domain && club.code && club.url) {
        setMessage('Loading data for '+club.domain);
        getToastData();
        polling();
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
    const update = {...club};
    update.url = 'https://'+update.domain+'/wp-json/rsvptm/v1/mobile/'+update.code;
    setClubs([update, ...clubs]);
    setClub(update);
    setShowSettings(false);
  }

  function updateClub (input, name) {
    const update = {...club};
    update[name] = input;
    setClub(update);
  }

  function takeVoteCounter() {
    updateRole({ID:queryData.user_id,post_id:agenda.post_id,assignment_key:'_role_Vote_Counter_1',role:'Vote Counter'});
  }

  function updateRole(roleData) {
    const currentData = {...queryData};
    currentData.agendas[meeting].roles[roleData.index] = roleData;
    setQueryData(currentData);
    setMessage('Updating ...');
    console.log('Updating '+club.url);
    console.log('roledata',roleData);
    fetch(club.url, {method: 'POST', body: JSON.stringify(roleData)}).then((res) => res.json()).then((data) => {
      setMessage('');
      setQueryData(data);
      console.log('results of role update',data);
    }).catch((e) => {
      console.log('update error',e);
      setMessage('Data update error');
    })
  }

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
    setShowSettings(false);
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
  
    if(showTimer && agenda.roles) {
      return <Timer roles={agenda.roles} members={queryData.members} setShowTimer={setShowTimer} />
    }

    if('voting' == screen) {
      return <Voting club={club} post_id={agenda.post_id} agenda={agenda} members={queryData.members} setScreen={setScreen} userName={queryData.name} user_id={queryData.user_id} takeVoteCounter={takeVoteCounter} />
    }

    const different = diffClubs();
 
    return (
      <SafeAreaView style={styles.container}>
      <View style={{width: '100%', marginBottom: 50, paddingBottom: 50 }}>
      <Text>{club.domain}</Text>
      <View style={styles.inputContainer}>
      <Pressable onPress={() => { if(!showSettings); setClub({'domain':'','code':'','url':''}); setShowSettings(!showSettings) }} style={{ marginLeft: 10 }}>
      <View style={{justifyContent: 'center', alignItems: 'center'}}>
      <Octicons name="pencil" size={24} color='black' selectable={undefined} style={{ width: 24}} />
      <Text style={{fontSize:8}}>Settings</Text>
      </View>
      </Pressable>
      <Pressable onPress={() => { setShowInstructions(!showInstructions); setViewAgenda(false); }} style={{ marginLeft: 10}}>
      <View style={{justifyContent: 'center', alignItems: 'center'}}>
      <Octicons name="info" size={24} color='black' selectable={undefined} style={{ width: 24 }} />
      <Text style={{fontSize:8}}>Info</Text>
      </View>      
      </Pressable>
      {agenda.title ? <Pressable onPress={() => { setViewAgenda(!viewAgenda); setShowInstructions(false); }} style={{ marginLeft: 10}}>
      <View style={{justifyContent: 'center', alignItems: 'center'}}>
        <Octicons name="eye" size={24} color='black' selectable={undefined} style={{ width: 24 }} />
        <Text style={{fontSize:8}}>Agenda</Text>
        </View>
        </Pressable> : null}
      {agenda ?
      <Pressable onPress={() => { setShowTimer(!showTimer); setViewAgenda(false); setShowInstructions(false); }} style={{ marginLeft: 10 }}>
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
      {toastmostData && toastmostData.androidUpdatePrompt && ('android' == Platform.OS) ? <View style={{marginLeft:5,marginRight: 5, padding: 5, borderWidth:1,borderColor:'red'}}><RenderHtml source={{'html':toastmostData.androidUpdatePrompt}} contentWidth={width - 10} /></View> : null}
      {(!clubs.length || showSettings) ?
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
        <View>
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
        <View>
        <Pressable onPress={addClub} style={styles.addButton}>
          <Text style={styles.addButtonText}>Add</Text>
        </Pressable>
        </View>
        <Text style={styles.instructions}>If you have copied a domain|code string, paste it in the first field above. Or get the code from the <Text style={{fontWeight: 'bold'}}>Moble App Setup</Text> screen under the <Text style={{fontWeight: 'bold'}}>Toastmasters</Text> menu of the club website dashboard.</Text>
        </View> : null
      }
      {message ? <View ><Text style={{'backgroundColor':'black','color':'white',padding: 10, margin:5}}>{message}</Text></View> : null}
      {club.url && (!queryData || !queryData.agendas || !queryData.agendas.length) ? <View ><Text style={{'backgroundColor':'black','color':'white',padding: 10, margin:5}}>Loading agenda. If this takes more than a few seconds, check the club access code.</Text></View> : null}

      <ScrollView>
      {(showSettings && clubs.length > 0) ? clubs.map(
        (clubChoice, index) => {
          return (
            <View style={{flexDirection: 'row'}} key={index}>
              <Pressable key={'remove'+index} onPress={() => { setClubs(() => {let current = [...clubs]; current.splice(index, 1); setClub({}); return current;} ); } } style={[styles.chooseButton,{'backgroundColor': 'red','width':25}]}>
                <Text style={styles.addButtonText}>-</Text>
              </Pressable>
              <Pressable key={'choose'+index} onPress={() => {console.log('setClub',clubChoice); setClub(clubChoice); setMessage('Reloading ...'); setShowSettings(false); setQueryData({}); } } style={styles.chooseButton}>
                <Text style={styles.addButtonText}>Choose {clubChoice.domain}</Text>
              </Pressable>
            </View>
          )
        }
      )
      : null}
      {(showSettings && clubs.length > 0) ?
      <Pressable onPress={() => {setClub({domain:'',code:'',url:''}); setClubs([]); setQueryData({}); AsyncStorage.setItem("clubslist", null);} } style={styles.chooseButton}>
      <Text style={styles.addButtonText}>Reset Clubs List</Text>
      </Pressable> : null}

      {(showSettings && queryData && different.length) ? different.map(
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

      {showInstructions || !queryData || !queryData.agendas || !queryData.agendas.length ? (
      <View style={{borderWidth: 1, borderColor: 'gray'}}>
        <Text style={styles.instructions}>This app makes it easy to sign up for roles, update speech details, time speeches, and perform other useful functions TBD. The app works with websites that are hosted on Toastmost.org or that have installed the WordPress for Toastmasters software.</Text>
        <Text style={styles.instructions}>If you are a member of more than one club that uses the Toastmost service, you will be able to use the same access code for all of those clubs.</Text>
        {(!showLogo && toastmostData && toastmostData.infoScreen) ? <View style={{marginLeft: 5}}><RenderHtml source={{'html':'<html><body>'+toastmostData.infoScreen+'</body></html>'}} contentWidth={width - 20} /></View> : null}
      </View>
      ) : null}
      
      {viewAgenda ? <ScrollView><RenderHtml source={source} contentWidth={width - 20} /></ScrollView> : null}
      {(club.domain && !viewAgenda && agenda.roles.length > 0) ? 
        <ScrollView>
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
