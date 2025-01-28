import { Text, View, ScrollView, TextInput, Pressable, Image, AppState, useWindowDimensions } from "react-native";
import styles from './styles'

export default function EditContestants({candidates, ballotContestants, setCandidates, saveCandidates, contestUpdateIndex}) {
    console.log('candidates passed to EditContestants',candidates);
    console.log('index',contestUpdateIndex);
    console.log('selected',candidates[contestUpdateIndex]);

    if(!candidates[contestUpdateIndex] || !candidates[contestUpdateIndex].options || !candidates[contestUpdateIndex].options.length)
        return null;
    return (
        <View>
        {candidates[contestUpdateIndex].options.map( (c, cindex) => {
            console.log('candidate',c);
            let isSaved = (ballotContestants.includes(c));
            return <View style={{flexDirection:'row', alignItems: 'center'}} key={'contestant'+cindex}><Pressable key={'remove'+cindex} onPress={() => { 
              setCandidates(() => {
              let current = [...candidates]; current[contestUpdateIndex].options.splice(cindex, 1); console.log('shortend array',current); return current;
              } ); } } style={{'backgroundColor': 'red',padding: 10, margin: 5, fontSize: 15}}>
            <Text style={styles.addButtonText}>-</Text>
          </Pressable>
      <Text key={'candidate'+cindex}>{c.toString()} {isSaved ? '' : '(Not saved)'}</Text></View>
            }
            )
          }
       
          <Pressable style={styles.addButton} onPress={() => {
            saveCandidates();
          }}><Text style={styles.addButtonText}>Save</Text></Pressable>
    </View> 
    )
}