import {useState, useEffect} from 'react';
import {AppState,Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import useClubMeetingStore from './store';
import * as Linking from 'expo-linking';

export default function useAgenda() {
    //const [meeting, setMeeting] = useState(0);
    //const [clubs, setClubs] = useState([]);
    const [toastmostData, setToastmostData] = useState({});
    const [reset, setReset] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(Date.now());
    const refreshTime = 60000;
    const version = '1.0.0';
    const timeNow = Date.now();
    const [members, setMembers] = useState([]);
    const [user_id, setUserId] = useState(0);
    const [sendPlatform, setSendPlatform] = useState(true);
    const [pageUrl, setPageUrl] = useState('');
    const {queryData, setQueryData,clubs, setClubs, meeting, setMeeting,agenda,setAgenda, message, setMessage, language, setLanguage, agendaPollingInterval, setAgendaPollingInterval} = useClubMeetingStore();
    const url = Linking.useURL();
    if(url != pageUrl) {
      if(null !== url) {
        setPageUrl(url);
      }
    }

  function setDefaultClub(index) 
  {
    const defaultClub = clubs[index];
    const clubsCopy = [...clubs];
    clubsCopy.splice(index,1);
    clubsCopy.unshift(defaultClub);
    setClubs(clubsCopy);
  }

  function initToastmost() {
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
        console.log('init storageClubs',storageClubs);
        if (!clubs.length && storageClubs && storageClubs.length) {
          setClubs(storageClubs)
        }
      } catch (e) {
        console.error(e)
      }

      try {
        const l = await AsyncStorage.getItem("language")
        if (l) {
          setLanguage(l);
        }
      } catch (e) {
        console.error(e)
      }
    }
    fetchData();
    getToastInfo();
    setInterval(() => {getToastInfo()},86400000);/* check once a day */
  }

  useEffect(() => {
    initToastmost();
  }, [])

  const storeData = async () => {
    try {
      const jsonValue = JSON.stringify(clubs)
      await AsyncStorage.setItem("clubslist", jsonValue)
    } catch (e) {
      console.error(e)
    }
  }

async function saveLanguage(l) {
  setLanguage(l);
  try {
    await AsyncStorage.setItem("language", l);
    console.log('store language preference',l);
  } catch (e) {
    console.error(e)
  }      
}

  useEffect(() => {
    if(!clubs.length && !reset) {
      return;
    }
    storeData();
    if(reset) {
      setReset(false);
    }
    initAgendaPolling(clubs[0]);
  }, [clubs])

  useEffect(() => {
    if('' == message)
      return;
    setTimeout(() => {
      setMessage('');
    },30000);
  }, [message])

  function getAgenda() {
    if(queryData && queryData.agendas && queryData.agendas.length) {
      return queryData.agendas[meeting];
    }
    return [];
  }

  useEffect(() => {
    if(queryData && queryData.agendas && queryData.agendas.length) {
      setAgenda(queryData.agendas[meeting]);
    }
    else
      return;
    setMembers(queryData.members);
    setUserId(queryData.user_id);
  }, [clubs, queryData])

  function getCurrentClub() { return (clubs && clubs.length) ? clubs[0] : null; }

  function getToastData(currentClub) {
    if(!currentClub || !currentClub.url) {
      return;
    }
    if(message && message.includes('Updating ...'))
      return;
    let queryString = '?language='+language;
    if(sendPlatform)
    {
      queryString += '&mobileos='+Platform.OS;/*+'&language=fr_FR';*/
      setSendPlatform(false);
    }
    fetch(currentClub.url+queryString).then((res) => {
      if(res.ok) {
        setMessage('');
        return res.json();
      }
      else {
        console.log('getToastData fetch not ok',res);
        if('401' == res.status)
        setMessage('Problem connecting to server. Check access code.');
        else
        setMessage('Problem connecting, status code: '+res.status);

        if(pollingInterval)
          clearInterval(pollingInterval);  
      }
    }).then((data) => {
      if(!data || !data.agendas) {
        setMessage('Error downloading data for '+currentClub.domain+' - check Settings screen');
        return;
      }
      setLastUpdate(timeNow);
      setQueryData(data);
      if(data.agendas.length)
        setAgenda(data.agendas[meeting]);
      else
        setMessage('No agenda data found for '+currentClub.domain);
    }).catch(
      (error) => {
        console.log('fetch error',error);
        setMessage('Unable to connect. Possibly a network error or typo in domain name '+clubs[0].domain+'.');
      }
    )
  }

/*
https://demo.toastmost.org/wp-json/rsvptm/v1/mobile/1-xbIc3a00?ask=role_status&role=speaker

        if(isset($data) && isset($data->suggest))
        {
            $response['content'] = wpt_suggest_role(array('suggest_note'=>$data->note,'post_id'=>$post_id,'user_id'=>$data->suggest,'role'=>$data->role));
            return new WP_REST_Response($response,
            200);
        }
*/


  function getToastInfo() {
    if(message && message.includes('Checking with Toastmost World Headquarters'))
      return;
    fetch('https://toastmost.org/wp-json/toastmost/v1/mobileinfo?t='+timeNow+'&version='+version).then((res) => {
      if(res.ok) {
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
      setToastmostData(data);
    }   ).catch(
      (error) => {
        console.log('fetch error',error);
        setMessage('Unable to connect with Toastmost.org. Check your network connection');
      }
    )
  }

  function addClub (newclub) {
    newclub.url = 'https://'+newclub.domain+'/wp-json/rsvptm/v1/mobile/'+newclub.code;
    const newclubs = [newclub, ...clubs]
    setClubs(newclubs);
    setMessage('New club set to '+newclub.domain);
    router.replace('/');
  }

  function updateClub (input, name) {
    const update = {...club};
    update[name] = input;
    setClub(update);
  }

  function takeVoteCounter() {
    updateRole({ID:queryData.user_id,post_id:queryData.agendas[meeting].post_id,assignment_key:'_role_Vote_Counter_1',role:'Vote Counter'});
  }

  function updateRole(roleData) {
    console.log('updateRole roleData',roleData);
    const currentData = {...queryData};
    currentData.agendas[meeting].roles[roleData.index] = roleData;
    setAgenda(currentData.agendas[meeting]); /* optimistic update */
    setMessage('Updating ...');
    let queryString = '?language='+language;
    fetch(clubs[0].url+queryString, {method: 'POST', body: JSON.stringify(roleData)}).then((res) => res.json()).then((data) => {
      setMessage('');
      setQueryData(data);
      console.log('results of role update',data);
    }).catch((e) => {
      console.log('update error',e);
      setMessage('Data update error');
    })
  }

  function suggestTranslations(suggestions) {
    setMessage('Submitting suggested translations ...');
    let queryString = '?language='+language;
    fetch(clubs[0].url+queryString, {method: 'POST', body: JSON.stringify({suggestTranslations:suggestions})}).then((res) => res.json()).then((data) => {
      setMessage('');
      setQueryData(data);
      console.log('results of update',data);
    }).catch((e) => {
      console.log('update error',e);
      setMessage('Data update error');
    })
  }

  async function sendEmail(eclub) {
    setMessage('Requesting code ...');
    try {
      const response = await fetch(`https://${eclub.domain}/wp-json/rsvptm/v1/mobilecode/?t=${timeNow}&email=${encodeURIComponent(eclub.email)}`);
      console.log('sendEmail result', response);
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const data = await response.json();
      console.log('data from email request', data);
  
      if (data.success) {
        setMessage(`Code sent to ${eclub.email}`);
      } else if (data.status) {
        setMessage(data.status);
      } else {
        setMessage(`No code found for ${eclub.email}`);
      }
    } catch (error) {
      console.error('Error requesting code:', error);
      setMessage('Error requesting code. Check domain and email address and try again.');
    }
  }

  function emailAgenda(request) {
    setMessage('Emailing agenda ...');
    fetch(clubs[0].url, {method: 'POST', body: JSON.stringify(request)}).then((res) => res.json()).then((data) => {
      setMessage('');
      console.log('results of role update',data);
    }).catch((e) => {
      console.log('update error',e);
      setMessage('email agenda error');
    })
  }

  function absence(request) {
    setMessage('Updating planned absence ...');
    fetch(clubs[0].url, {method: 'POST', body: JSON.stringify(request)}).then((res) => res.json()).then((data) => {
      setMessage('');
      console.log('results of absence',data);
    }).catch((e) => {
      console.log('update error',e);
      setMessage('email agenda error');
    })
  }

  function getProgress(request) {
    fetch(clubs[0].url+'?language='+language+'&getprogress=1').then((res) => res.json()).then((data) => {
      setQueryData(data);
      setMessage('');
      console.log('results',data);
    }).catch((e) => {
      console.log('update error',e);
    })
  }

  function initAgendaPolling(currentClub) {
    console.log('current agendaPollingInterval',agendaPollingInterval);
    if(agendaPollingInterval) {
      const result = clearInterval(agendaPollingInterval);
      console.log('polling cleared',result);
    }
    if(!currentClub)
      return;
    console.log('initAgendaPolling for ',currentClub);
    getToastData(currentClub);
    const newInterval = setInterval(() => {
      if('active' == AppState.currentState) {
        getToastData(currentClub);
      }
      else {
        console.log('do not poll server for updates if not in foreground');
      }
    }, refreshTime);
    console.log('set pollingInterval',newInterval);
    setAgendaPollingInterval(newInterval);
  }

   return {setDefaultClub, toastmostData, getToastData, setReset, lastUpdate, setLastUpdate, refreshTime, version,pageUrl,
    addClub, updateClub, updateRole, sendEmail, takeVoteCounter, getAgenda, getCurrentClub, setMeeting, meeting, agenda, members, user_id, 
    emailAgenda, absence, saveLanguage, initAgendaPolling, suggestTranslations, getProgress, initToastmost};
}