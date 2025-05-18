import React, { useRef, useState } from 'react';
import { Text, View, TextInput, Pressable, StyleSheet, FlatList, useWindowDimensions } from "react-native";
//import TranslatedText from './TranslatedText'; /* <TranslatedText term="" /> */
import styles from './styles';

export default function EvaluationPrompt(props) {
const {item,promptindex,note,response,setResponses,setNotes} = props;
const [choice,setChoice] = useState(response);
const [edit,setEdit] = useState(true);

const notefield = useRef('');

function save (e) {
    e.preventDefault();
      setNotes((prev) => {prev[promptindex] = notefield.current.value; return prev});
      setEdit(false);
} 

  let labelparts;
  return (
    <View>
     <Text>{item.prompt} {choice}</Text>
     <View style={{flexDirection:'row', alignItems: 'left',padding: 5, alignContent: 'center'}}>
     {item.choices && item.choices.length > 0 && 
        item.choices.map((choiceItem, index) => {
          console.log('choiceItem',choiceItem);
            const isSelected = choiceItem.value === choice;
            const key = item.prompt.replace(/[^a-zA-Z0-9]/g, '') + index;
            labelparts = choiceItem.label.split(' ');
            return (
                <Pressable 
                    key={key} 
                    onPress={() => {setChoice(choiceItem.value); setResponses((prev) => {let newd = [...prev]; newd[promptindex] = choiceItem.value; return newd });} }
                    style={[
                        styles.choiceButton,
                        isSelected && {backgroundColor: '#000000'},
                    ]}
                >
                    <Text style={isSelected ? [styles.choiceText,{color:'#ffffff'}] : styles.choiceText}>
                        {labelparts[0]}
                    </Text>
                </Pressable>
            );
        })
     }
     </View>
     <TextInput style={styles.input} ref={notefield} onBlur={save} />
    </View>
  );
}
