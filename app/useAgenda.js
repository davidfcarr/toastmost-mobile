import {useState, useEffect,useContext} from 'react';
import {AppState} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ClubContext } from './ClubContext';
import { router } from 'expo-router';

export default function useAgenda() {
    const [clubs, setClubs] = useState([]);
    const [queryData, setQueryData] = useState({});
    const [toastmostData, setToastmostData] = useState({});
    const [message, setMessage] = useState('');
    const [reset, setReset] = useState(false);
    const [pollingInterval, setPollingInterval] = useState(null);
    const [timeNow, setTimeNow] = useState(Date.now());
    const [lastUpdate, setLastUpdate] = useState(Date.now());
    const refreshTime = 60000;
    const version = '1.0.0';
    const context = useContext(ClubContext);
    const {club, setClub, meeting, setMeeting, setAgenda, members, setMembers, user_id, setUserId} = context;

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
    if(!clubs.length && !reset) {
      return;
    }
    storeData();
    if(reset) {
      setReset(false);
    }
  }, [clubs])

  useEffect(() => {
    if(queryData.agendas && queryData.agendas.length)
    setAgenda(queryData.agendas[meeting]);
    setMembers(queryData.members);
    setUserId(queryData.user_id);
  }, [club, meeting, queryData])

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
        router.replace('/');
      }
    }, [club]
  )

  function addClub (newclub) {
    newclub.url = 'https://'+newclub.domain+'/wp-json/rsvptm/v1/mobile/'+newclub.code;
    console.log('addClub',newclub);
    console.log('addClub clubs before',clubs);
    const newclubs = [newclub, ...clubs]
    setClubs(newclubs);
    setClub(newclub);
    console.log('addClub newclubs',newclubs);
    setMessage('New club set to '+newclub.domain);
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

   return {clubs, setClubs, queryData, setQueryData, toastmostData, message, setMessage, reset, setReset, timeNow, setTimeNow, lastUpdate, setLastUpdate, refreshTime, version, 
    addClub, updateClub, updateRole, sendEmail, takeVoteCounter};
}