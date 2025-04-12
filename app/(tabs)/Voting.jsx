import { Text, View, ScrollView, TextInput, Pressable, Image, AppState, useWindowDimensions, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useEffect, useCallback } from "react";
import { Octicons } from '@expo/vector-icons'
import SelectDropdown from 'react-native-select-dropdown'
import styles from '../styles'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import useAgenda from '../useAgenda';
import BrandHeader from "../BrandHeader";
import useClubMeetingStore from "../store";
import RenderHtml from 'react-native-render-html';
import { useFocusEffect } from 'expo-router';
import { ErrorBoundaryProps } from 'expo-router';
import * as Linking from 'expo-linking';
import TranslatedText, {translateTerm} from '../TranslatedText'; /* <TranslatedText term="" /> */

export function ErrorBoundary({ error, retry }) {
  return (
  <SafeAreaView>
    <View>
    <Text style={{color:'red'}}>{error.message}</Text>
    <Pressable onPress={retry} style={{backgroundColor:'black',padding: 10, borderRadius: 5, margin: 10}}><Text style={{color:'white'}}>Try Again?</Text></Pressable>
    <Text>Try navigating to the <Link href="/Settings"  style={{textDecorationLine: 'underline'}}>Settings</Link> screen.</Text>
  </View>
</SafeAreaView>
  );
}

export default function Voting(props) {
  const {user_id, reset, pageUrl, initToastmost, appActive} = useAgenda();
  const {clubs, meeting, queryData, agenda, message, setMessage} = useClubMeetingStore();
  const club = (clubs && clubs.length) ? clubs[0] : {};
  const [votingdata,setVotingdata] = useState({});
  const memberDefault = {'value':'','label':'Select Member'};
  const [candidate, setCandidate] = useState(memberDefault);
  const [yesno,setYesno] = useState(false);
  const [signature,setSignature] = useState(false);
  const [controls,setControls] = useState('');
  const [guest,setGuest] = useState('');
  const [newBallot,setNewBallot] = useState('');
  const [everyMeeting,setEveryMeeting] = useState(false);
  const [signatureRequired,setSignatureRequired] = useState(false);
  const [votesToAdd,setVotesToAdd] = useState(false);
  const [pollingInterval,setPollingInterval] = useState(null);
  const { width } = useWindowDimensions();
  const [appIsReady, setAppIsReady] = React.useState(false);
  const identifier = club.code;
  const [nextCheck, setNextCheck] = useState(0);

  useEffect(
    () => {
      if(!clubs || !clubs.length) {
        console.log('trying to initialize');
        initToastmost();
        return;
      }
      if(Date.now() > nextCheck){
        setNextCheck(Date.now() + 60000);
        getBallots();  
      }
}, []);

  if(Date.now() > nextCheck && pageUrl.includes('Voting') && appActive) {
    setNextCheck(Date.now() + 60000);
    getBallots();
  }

      function getBallots() {
        console.log('get ballots called for agenda',queryData.agendas);
        if(!agenda || !agenda.post_id)
          return null;
        const ts = new Date().getTime();
        const url = 'https://'+club.domain+'/wp-json/rsvptm/v1/regularvoting/'+agenda.post_id+'?mobile='+club.code+'&t='+ts;
        setMessage('Checking for ballots ...');
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
          }
        }).then((data) => {
          console.log('getBallots data',data);
          setVotingdata(data);
          setAppIsReady(true);
    }   ).catch(
          (error) => {
            console.log('fetch error',error);
            setMessage('Unable to connect. Possibly a network error or typo in domain name '+club.domain+'.');
          }
        )
      }

  function sendVotingUpdate(update) {
    const ts = new Date().getTime();
    const url = 'https://'+club.domain+'/wp-json/rsvptm/v1/regularvoting/'+agenda.post_id+'?mobile='+club.code+'&t='+ts;
    fetch(url, {method: 'POST', body: JSON.stringify(update)}).then((res) => res.json()).then((data) => {
      setMessage('');
      setVotingdata(data);
      console.log('results of voting update',data);
    }).catch((e) => {
      console.log('update error',e);
      setMessage('Data update error');
    })    
  }

function sendBallotLink(toWho) {
  console.log('sendBallotLink',toWho);
    fetch(clubs[0].url, {method: 'POST', body: JSON.stringify({sendBallot:toWho,post_id:agenda.post_id})}).then((res) => res.json()).then((data) => {
        setMessage('Sent ballot link to '+toWho+' by email');
      }).catch((e) => {
        console.log('update error',e);  
        setMessage('Error sending message '+e.message);
      })  
}


  if (!clubs || !clubs.length) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View>
          <BrandHeader />
          <Text>The voting tool requires a connection to a Toastmost (or compatible) club website. See the Settings tab.</Text>
        </View>
      </SafeAreaView>
    );
  }

  console.log('voting appIsReady',appIsReady);
  console.log('voting data',votingdata);
  
  if (!appIsReady || !votingdata.ballot) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View>
          <BrandHeader />
          <Text>Voting tool loading ...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const contestlist = Object.keys(votingdata.ballot);

  if (votingdata.is_vote_counter && 'check' == controls) {

    const source = (votingdata.votecount) ? {'html':'<html><body>'+votingdata.votecount+'</body></html>'} : {};
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView>
          <View>
            <BrandHeader {...queryData} {...agenda} />
            <View style={{ flexDirection: 'row' }}>
              <Pressable onPress={() => { setControls('setup'); }} style={{ marginLeft: 10 }}>
                <MaterialCommunityIcons name="ballot-outline" size={24} color="black" />
              </Pressable>
              <Pressable onPress={() => { setControls('vote'); }} style={{ marginLeft: 10 }}>
                <MaterialCommunityIcons name="vote" size={24} color="black" />
              </Pressable>
              <Pressable style={{ marginLeft: 10 }} onPress={() => { setControls('results'); }}>
                <MaterialCommunityIcons name="chart-bar" size={24} color="black" />
              </Pressable>
              <Pressable onPress={() => { getBallots(); setMessage('Checking for updates ...'); }} style={{ marginLeft: 10 }}>
              <MaterialCommunityIcons name="refresh" size={24} color="black" />
              </Pressable>
            </View>
<RenderHtml source={source} contentWidth={width - 20} />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if(votingdata.is_vote_counter && 'vote' != controls) {
      return (
        <SafeAreaView style={{flex:1, paddingLeft: 10, paddingRight: 10}} >
          <ScrollView>
          <View>
          <BrandHeader {...queryData} {...agenda} />
              <Text style={styles.h1}><TranslatedText term="Vote Counter's Tool" /></Text>
              <View style={{flexDirection: 'row'}}>
        <Pressable onPress={() => { setControls('setup'); }} style={{ marginLeft: 10 }}>
      <MaterialCommunityIcons name="ballot-outline" size={24} color="black" />
      </Pressable>
          <Pressable onPress={() => { setControls('vote'); }} style={{ marginLeft: 10 }}>
        <MaterialCommunityIcons name="vote" size={24} color="black" />
        </Pressable>
        <Pressable style={{ marginLeft: 10 }}
        onPress={() => {
          setControls('check');
          getBallots();
        }}
        >
        <MaterialCommunityIcons name="poll" size={24} color="black" /></Pressable>
        <Pressable onPress={() => { getBallots(); setMessage('Checking for updates ...'); }} style={{ marginLeft: 10 }}>
        <MaterialCommunityIcons name="refresh" size={24} color="black" /></Pressable>
        </View>
        <Text>As the Vote Counter, you create ballots based on the speakers and evaluators on the agenda, editing them as necessary.</Text>
              <Text>You can also create ballots for Table Topics speakers and votes on club business.</Text>
              {contestlist.map(
                (c, cindex) => {
                    if(('Template' == c) || ('C' == c) || ('c' == c))
                        return;
                    const currentBallot = votingdata.ballot[c];
                    console.log('currentBallot key',c);
                    console.log('currentBallot',currentBallot);
                    if(!currentBallot || !currentBallot.contestants)
                      return;
                    return <View key={'contest'+cindex}>
                        <Text style={styles.h2}>{c}</Text>
                        {currentBallot.contestants.map((contestant,index) => {return <View style={styles.choice}  key={'contestant'+index}>
                        <Pressable style={styles.minusbutton} onPress={() => {currentBallot.deleted.push(contestant);currentBallot.contestants.splice(index,1); const ballotCopy = {...votingdata.ballot,c:currentBallot}; ballotCopy[c].status = 'draft'; console.log('altered ballot',ballotCopy[c]); setVotingdata({...votingdata,ballot:ballotCopy}); }}><Text style={styles.buttonText}>-</Text></Pressable>
                         <Text style={styles.choiceText}>{contestant}</Text></View>})}
                        {currentBallot.new.length ? <View><Text>Confirm roles from the agenda:</Text>{
                        currentBallot.new.map((maybecontestant,index) => {if(!maybecontestant) return; 
                        return <View style={styles.choice} key={'pending'+index}>
                        <Pressable style={styles.plusbutton} onPress={() => {currentBallot.contestants.push(maybecontestant);currentBallot.new.splice(index,1); const ballotCopy = {...votingdata.ballot,c:currentBallot}; ballotCopy[c].status = 'draft'; console.log('altered ballot',ballotCopy[c]);  setVotingdata({...votingdata,ballot:ballotCopy}); }}><Text style={styles.buttonText}>+</Text></Pressable> 
                        <Text style={styles.choiceText}>{maybecontestant}</Text></View>})}</View> : null}
                        
                        {currentBallot.deleted.length ? <View><Text>Deleted:</Text>{currentBallot.deleted.map((deletedcontestant,index) => {return (<View key={'deleted'+index} style={styles.choice}>
                          <Pressable style={styles.plusbutton} onPress={() => {currentBallot.contestants.push(deletedcontestant);currentBallot.deleted.splice(index,1); const ballotCopy = {...votingdata.ballot,c:currentBallot}; ballotCopy[c].status = 'draft'; console.log('altered ballot',ballotCopy[c]); setVotingdata({...votingdata,ballot:ballotCopy}); }}><Text style={styles.buttonText}>+</Text></Pressable>
                           <Text style={{textDecorationLine:'line-through',fontSize:30}}>{deletedcontestant}</Text></View>)})}</View> : null}
                        <View style={{padding: 10}}>
                        <Text>Pick from List</Text> 
                        <SelectDropdown
        data={[memberDefault,...votingdata.memberlist]}
        defaultValue={candidate}
        onSelect={(selectedItem, index) => {
          const choice = selectedItem.value;
          console.log('add on select',choice); currentBallot.contestants.push(choice); const ballotCopy = {...votingdata.ballot,c:currentBallot}; ballotCopy[c].status = 'draft'; console.log('altered ballot',ballotCopy[c]);  setVotingdata({...votingdata,ballot:ballotCopy});
          sendVotingUpdate({ballot:ballotCopy,post_id:agenda.post_id,identifier:identifier});
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
      />
      <TranslatedText term="Or Type Choice" />    
        <View style={{display: 'flex',flexDirection:'row',alignContent:'left'}}><View style={{width: '90%'}}><TextInput style={styles.input} label="Type Choice to Add" value={guest} onChangeText={ (value) => { console.log('text entry value',value); setGuest(value); } } /></View>
        <View ><Pressable style={styles.plusbutton} onPress={() => {currentBallot.contestants.push(guest); setGuest(''); const ballotCopy = {...votingdata.ballot,c:currentBallot}; ballotCopy[c].status = 'draft'; console.log('altered ballot',ballotCopy[c]);  setVotingdata({...votingdata,ballot:ballotCopy});
      sendVotingUpdate({ballot:ballotCopy,post_id:agenda.post_id,identifier:identifier});
      }}><Text style={styles.buttonText}>+</Text></Pressable></View></View>
      </View>                    
                        {currentBallot.status == 'publish' ? <View><Text><Pressable style={styles.button} onPress={() => { const update = {...currentBallot,status:'draft'}; const bigUpdate = {...votingdata.ballot}; bigUpdate[c] = update; console.log('ballot update for '+c,bigUpdate); sendVotingUpdate({ballot:bigUpdate,post_id:agenda.post_id,identifier:identifier});} }><Text style={styles.buttonText}>Unpublish</Text></Pressable></Text></View> 
                        : <Text><Pressable style={styles.button} onPress={() => { const update = {...currentBallot,status:'publish'}; const bigUpdate = {...votingdata.ballot}; bigUpdate[c] = update; console.log('ballot update for '+c,bigUpdate); sendVotingUpdate({ballot:bigUpdate,post_id:agenda.post_id,identifier:identifier});} }><Text style={styles.buttonText}>Publish</Text></Pressable></Text>}
                    </View>
                }
            )}
            <Text style={styles.h2}><TranslatedText term='New Ballot' /></Text>
            <View style={{width:'90%'}}><TextInput style={styles.input} label="Contest or Question" value={newBallot} onChangeText={ (value) => { setNewBallot(value); } } /></View><View></View>
            <View style={{flexDirection: 'row'}}><Switch
        trackColor={{ false: "#767577", true: "#81b0ff" }}
        thumbColor={everyMeeting ? "#f5dd4b" : "#f4f3f4"}
        ios_backgroundColor="#3e3e3e"
        onValueChange={() => {setEveryMeeting(previousState => !previousState)}}
        value={everyMeeting}
      /><TranslatedText term='Include for every meeting' /></View>
            <View style={{flexDirection: 'row'}}><Switch
        trackColor={{ false: "#767577", true: "#81b0ff" }}
        thumbColor={signatureRequired ? "#f5dd4b" : "#f4f3f4"}
        ios_backgroundColor="#3e3e3e"
        onValueChange={() => {setSignatureRequired(previousState => !previousState)}}
        value={signatureRequired}
      /><Text>Signature required (example: voting in a new member).</Text></View>
      <Pressable style={styles.button} onPress={
        () => {const newBallotEntry = {...votingdata.ballot}; newBallotEntry[newBallot] = {...votingdata.ballot.Template,everyMeeting:everyMeeting,signature_required:signatureRequired}; 
        setVotingdata({...votingdata,ballot:newBallotEntry}); 
        sendVotingUpdate({ballot:newBallotEntry,post_id:agenda.post_id,identifier:identifier});
        setNewBallot(''); setSignatureRequired(false); setEveryMeeting(false);}}>
          <Text style={styles.buttonText}>Add Ballot</Text></Pressable>
            {contestlist.map(
                (c, cindex) => {
                    if(('Template' == c) || ('C' == c) || ('c' == c))
                        return;
                    const currentBallot = votingdata.ballot[c];
                    if(currentBallot.status != 'publish')
                        return;
                    const added_votes = [...votingdata.added_votes];
                    return <View key={'contestadd'+cindex}>
                        <Text style={styles.h2}>Add Votes: {c}</Text>
                        <Text>If you received votes from outside of this app, you can add them here.</Text>
                        {currentBallot.contestants.map((contestant,index) => {if(!contestant || contestant.trim() == '') return; console.log('contestant for '+c,contestant); let addvote = added_votes.find((item,itemindex) => {if(item.ballot == c && item.contestant == contestant) {item.index = itemindex; return item;} }); if(!addvote) {addvote = {'ballot':c,'contestant':contestant,add:0,index:added_votes.length}; added_votes.push(addvote); console.log('created addvote object',addvote)} 
                        return <View key={'addvotes'+index} style={styles.choice} >
                        <Pressable style={styles.plusbutton} onPress={() => {console.log('add vote',contestant); setVotesToAdd(true); addvote.add++; console.log(addvote); added_votes[addvote.index].add = addvote.add; console.log('added',added_votes); const update = {...votingdata,added_votes:added_votes}; console.log('added update',update); setVotingdata(update); } }><Text style={styles.buttonText}>+</Text></Pressable> 
                        <Pressable style={styles.minusbutton} onPress={() => {console.log('add vote',contestant);  setVotesToAdd(true); if(addvote.add > 0) addvote.add--; console.log(addvote); added_votes[addvote.index].add = addvote.add; console.log('added',added_votes); const update = {...votingdata,added_votes:added_votes}; console.log('added update',update); setVotingdata(update); } }><Text style={styles.buttonText}>-</Text></Pressable> 
                        <Text>{contestant} +{addvote.add}</Text></View>})}
                        {votesToAdd ? <View><Pressable style={styles.button} onPress={() =>{ sendVotingUpdate({added:votingdata.added_votes,post_id:agenda.post_id,identifier:identifier}); setVotesToAdd(false); }}><Text style={styles.buttonText}>Update</Text></Pressable></View> : null}
                    </View>
                }
            )}
            <Text style={[styles.h2,{marginTop:100}]}><TranslatedText term='Send Web Voting Link' /></Text>
            {message ? <Text>{message}</Text> : null}
            <Text style={{textAlign: 'center'}} ><TranslatedText term="Members can vote using the app or a web link." /></Text>
            <Pressable style={styles.button} onPress={() => {sendBallotLink('myself')}}><Text style={styles.buttonText}><TranslatedText term="Email the link to me" /></Text></Pressable>
            <Text style={{textAlign: 'center'}}>or</Text>
            <Pressable style={styles.button} onPress={() => {sendBallotLink('members')}}><Text style={styles.buttonText}><TranslatedText term="Email the link to members" /></Text></Pressable>
            <Text style={[styles.h2,{marginTop:100}]}><TranslatedText term="Reset Ballot" /></Text>
            <View><Pressable style={styles.button} onPress={() => { sendVotingUpdate({reset:true,post_id:agenda.post_id,identifier:identifier});} }><Text style={styles.buttonText}><TranslatedText term="Reset Ballot" /></Text></Pressable></View>
            <Text style={{marginBottom: 50}}>Click to delete all ballots and vote records</Text>
          </View>
          </ScrollView>
          </SafeAreaView>          
      );  
  }

  let openBallots = false;

  return (
    <SafeAreaView style={{flex:1}}>
      <ScrollView>
      <BrandHeader {...queryData} {...agenda} />
          {votingdata.is_vote_counter ? 
                      <View style={{flexDirection: 'row'}}>
      <Text style={styles.h1}><TranslatedText term="Voting" /></Text>
      <Pressable onPress={() => { setControls('setup'); }} style={{ marginLeft: 10 }}>
                    <MaterialCommunityIcons name="ballot-outline" size={24} color="black" />
                    </Pressable>
                      <Pressable style={{ marginLeft: 10 }}
                      onPress={() => {
                        setControls('check');
                        getBallots();
                      }}
                      >
                      <MaterialCommunityIcons name="poll" size={24} color="black" /></Pressable>
                      <Pressable onPress={() => { getBallots(); setMessage('Checking for updates ...'); }} style={{ marginLeft: 10 }}>
                      <MaterialCommunityIcons name="refresh" size={24} color="black" /></Pressable>
                      </View>
           : <View style={{flexDirection: 'row'}}>
      <Text style={styles.h1}><TranslatedText term="Voting" /></Text>
      <Pressable onPress={() => { getBallots(); setMessage('Checking for updates ...'); }} style={{ marginLeft: 10 }}>
           <MaterialCommunityIcons name="refresh" size={24} color="black" /></Pressable>
           </View>}
                {contestlist.map(
                (c, cindex) => {
                    if('Template' == c)
                        return;
                    const currentBallot = votingdata.ballot[c];
                    if(currentBallot.status != 'publish')
                        return null;
                    if(votingdata.myvotes.includes(c))
                        return (<View key={'contest'+cindex}>
                    <Text style={styles.h2}><TranslatedText term={c} /></Text>
                    <TranslatedText term="Voted" />
                    </View>)
                    openBallots = true;
                    return (<View key={'contest'+cindex}>
                        <Text style={styles.h2}><TranslatedText term={c} /></Text>
                        {currentBallot.contestants.length ? <TranslatedText term="Vote for:" /> : null}
                        {currentBallot.contestants.map((contestant,index) => {return <View style={styles.choice} key={'contestant'+index}><Pressable style={{backgroundColor: 'black',padding:5,borderRadius: 8, marginRight: 5}} onPress={() => {const vote = {'vote':contestant,'key':c,identifier:identifier,post_id:agenda.post_id}; console.log('vote',vote); sendVotingUpdate(vote);} }><Text style={styles.buttonText}>✓</Text></Pressable><Text style={{fontSize: 20}}>{contestant}</Text></View>})}
                    </View>)
                }
            )}
          {!votingdata.is_vote_counter && (!openBallots) ? 
          <View><Text>The current vote counter is "{(votingdata.vote_counter_name) ? votingdata.vote_counter_name : '(none assigned)'}" but no ballots have been created yet.</Text>
          <Text style={styles.h2}><TranslatedText term='Take over as Vote Counter?' /></Text>
          <Text>If no Vote Counter is available, any member can assume the role.</Text>
          {votingdata.authorized_user ? <View><Pressable style={styles.button} onPress={() => {sendVotingUpdate({post_id:agenda.post_id,identifier:identifier,take_vote_counter:true}) }}><Text style={styles.buttonText}><TranslatedText term='Take Role' /></Text></Pressable></View> : null}
          </View> : null}
          {votingdata.is_vote_counter ? <View><Text style={styles.h2}><TranslatedText term='Back to Vote Counter Controls?' /></Text>
          <Pressable style={styles.button} onPress={() => {setControls('')} }><Text style={styles.buttonText}><TranslatedText term='Go Back' /></Text></Pressable></View> : null}
          </ScrollView>
      </SafeAreaView>
  );

}