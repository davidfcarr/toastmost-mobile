import { Text, View, Pressable } from "react-native";
import styles from './styles'

export default function EditContestants({candidates, ballotContestants, setCandidates, saveCandidates, selectedBallotIndex}) {
    console.log('candidates passed to EditContestants',candidates);
    console.log('index EditContestants',selectedBallotIndex);
    console.log('selected EditContestants',candidates[selectedBallotIndex]);

    //if(!candidates[selectedBallotIndex] || !candidates[selectedBallotIndex].options || !candidates[selectedBallotIndex].options.length)
        //return null;
    return (
        <View>
        {candidates[selectedBallotIndex].options.map( (c, cindex) => {
            console.log('candidate test',c);
            console.log('ballotContestants',ballotContestants);
            let isSaved = (ballotContestants.includes(c));
            return <View style={{flexDirection:'row', alignItems: 'center'}} key={'contestant'+cindex}><Pressable key={'remove'+cindex} onPress={() => { 
              setCandidates(() => {
              let current = [...candidates]; current[selectedBallotIndex].options.splice(cindex, 1); console.log('shortend array',current); return current;
              } ); } } style={{'backgroundColor': 'red',padding: 10, margin: 5, fontSize: 15}}>
            <Text style={styles.addButtonText}>-</Text>
          </Pressable>
      <Text key={'candidate'+cindex}>{c.toString()} {isSaved ? '' : '(Not saved)'}</Text></View>
            }
            )
          }
          {ballotContestants.map((ballot) => {
            if(!candidates[selectedBallotIndex].options.includes(ballot))
              return <View><Text>Delete {ballot} (not saved)</Text></View>
          })}
       
          <Pressable style={styles.addButton} onPress={() => {
            saveCandidates();
          }}><Text style={styles.addButtonText}>Save</Text></Pressable>
    </View> 
    )
}