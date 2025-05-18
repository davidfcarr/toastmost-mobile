import React, { useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import SelectDropdown from 'react-native-select-dropdown';
import TranslatedText from './TranslatedText';
import styles from './styles';
import { AntDesign } from '@expo/vector-icons';

export function EvaluationPrompt(props) {
    const { item, promptindex, note, response, setResponses, setNotes } = props;
    const [choice, setChoice] = useState(response);
    const [edit, setEdit] = useState(true);

    const handleResponse = (selectedItem) => {
        setChoice(selectedItem);
        const newResponses = [...responses];
        newResponses[promptindex] = selectedItem;
        setResponses(newResponses);
    };

    return (
        <View style={styles.promptContainer}>
            <Text style={styles.promptText}>{item.prompt}</Text>
            <SelectDropdown
                data={item.options || []}
                defaultValue={choice}
                onSelect={handleResponse}
                buttonTextAfterSelection={(selectedItem) => selectedItem}
                rowTextForSelection={(item) => item}
                buttonStyle={styles.dropdownButton}
                buttonTextStyle={styles.dropdownButtonText}
                renderDropdownIcon={(isOpened) => (
                    <AntDesign 
                        name={isOpened ? 'caretup' : 'caretdown'} 
                        size={12} 
                        color="#444" 
                    />
                )}
                dropdownIconPosition="right"
            />
            <TextInput
                style={styles.noteInput}
                value={note}
                onChangeText={(text) => {
                    const newNotes = [...notes];
                    newNotes[promptindex] = text;
                    setNotes(newNotes);
                }}
                placeholder="Add notes here"
                multiline
            />
        </View>
    );
}
