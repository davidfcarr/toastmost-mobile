import {useState, useEffect} from 'react';
import {AppState,Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import useClubMeetingStore from './store';
import * as Linking from 'expo-linking';
import { translateTerm } from './TranslatedText';

function makeClubUrl(domain, code) {
  return 'https://' + domain + '/wp-json/rsvptm/v1/mobile/' + code;
}

function haveClubsChanged(currentClubs, nextClubs) {
  if(currentClubs.length !== nextClubs.length) {
    return true;
  }
  return currentClubs.some((club, index) => {
    const nextClub = nextClubs[index] || {};
    return club.domain !== nextClub.domain || club.code !== nextClub.code || club.url !== nextClub.url;
  });
}

function haveDomainsChanged(currentDomains, nextDomains) {
  if(currentDomains.length !== nextDomains.length) {
    return true;
  }
  return currentDomains.some((domain, index) => domain !== nextDomains[index]);
}

function normalizeDomains(domains = []) {
  const seen = new Set();
  return domains
    .filter((domain) => typeof domain === 'string')
    .map((domain) => domain.trim())
    .filter((domain) => {
      if(!domain || seen.has(domain)) {
        return false;
      }
      seen.add(domain);
      return true;
    });
}

function mergeClubAccess(currentClubs, activeClub, otherDomains = [], accessCode = '', excludedDomains = []) {
  if(!activeClub || !activeClub.domain) {
    return currentClubs;
  }

  const blockedDomains = new Set(normalizeDomains(excludedDomains));
  const siblingDomains = new Set(
    [activeClub.domain, ...((Array.isArray(otherDomains) ? otherDomains : []).filter((domain) => typeof domain === 'string'))]
      .map((domain) => domain.trim())
      .filter((domain) => domain && !blockedDomains.has(domain))
  );
  const sharedCode = accessCode || activeClub.code;
  if(!sharedCode) {
    return currentClubs;
  }

  const merged = [];
  const seen = new Set();

  function pushClub(club, forceSharedCode = false) {
    if(!club || typeof club.domain !== 'string') {
      return;
    }
    const domain = club.domain.trim();
    if(!domain || seen.has(domain)) {
      return;
    }
    const code = forceSharedCode ? sharedCode : (club.code || sharedCode);
    if(!code) {
      return;
    }
    merged.push({
      ...club,
      domain,
      code,
      url: makeClubUrl(domain, code),
    });
    seen.add(domain);
  }

  pushClub(activeClub, true);
  currentClubs.forEach((club) => {
    pushClub(club, siblingDomains.has(club.domain.trim()));
  });
  siblingDomains.forEach((domain) => {
    pushClub({domain}, true);
  });

  return merged;
}

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
    const {queryData, setQueryData,clubs, setClubs, excludedDomains, setExcludedDomains, meeting, setMeeting,agenda,setAgenda, message, setMessage, language, setLanguage, nextUpdate, setNextUpdate, setNewsite} = useClubMeetingStore();
    const url = Linking.useURL();
    const appActive = AppState.currentState == 'active';

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
        jsonValue = await AsyncStorage.getItem("excludedDomains")
        const storedExcludedDomains = jsonValue != null ? JSON.parse(jsonValue) : null
        if (Array.isArray(storedExcludedDomains)) {
          setExcludedDomains(normalizeDomains(storedExcludedDomains));
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

  const storeExcludedDomains = async () => {
    try {
      const jsonValue = JSON.stringify(excludedDomains)
      await AsyncStorage.setItem("excludedDomains", jsonValue)
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
    getToastData(clubs[0],'useEffect clubs list changed');
  }, [clubs])

  useEffect(() => {
    storeExcludedDomains();
  }, [excludedDomains])

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
      console.log('set agenda for '+meeting+'of '+queryData.agendas.length);
    }
    else
      return;
    setMembers(queryData.members);
    setUserId(queryData.user_id);
  }, [clubs, queryData])

  function getCurrentClub() { return (clubs && clubs.length) ? clubs[0] : null; }

  function getToastData(currentClub, context = '') {
    console.log('getToastData called from '+context+' for ',currentClub);
    if(!currentClub || !currentClub.url) {
      return;
    }
    if(currentClub.domain != clubs[0].domain)
      return getToastData(clubs[0],'inside getToastData, domain not matching');
    console.log('getToastData currentClub domain',currentClub.domain);
    console.log('getToastData clubs[0] domain',clubs[0].domain);
    if(message && message.includes('Updating ...'))
      return;
    let queryString = currentClub.url+'?language='+language;
    if(sendPlatform)
    {
      queryString += '&mobileos='+Platform.OS;/*+'&language=fr_FR';*/
      setSendPlatform(false);
    }
    console.log('getToastData query',queryString);
    fetch(queryString).then((res) => {
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
      if(data.domain != clubs[0].domain) {
        return getToastData(clubs[0],'returned data domain not matching');
      }
      const mergedClubs = mergeClubAccess(clubs, currentClub, data.other_domains, currentClub.code || data.code, excludedDomains);
      if(haveClubsChanged(clubs, mergedClubs)) {
        setClubs(mergedClubs);
      }
      setLastUpdate(timeNow);
      setQueryData(data);
      console.log('clear newsite after successful update');
      setNewsite('');
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
    newclub.url = makeClubUrl(newclub.domain, newclub.code);
    const normalizedDomain = newclub.domain.trim();
    const nextExcludedDomains = excludedDomains.filter((domain) => domain !== normalizedDomain);
    if(haveDomainsChanged(excludedDomains, nextExcludedDomains)) {
      setExcludedDomains(nextExcludedDomains);
    }
    const newclubs = mergeClubAccess(clubs, newclub, [], newclub.code, nextExcludedDomains);
    setClubs(newclubs);
    setMessage('New club set to '+newclub.domain);
    router.replace('/');
  }

  function removeClub (domainToRemove) {
    const normalizedDomain = domainToRemove.trim();
    const nextClubs = clubs.filter((club) => club.domain.trim() !== normalizedDomain);
    setClubs(nextClubs);
    const nextExcludedDomains = normalizeDomains([...excludedDomains, normalizedDomain]);
    if(haveDomainsChanged(excludedDomains, nextExcludedDomains)) {
      setExcludedDomains(nextExcludedDomains);
    }
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
      if(data.taken) /* if someone else got there first */
        setMessage(translateTerm('Role already taken') + ': '+ data.taken);
      else
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

  async function absence(request) {
    setMessage('Updating planned absence ...');
    try {
      const postId = request?.post_id || queryData?.agendas?.[meeting]?.post_id || queryData?.post_id;
      const actingUserId = request?.user_id || queryData?.user_id;
      const mutationBody = {...request};
      delete mutationBody.post_id;
      delete mutationBody.user_id;

      const clubDomain = clubs?.[0]?.domain || queryData?.domain;
      const endpoint = `https://${clubDomain}/wp-json/rsvptm/v1/absences?post_id=${encodeURIComponent(postId || '')}&user_id=${encodeURIComponent(actingUserId || '')}&_locale=user`;
      let data;

      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(mutationBody),
        });
        if(!res.ok) {
          throw new Error('absence endpoint status ' + res.status);
        }
        data = await res.json();
      } catch (endpointError) {
        // Keep legacy support while clubs migrate to the new endpoint.
        console.log('absence endpoint failed, trying legacy route', endpointError);
        const legacyRes = await fetch(clubs[0].url, {method: 'POST', body: JSON.stringify(request)});
        data = await legacyRes.json();
      }

      console.log('results of absence',data);
      setMessage('');
      if (clubs[0]?.url) {
        getToastData(clubs[0], 'absence update');
      }
      return data;
    } catch (e) {
      console.log('update error',e);
      setMessage('Unable to update planned absence');
      return null;
    }
  }

  async function fetchAbsences(request = {}) {
    try {
      const postId = request?.post_id || queryData?.agendas?.[meeting]?.post_id || queryData?.post_id;
      const actingUserId = request?.user_id || queryData?.user_id;
      const clubDomain = clubs?.[0]?.domain || queryData?.domain;

      if(!clubDomain || !postId || !actingUserId) {
        return null;
      }

      const endpoint = `https://${clubDomain}/wp-json/rsvptm/v1/absences?post_id=${encodeURIComponent(postId)}&user_id=${encodeURIComponent(actingUserId)}&_locale=user`;
      const res = await fetch(endpoint);
      if(!res.ok) {
        throw new Error('fetchAbsences status ' + res.status);
      }
      return await res.json();
    } catch (error) {
      console.log('fetch absences error', error);
      return null;
    }
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

  function resetClubData(newclub = null) {
    console.log('reset newsite',newclub);
    if(newclub.domain) {
      setNewsite(newclub.domain);
      setQueryData({siteName:newclub.domain});  
    }
    if(newclub && newclub.domain) {
      setMessage('Downloading data for '+newclub.domain);
      router.replace('/');
    }
  }
      
   return {setDefaultClub, toastmostData, getToastData, setReset, lastUpdate, setLastUpdate, refreshTime, version,pageUrl,
    addClub, removeClub, updateClub, updateRole, sendEmail, takeVoteCounter, getAgenda, getCurrentClub, agenda, members, user_id, 
    emailAgenda, absence, fetchAbsences, saveLanguage, suggestTranslations, getProgress, initToastmost, appActive, resetClubData};
}