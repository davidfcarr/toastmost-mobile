import {useState, useEffect} from 'react';
import {AppState} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import useClubMeetingStore from './store';

export default function useAgenda() {
    //const [meeting, setMeeting] = useState(0);
    //const [clubs, setClubs] = useState([]);
    const [toastmostData, setToastmostData] = useState({});
    const [reset, setReset] = useState(false);
    const [message, setMessage] = useState('');
    const [lastUpdate, setLastUpdate] = useState(Date.now());
    const refreshTime = 60000;
    const version = '1.0.0';
    const timeNow = Date.now();
    const [members, setMembers] = useState([]);
    const [user_id, setUserId] = useState(0);
    const [pollingInterval, setPollingInterval] = useState(null);
    const {queryData, setQueryData,clubs, setClubs, meeting, setMeeting,agenda,setAgenda} = useClubMeetingStore();

  function setDefaultClub(index) 
  {
    const defaultClub = clubs[index];
    console.log('setDefaultClub',defaultClub);
    console.log('setDefaultClub clubs',clubs);
    const clubsCopy = [...clubs];
    clubsCopy.splice(index,1);
    clubsCopy.unshift(defaultClub);
    console.log('setDefaultClub clubsCopy',clubsCopy);
    setClubs(clubsCopy);
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
        if (!clubs.length && storageClubs && storageClubs.length) {
          console.log('setting clubs from storage',storageClubs);
          setClubs(storageClubs)
        }
      } catch (e) {
        console.error(e)
      }
    }
    fetchData();
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
    if('' == message)
      return;
    console.log('set message to expire',message);
    setTimeout(() => {
      console.log('clearing message '+message);
      setMessage('');
    },30000);
  }, [message])

  function getAgenda() {
    if(queryData && queryData.agendas && queryData.agendas.length) {
      return queryData.agendas[meeting];
    }
  }

  useEffect(() => {
    if(queryData.agendas && queryData.agendas.length) {
      setAgenda(queryData.agendas[meeting]);
    }
    setMembers(queryData.members);
    setUserId(queryData.user_id);
  }, [clubs, queryData])

  function getCurrentClub() { console.log('getCurrentClubs',clubs); return (clubs && clubs.length) ? clubs[0] : null; }

  function getToastData(currentClub) {
    console.log('getToastData called',currentClub);
    if(!currentClub || !currentClub.url) {
      return;
    }
    if(message && message.includes('Updating ...'))
      return;
    fetch(currentClub.url).then((res) => {
      if(res.ok) {
        console.log('getToastData fetch connection ok');
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
      setQueryData(data);
      setAgenda(data.agendas[meeting]);
    }).catch(
      (error) => {
        console.log('fetch error',error);
        setMessage('Unable to connect. Possibly a network error or typo in domain name '+clubs[0].domain+'.');
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
    console.log('addClub',newclub);
    console.log('addClub clubs before',clubs);
    const newclubs = [newclub, ...clubs]
    setClubs(newclubs);
    console.log('addClub newclubs',newclubs);
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
    const currentData = {...queryData};
    currentData.agendas[meeting].roles[roleData.index] = roleData;
    setQueryData(currentData);
    setMessage('Updating ...');
    console.log('Updating '+clubs[0].url);
    console.log('roledata',roleData);
    fetch(clubs[0].url, {method: 'POST', body: JSON.stringify(roleData)}).then((res) => res.json()).then((data) => {
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

   return {clubs, setClubs, setDefaultClub, queryData, setQueryData, toastmostData, message, setMessage, getToastData, setReset, lastUpdate, setLastUpdate, refreshTime, version, 
    addClub, updateClub, updateRole, sendEmail, takeVoteCounter, getAgenda, getCurrentClub, setMeeting, meeting, agenda, members, user_id, pollingInterval, setPollingInterval, setAgenda};
}