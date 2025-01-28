import { Text, View, ScrollView, TextInput, Pressable, Image, AppState, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { Octicons } from '@expo/vector-icons'
import SelectDropdown from 'react-native-select-dropdown'
import styles from './styles'
import RenderHtml from 'react-native-render-html';
import EditContestants from './EditContestants';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function Voting({club, agenda, members, setScreen, post_id, userName, user_id, takeVoteCounter}) {

  const timeNow = new Date().getTime();
  const refreshTime = 30000; // 30 seconds
  const memberOptions = [{'value':'','label':'Select Member'}];
  const [lastUpdate, setLastUpdate] = useState(timeNow);
    const [pollingInterval, setPollingInterval] = useState(null);
    const [ballots, setBallots] = useState([]);
    const [ballotToUpdate, setBallotToUpdate] = useState('');
    const [newBallot, setNewBallot] = useState('');
    const [message, setMessage] = useState('');
    const [candidate, setCandidate] = useState(memberOptions[0]);
    const [candidates, setCandidates] = useState([{key:'speaker',label:'Speaker',options:[],signature:false},{key:'evaluator',label:'Evaluator',options:[],signature:false},{key:'tabletopics',label:'Table Topics',options:[],signature:false}]);
    const [contests, setContests] = useState(['speaker','evaluator','tabletopics']);
    const [contestLabels, setContestLabels] = useState(['Speaker','Evaluator','Table Topics']);
    const [voted,setVoted] = useState({});
    const [yesno,setYesno] = useState(false);
    const [checkForVotes,setCheckForVotes] = useState(false);
    const [signature,setSignature] = useState(false);
    const [controls,setControls] = useState(false);
    const [voteCount,setVoteCount] = useState('');
    const voteCounterRole = agenda.roles.find(role => role.assignment_key.includes('Vote_Counter'));
    const isVoteCounter = (voteCounterRole && voteCounterRole.ID == user_id);
    const contestUpdateIndex = contests.indexOf(ballotToUpdate);
    const { width } = useWindowDimensions();

    if(members && members.length)
    members.forEach(
      (member) => {
          memberOptions.push({value:member,label:member});
      }
    );

    if(('active' == AppState.currentState) && (timeNow > lastUpdate + (refreshTime * 2))) {
      setLastUpdate(timeNow);
      polling();//fresh update needed after app was out of focus
    }

    function vote(voteData) {
      const ts = new Date().getTime();
      const url = 'https://'+club.domain+'/wp-json/rsvptm/v1/regularvoting/'+post_id+'?mobile='+club.code+'&t='+ts;
      setMessage('Sending vote ...');
     fetch(url, {method: 'POST', body: JSON.stringify(voteData)}).then((res) => res.json()).then((data) => {
        setMessage('Vote sent '+voteData.key);
        setBallots(data.meetingvotes);
        setVoted(data.myvote);
    }).catch((e) => {
        console.log('update error',e);
        setMessage('Data update error');
      })
    }
  
    function polling() {
        if(pollingInterval)
          clearInterval(pollingInterval);
        setPollingInterval(setInterval(() => {
          if('active' == AppState.currentState) {
            setMessage('Checking server for ballots ...');
            getBallots();  
          }
          else {
            console.log('do not poll server for updates if not in foreground');
          }
        }, refreshTime)
        ) 
      }
    
      function getBallots() {
        const ts = new Date().getTime();
        const url = 'https://'+club.domain+'/wp-json/rsvptm/v1/regularvoting/'+post_id+'?mobile='+club.code+'&t='+ts;
        console.log('get ballots' + url);
        fetch(url).then((res) => {
          if(res.ok) {
            setMessage('');
            return res.json();
          }
          else {
            console.log('fetch not ok',res);
            if('401' == res.status)
            setMessage('Problem connecting to server.');
            else
            setMessage('Problem connecting, status code: '+res.status);
            if(pollingInterval)
              clearInterval(pollingInterval);  
          }
        }).then((data) => {
        const blankSlate = !ballots.length;
          setBallots(data.meetingvotes);
          setVoted(data.myvote);
          setVoteCount('<html><body>'+data.votecount+'</body></html>');
          console.log('data fetched');
          console.log('blankSlate',blankSlate);
        if(blankSlate) {
        //first time, set candidates to ballots
        const newcontests = [];
        const newContestLabels = [];
        data.meetingvotes.forEach(
          (ballot) => {
            newcontests.push(ballot.key);
            newContestLabels.push(ballot.label);
          }
        );
        newcontests.push('Table Topics');
        newContestLabels.push('Table Topics');
        if(data.meetingvotes.length) {
          setContests(newcontests);
          setContestLabels(newContestLabels);
          setCandidates(data.meetingvotes);  
          console.log('candidates based on ballots from server',data.meetingvotes);
          console.log('contests',newcontests);
          console.log('labels',newContestLabels);
        } else {
          const speakers = [];
          const evaluators = [];
          agenda.roles.forEach(
            (role) => {
                if('Speaker' == role.role) {
                  if(role.name) {
                    speakers.push(role.name);
                    console.log('add speaker from agenda',role.name);  
                  }
                }
                if('Evaluator' == role.role) {
                  if(role.name)
                  evaluators.push(role.name);
                }
            }        
          );
          let contestIndex;
          const candidatesCopy = {...candidates};
          if(speakers.length || evaluators.length) {
            contestIndex = contests.indexOf('speaker');
            candidatesCopy[contestIndex].options = speakers;
            contestIndex = contests.indexOf('evaluator');
            candidatesCopy[contestIndex].options = evaluators;
            setCandidates(candidatesCopy);
            console.log('candidates based on agenda',candidatesCopy);
          }
        }

        }//end blankslate
        }   ).catch(
          (error) => {
            console.log('fetch error',error);
            setMessage('Unable to connect. Possibly a network error or typo in domain name '+club.domain+'.');
          }
        )
      }

      useEffect(() => {
        getBallots();
        polling();
      }, [])

      function saveCandidates() {
        console.log('save candidates',candidates);
        const ts = new Date().getTime();
        const url = 'https://'+club.domain+'/wp-json/rsvptm/v1/regularvoting/'+post_id+'?mobile='+club.code+'&t='+ts;
        setMessage('Saving ballots ...');
        console.log('posting to '+url);
       fetch(url, {method: 'POST', body: JSON.stringify({candidates: candidates})}).then((res) => res.json()).then((data) => {
          console.log('data posted',candidates);
          console.log('data returned',data);
          setMessage('');
          setBallots(data.meetingvotes);
          setVoted(data.myvote);
      }).catch((e) => {
          console.log('update error',e);
          setMessage('Data update error');
        })
      }

      function summaryLine() {
        let output = '';
        contests.forEach(
          (contest, contestIndex) => {
            if(contestLabels[contestIndex])
              output += contestLabels[contestIndex];
            if(ballots[contestIndex] && ballots[contestIndex].options && ballots[contestIndex].options.length)
              output += ' ('+ballots[contestIndex].options.join(', ')+') ';
            else 
              output += ' (list not set) ';
          }
        );
        return <Text>{output}</Text>;
      }

      function SyncSpeechesEvaluators() {
        if(!ballots.length && candidates[1] && (candidates[0].options.length || candidates[1].options.length) )  {
          return <Pressable style={styles.addButton} onPress={() => {
            setBallots(candidates);
            saveCandidates();
          }}><Text style={styles.addButtonText}>Sync Speakers/Evaluators from Agenda</Text></Pressable>
        }
        return null
      } 
      
    return (
      <SafeAreaView style={{flex: 1}}>
        <View style={{flexDirection: 'row'}}>
            <Pressable onPress={() => { clearInterval(pollingInterval); setScreen(''); }} style={{ marginLeft: 10}}>
      <Octicons name="arrow-left" size={24} color='black' selectable={undefined} style={{ width: 24 }} />
      </Pressable>
      <Text style={{marginLeft: 20, fontSize: 20}}>Voting</Text>
      <Pressable onPress={() => { getBallots(); setMessage('Checking for updates ...'); }} style={{ marginLeft: 10 }}>
      <MaterialCommunityIcons name="refresh" size={24} color="black" /></Pressable>
      {isVoteCounter ? <><Pressable onPress={() => { setControls(true); }} style={{ marginLeft: 10 }}>
      <MaterialCommunityIcons name="ballot-outline" size={24} color="black" />
      </Pressable>
      <Pressable onPress={() => { setControls(false); }} style={{ marginLeft: 10 }}>
      <MaterialCommunityIcons name="vote" size={24} color="black" />
      </Pressable>
      <Pressable style={{ marginLeft: 10 }}
      onPress={() => {
        setControls(false);
        setCheckForVotes(true);
        getBallots();
      }}
      ><MaterialCommunityIcons name="poll" size={24} color="black" /></Pressable></> : null}
      </View>
      <Text style={{height: 15}}>{message}</Text>
      {!controls ? <Text style={{fontSize:30,borderTop:3,borderColor:'gray',marginTop:15}}>Voting <MaterialCommunityIcons name="vote" size={24} color="black" /></Text> : null}
      {isVoteCounter && controls ? <><Text style={{fontSize:30,borderTop:3,borderColor:'gray',marginTop:15}}>Vote Counter Controls <MaterialCommunityIcons name="ballot-outline" size={24} color="black" /></Text>
      <Text>Summary {summaryLine()}</Text>
      <SyncSpeechesEvaluators />
      <Text style={{paddingTop: 15, color: 'red'}}>Add or update ballot:</Text>
      <View style={{flexDirection: 'row', alignContent: 'center'}} ><SelectDropdown
        data={['choose ballot or "new"',...contests,'new']}
        defaultValue={ballotToUpdate ? ballotToUpdate : 'choose ballot or "new"'}
        onSelect={(selectedItem, index) => {
        setBallotToUpdate(selectedItem);
        }}
        renderButton={(selectedItem, isOpened) => {
          return (
            <View style={styles.dropdownButtonStyle}>
              <Octicons name="chevron-down" size={24} color='black' selectable={undefined} style={{ width: 24 }} />
              <Text style={styles.dropdownButtonTxtStyle}>
                {selectedItem && selectedItem}
              </Text>
            </View>
          );
        }}
        renderItem={(item, index, isSelected) => {
          return (
            <View key={index} style={{...styles.dropdownItemStyle, ...(isSelected && {backgroundColor: '#D2D9DF'})}}>
              <Text style={styles.dropdownItemTxtStyle}>{item}</Text>
            </View>
          );
        }}
        showsVerticalScrollIndicator={false}
        dropdownStyle={styles.dropdownMenuStyle}
      /></View></>
      : null}
 
      <ScrollView style={{margin: 10, paddingBottom: 10, flex: 1}}>
      {checkForVotes && <RenderHtml source={{'html':voteCount}} contentWidth={width - 10} />}
      {!controls && ballots.length ? ballots.map((ballot, ballotindex) => {
        if(!ballot.options.length) {
          return null;
        }
        
        return (
          <View key={'ballot'+ballotindex}>
            <Text style={{fontSize: 30}}>{ballot.label}</Text>
            {voted[ballot.key] ? <Text>Voted</Text> : ballot.options && ballot.options.map( (o, optindex) => {
              return (<Pressable key={'opt'+optindex} onPress={() => {
                setMessage('Vote for '+o+' for '+ballot.key );
                vote({vote:o,key:ballot.key,signature:(ballot.signature) ? userName : ''});
              }}>
                <Text style={{fontSize: 25, backgroundColor: 'black', border: 1, borderColor: 'black', color: 'white', margin: 5, marginLeft: 15, padding: 5, width: '60%'}}>{o}</Text>
              </Pressable>)
            }) }
            {ballot.signature ? <View><Text>Vote will be signed {userName}</Text></View> : null}
          </View>
      )
      })
      : null     
    }

      {isVoteCounter && controls && contestUpdateIndex > -1 ?  <><Text style={{fontSize: 25}}>Contestants: {contestLabels[contestUpdateIndex]}</Text>
      <EditContestants candidates={candidates} ballotContestants={ballots[contestUpdateIndex] && ballots[contestUpdateIndex].options ? ballots[contestUpdateIndex].options : [] } saveCandidates={saveCandidates} setCandidates={setCandidates} contestUpdateIndex={contestUpdateIndex} />
      {candidates[contestUpdateIndex]
    && <><Text style={{fontSize: 20}}>Add Contestant: {contestLabels[contestUpdateIndex]}</Text>
       <View style={{flexDirection:'row'}}><Text style={{paddingTop:20}}>Select:</Text>
       <SelectDropdown
      data={memberOptions}
      defaultValue={candidate}
      onSelect={(selectedItem, index) => {
      console.log('selected item',selectedItem);
      //setCandidate(selectedItem);
      const newcandidates = [...candidates];
      newcandidates[contestUpdateIndex].options.push(selectedItem.value);
      setCandidates(newcandidates);
      setCandidate(memberOptions[0]);
      }}
      renderButton={(selectedItem, isOpened) => {
        return (
          <View style={styles.dropdownButtonStyle}>
            <Octicons name="chevron-down" size={24} color='black' selectable={undefined} style={{ width: 24 }} />
            <Text style={styles.dropdownButtonTxtStyle}>
              {selectedItem && selectedItem.label}
            </Text>
          </View>
        );
      }}
      renderItem={(item, index, isSelected) => {
        return (
          <View key={index} style={{...styles.dropdownItemStyle, ...(isSelected && {backgroundColor: '#D2D9DF'})}}>
            <Text style={styles.dropdownItemTxtStyle}>{item.label}</Text>
          </View>
        );
      }}
      showsVerticalScrollIndicator={false}
      dropdownStyle={styles.dropdownMenuStyle}
    /></View>
      <Text>or enter below and click Add</Text>
      <TextInput
      style={styles.input}
      autoCorrect={false}
      placeholder="Name or choice"
      placeholderTextColor="gray"
      value={candidate.value}
      onChangeText={(input) => {
      setCandidate({label:input,value:input})
      }}
     />
      <Pressable style={styles.addButton}
      onPress={() => {
        const newcandidates = [...candidates];
        newcandidates[contestUpdateIndex].options.push(candidate.value);
        setCandidates(newcandidates);
        setCandidate(memberOptions[0]);
      }}
      ><Text style={styles.addButtonText}>Add</Text></Pressable>
    </>
   }
    </> : null}
    {isVoteCounter && ballotToUpdate == 'new' ? 
    <View><Text>New Ballot</Text>
      <TextInput
      style={styles.input}
      autoCorrect={false}
      placeholder="Role or Question"
      placeholderTextColor="gray"
      value={newBallot}
      onChangeText={(input) => {
      setNewBallot(input)
      }} />
      <View style={{flexDirection:'row', margin: 5}} >
        <Pressable onPress={() => {setYesno(true)} } style={{padding: 5, backgroundColor: yesno ? 'black' : 'gray',marginRight: 10}}><Text style={{color:'white'}}>Yes/No</Text>
        </Pressable>
        <Pressable onPress={() => {setYesno(false)} } style={{padding: 5, backgroundColor: !yesno ? 'black' : 'gray'}}><Text style={{color:'white'}}>Multiple Choice</Text>
        </Pressable>
      </View>
      <View style={{flexDirection:'row', margin: 5}} >
        <Pressable onPress={() => {setSignature(true)} } style={{padding: 5, backgroundColor: signature ? 'black' : 'gray',marginRight: 10}}><Text style={{color:'white'}}>Signature Required</Text>
        </Pressable>
        <Pressable onPress={() => {setSignature(false)} } style={{padding: 5, backgroundColor: !signature ? 'black' : 'gray'}}><Text style={{color:'white'}}>No Signature</Text>
        </Pressable>
      </View>
     <Pressable style={styles.addButton}
      onPress={() => {
        const newcandidates = [...candidates];
        const key = newBallot.toLowerCase().replaceAll(/[^a-z0-9]/g,'');
        const newballot = {label:newBallot,key:key,options:(yesno) ? ['Yes','No'] : [],signature:signature};
        setSignature(false);
        console.log('newballot',newballot);
        newcandidates.push(newballot);
        const newcontests = [...contests];
        newcontests.push(key);
        const newContestLabels = [...contestLabels];
        newContestLabels.push(newBallot);
        console.log('newcontests',newcontests);
        console.log('newlabels',newContestLabels);
        setCandidates(newcandidates);
        setContests(newcontests);
        setContestLabels(newContestLabels);
        setNewBallot('');
        setBallotToUpdate(key);
      }}
      ><Text style={styles.addButtonText}>Add Ballot</Text></Pressable>
    </View>
    : null}
 
 {isVoteCounter && (controls || checkForVotes) ? <Pressable style={[styles.addButton,{marginTop: 10}]}
      onPress={() => {
        setCheckForVotes(!checkForVotes);
        getBallots();
      }}
      ><Text style={styles.addButtonText}>{checkForVotes ? 'Stop Check for Votes' : 'Check for Votes'}</Text></Pressable>
    : null}

    {!voteCounterRole || !voteCounterRole.ID ? <><Text>No Vote Counter Assigned</Text>
      <Pressable style={styles.addButton} onPress={() => {
        setControls(true);
        takeVoteCounter();
        setMessage('Updating role');
        getBallots();
      }}>
      <Text style={styles.addButtonText}>Take Over</Text></Pressable></> 
      : null}
    {voteCounterRole && voteCounterRole.ID && !isVoteCounter ? 
    <><Text>Vote Counter: {voteCounterRole.name}</Text>{!ballots.length ? 
      <Pressable style={styles.addButton} onPress={() => {
        setControls(true);
        takeVoteCounter();
        setMessage('Updating role');
        getBallots();
}}>
      <Text style={styles.addButtonText}>Take Over</Text></Pressable> : null
      }</>
       : null}

    </ScrollView>
    </SafeAreaView>
    )
}