import React, {useState, useEffect, useRef} from "react"
//import {TextControl } from '@wordpress/components';
//import { Editor } from '@tinymce/tinymce-react';
import { Text, View, TextInput, Pressable, StyleSheet, FlatList, useWindowDimensions } from "react-native";
import Select from './Select.js'
import styles from './styles'

export default function ProjectChooser(props) {

    const choices = props.projects;
    const updateRole = props.updateRole;
    const setEdit = props.setEdit;

    const [role, setRole] = useState(props);

    const [path, setPath] = useState((props.project) ? props.project.replace(/ Level.+/,'') : 'Path Not Set');

    const [manual, setManual] = useState(props.manual);

    const [project, setProject] = useState((props.project) ? props.project : '');

    const [title, setTitle] = useState(props.title);
    const [intro, setIntro] = useState(props.intro);

    const [display_time, setDisplayTime] = useState(props.display_time);

    const [maxtime, setMaxTime] = useState(props.maxtime);

    //const editorRef = useRef(null);

    function projectTime(project) {

        let value = (typeof choices['maxtime'][project] == 'undefined') ? '7' : choices['maxtime'][project];

        setMaxTime(value);

        value = (typeof choices['display_time'][project] == 'undefined') ? '5 - 7 minutes' : choices['display_time'][project];

        setDisplayTime(value);

    }

    function updateSpeech(exit = false) {
        const update = {...props};
        update.manual = manual;
        update.title = title;
        update.project = project;
        update.maxtime = maxtime;
        update.display_time = display_time;
        update.intro = intro;
        updateRole(update);
        if(exit)
            setEdit('');
    }

    if(!choices || typeof choices.manuals == 'undefined')
        return <View><Text>Loading project choices</Text></View>

    return (

        <View>
        <View style={{backgroundColor:'lightgray',padding:5,borderRadius: 3}}>
        <View><Select options={choices['paths']} defaultValueByIndex={choices['paths'].findIndex((item) => item.value==path)} label="Path" onChange={(value) => {setPath(value); updateSpeech();}} /></View>

        <View><Select options={choices['manuals'][path]} defaultValueByIndex={(choices['manuals'][path]) ? choices['manuals'][path].findIndex((item) => item.value==manual): -1} label="Level" onChange={(value) => {setManual(value); updateSpeech();}} /></View>

        <View><Select defaultValueByIndex={(choices['projects'][manual]) ? choices['projects'][manual].findIndex((item) => item.value==project) : -1} options={(choices['projects'][manual]) ? choices['projects'][manual] : [{'value':'',label:'Set Path and Level to See Projects'}] } label="Project" onChange={(value) => { setProject(value); projectTime(value); } } /></View>
        </View>

        <View className="tmflexrow">

        <View className="tmflex50">

        <TextInput 
        placeholder="Display Time"
        placeholderTextColor="gray"
        placeholdertext="Display Time" onChangeText={(value) => { let match = value.match(/\- ([0-9]+)/); if(match && match[1]) setMaxTime(match[1]); setDisplayTime(value); updateSpeech(); } } value={display_time}  style={styles.input} />
        </View>

        </View>

        <TextInput 
        placeholder="Title"
        placeholderTextColor="gray"
        value={title} onChangeText={(value) => {setTitle(value); }} style={styles.input} />

        <TextInput 
        placeholder="Intro"
        placeholderTextColor="gray"
        multiline={true}
        numberOfLines={4}
        value={intro} onChangeText={(value) => {setIntro(value); }} style={styles.input} />

        <Pressable onPress={() => updateSpeech(true)} style={styles.addButton}><Text style={styles.addButtonText}>Save Speech Details</Text></Pressable>

        </View>
    )
}
