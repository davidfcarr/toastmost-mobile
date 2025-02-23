import { Text, View, ScrollView, TextInput, Pressable, Image, AppState, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState, useEffect, useCallback } from "react";
import { Octicons } from '@expo/vector-icons'
import SelectDropdown from 'react-native-select-dropdown'
import styles from '../styles'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import useAgenda from '../useAgenda';
import BrandHeader from "../BrandHeader";
import useClubMeetingStore from "../store";

export default function Voting(props) {
  const {user_id, message, setMessage, reset} = useAgenda();
  const {clubs, meeting, queryData, agenda} = useClubMeetingStore();
  const club = (clubs && clubs.length) ? clubs[0] : {};
  const [votingdata,setVotingdata] = useState({});
  const memberDefault = {'value':'','label':'Select Member'};
  const [candidate, setCandidate] = useState(memberDefault);
  const [yesno,setYesno] = useState(false);
  const [signature,setSignature] = useState(false);
  const [controls,setControls] = useState('');
  const [guest,setGuest] = useState('');
  const [newBallot,setNewBallot] = useState('');
  const [votesToAdd,setVotesToAdd] = useState(false);
  const [copied,setCopied] = useState(false);
  const [checkForVotes,setCheckForVotes] = useState(false);
  const { width } = useWindowDimensions();
  const [appIsReady, setAppIsReady] = React.useState(false);

  const identifier = club.code;

  console.log('voting agenda',agenda);

  useEffect(
    () => {
      getBallots();
      console.log('voting useEffect, initial query');
    }, []);
    useEffect(
      () => {
        getBallots();
        console.log('voting useEffect');
    }, [queryData,agenda]);

      function getBallots() {
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
            if(pollingInterval)
              clearInterval(pollingInterval);  
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

  if (!appIsReady || !votingdata.ballot) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View>
          <BrandHeader {...queryData} />
          <Text>Voting tool loading ...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const contestlist = Object.keys(votingdata.ballot);

  if (votingdata.is_vote_counter && 'check' == controls) {
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
            </View>
            {message ? (
              <View>
                <Text style={{ backgroundColor: 'black', color: 'white', padding: 10, margin: 5 }}>
                  {message}
                </Text>
              </View>
            ) : null}
            {contestlist.map((contest, index) => (
              <View key={index}>
                <Text>{contest}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if(votingdata.is_vote_counter && 'vote' != controls) {
      return (
        <SafeAreaView style={{flex:1}} >
          <ScrollView>
          <View>
          <BrandHeader {...queryData} {...agenda} />
              <Text style={styles.h1}>Vote Counter's Tool</Text>
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
          setCheckForVotes(true);
          getBallots();
        }}
        >
        <MaterialCommunityIcons name="poll" size={24} color="black" /></Pressable>
        <Pressable onPress={() => { getBallots(); setMessage('Checking for updates ...'); }} style={{ marginLeft: 10 }}>
        <MaterialCommunityIcons name="refresh" size={24} color="black" /></Pressable>
        </View>
        {message ? (
              <View>
                <Text style={{ backgroundColor: 'black', color: 'white', padding: 10, margin: 5 }}>
                  {message}
                </Text>
              </View>
            ) : null}
        <Text>As the Vote Counter, you create ballots based on the speakers and evaluators on the agenda, editing them as necessary.</Text>
              <Text>You can also create ballots for Table Topics speakers and votes on club business.</Text>
              {contestlist.map(
                (c, cindex) => {
                    if(('Template' == c) || ('C' == c) || ('c' == c))
                        return;
                    const currentBallot = votingdata.ballot[c];
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
      <Text>Or Type Choice</Text>      
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
            <Text style={styles.h2}>New Ballot</Text>
            <View style={{display: 'flex',flex:1,flexDirection:'row'}}><View style={{width:'90%'}}><TextInput style={styles.input} label="Contest or Question" value={newBallot} onChangeText={ (value) => { setNewBallot(value); } } /></View><View><Pressable style={styles.plusbutton} onPress={() => {const newBallotEntry = {...votingdata.ballot}; newBallotEntry[newBallot] = {...votingdata.ballot.Template}; setVotingdata({...votingdata,ballot:newBallotEntry}); setNewBallot('');}}><Text style={styles.buttonText}>+</Text></Pressable></View></View>
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
            <Text style={[styles.h2,{marginTop:100}]}>Reset</Text>
            <View><Pressable style={styles.button} onPress={() => { sendVotingUpdate({reset:true,post_id:agenda.post_id,identifier:identifier});} }><Text style={styles.buttonText}>Reset Ballot</Text></Pressable></View>
            <Text style={{marginBottom: 50}}>Click to delete all ballots and vote records</Text>
          </View>
          </ScrollView>
          </SafeAreaView>          
      );  
  }

  let openBallots = false;

  return (
    <SafeAreaView>
      <View>
      <BrandHeader {...queryData} {...agenda} />
      <Text style={styles.h1}>Voting</Text>
          {votingdata.is_vote_counter ? 
                      <View style={{flexDirection: 'row'}}>
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
           <Pressable onPress={() => { getBallots(); setMessage('Checking for updates ...'); }} style={{ marginLeft: 10 }}>
           <MaterialCommunityIcons name="refresh" size={24} color="black" /></Pressable>
           </View>}
           {message ? (
              <View>
                <Text style={{ backgroundColor: 'black', color: 'white', padding: 10, margin: 5 }}>
                  {message}
                </Text>
              </View>
            ) : null}
                {contestlist.map(
                (c, cindex) => {
                    if('Template' == c)
                        return;
                    const currentBallot = votingdata.ballot[c];
                    if(currentBallot.status != 'publish')
                        return null;
                    if(votingdata.myvotes.includes(c))
                        return (<View key={'contest'+cindex}>
                    <Text style={styles.h2}>{c}</Text>
                    <Text>Voted</Text>
                    </View>)
                    openBallots = true;
                    return (<View key={'contest'+cindex}>
                        <Text style={styles.h2}>{c}</Text>
                        {currentBallot.contestants.length ? <Text>Vote for:</Text> : null}
                        {currentBallot.contestants.map((contestant,index) => {return <View style={styles.choice} key={'contestant'+index}><Text><Pressable style={styles.button} onPress={() => {const vote = {'vote':contestant,'key':c,identifier:identifier,post_id:agenda.post_id}; console.log('vote',vote); sendVotingUpdate(vote);} }><Text style={styles.buttonText}>{contestant}</Text></Pressable></Text></View>})}
                    </View>)
                }
            )}
          {!votingdata.is_vote_counter && (!openBallots) ? 
          <View><Text>The current vote counter is "{(votingdata.vote_counter_name) ? votingdata.vote_counter_name : '(none assigned)'}" but no ballots have been created yet.</Text>
          <Text style={styles.h2}>Assume the role of Vote Counter?</Text>
          <Text>If no Vote Counter is available, any member can assume the role.</Text>
          {votingdata.authorized_user ? <View><Pressable style={styles.button} onPress={() => {sendVotingUpdate({post_id:agenda.post_id,identifier:identifier,take_vote_counter:true}) }}><Text style={styles.buttonText}>Take Vote Counter Role</Text></Pressable></View> : null}
          </View> : null}
          {votingdata.is_vote_counter ? <View><Text style={styles.h2}>Back to Vote Counter Controls?</Text>
          <Pressable style={styles.button} onPress={() => {setControls('')} }><Text style={styles.buttonText}>Go Back</Text></Pressable></View> : null}
      </View>
      </SafeAreaView>
  );

}