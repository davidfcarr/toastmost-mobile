import React, {useState, useEffect, useRef} from "react"
import { Text, View, TextInput, Pressable, StyleSheet, FlatList, useWindowDimensions } from "react-native";
import Select from './Select.js'
import styles from './styles'

export default function EvaluationProjectChooser(props) {

    const {projects,item,evaluation,setEvaluation,speakerOptions} = props;
    const choices = projects;
    console.log('project text choices',choices['project_text']);
    const role = item;
    const [path, setPath] = useState((evaluation.project) ? evaluation.project.replace(/ Level.+/,'') : 'Path Not Set');

    if(!choices || typeof choices.manuals == 'undefined')
        return <View><Text>Loading project choices</Text></View>

    return (

        <View>
        <View style={{backgroundColor:'lightgray',padding:5,borderRadius: 3}}>
        <View><Select options={speakerOptions} defaultValue={evaluation} label="Speaker" onChange={(value) => {console.log('speaker choice',value); if(value.manual) {const parts = value.manual.split(' Level'); setPath(parts[0]);} else setPath(''); setEvaluation(value); }} /></View>
        <View><Select options={choices['paths']} defaultValueByIndex={choices['paths'].findIndex((item) => item.value==path)} label="Path" onChange={(value) => {setPath(value); }} /></View>

        <View><Select options={choices['manuals'][path]} defaultValueByIndex={(choices['manuals'][path]) ? choices['manuals'][path].findIndex((item) => item.value==evaluation.manual): -1} label="Level" onChange={(value) => {setEvaluation((prev) => {const newev = {...prev}; newev.manual = value; return newev;} ); }} /></View>

        <View><Select defaultValueByIndex={(choices['projects'][evaluation.manual]) ? choices['projects'][evaluation.manual].findIndex((item) => item.value==evaluation.project) : -1} options={(choices['projects'][evaluation.manual]) ? choices['projects'][evaluation.manual] : [{'value':'',label:'Set Path and Level to See Projects'}] } label="Project" onChange={(value) => { let choice = choices['projects'][evaluation.manual].find((item) => {if(item.value==value) return item;} ); setEvaluation((prev) => {const newev ={...prev}; newev.project = value; if(choice) newev.project_text = choice.label; return newev;});   }} /></View>
        </View>

        <View className="tmflexrow">

        <TextInput 
        placeholder="Title"
        placeholderTextColor="gray"
        value={evaluation.title} onChangeText={(value) => {setEvaluation((prev) => {const newev = {...prev}; newev.title = value; return newev } ); }} style={styles.input} />

        </View>
        </View>
    )
}
