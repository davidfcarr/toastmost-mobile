import React, { useState, useEffect, useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import EvaluationProjectChooser from "../EvaluationProjectChooser.jsx";
import EvaluationPrompt from "../EvaluationPrompt.js";
import { Text, View, ScrollView, TextInput, Pressable, StyleSheet, FlatList, useWindowDimensions } from "react-native";
import TranslatedText from '../TranslatedText'; /* <TranslatedText term="" /> */
import RenderHtml from 'react-native-render-html';
import styles from '../styles';
import useAgenda from '../useAgenda';
import BrandHeader from '../BrandHeader';
import useClubMeetingStore from "../store";
import { Link } from 'expo-router';

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
  
export default function EvaluationTool(props) {
    let initialPost = 0;
    const {clubs, meeting, queryData, agenda, message, setMessage} = useClubMeetingStore();
    const [post_id, setPostId] = useState(initialPost);
    const [current_user_id,setCurrentUserId] = useState(0);
    const [notification,setNotification] = useState(null);
    const [notificationTimeout,setNotificationTimeout] = useState(null);
    const {user_id, reset, pageUrl, initToastmost, appActive} = useAgenda();
    const defaultEvaluation = {'name':'','ID':0,'project':'','manual':'','path':'','title':'','role':'','project_text':''};
    const [evaluation,setEvaluation] = useState(defaultEvaluation);
    const [intro, setIntro] = useState('');
    const [speaker, setSpeaker] = useState('');
    const [speakerOptions, setSpeakerOptions] = useState([]);
    /*
    const [manual, setManual] = useState('');
    const [title, setTitle] = useState('');
    const [name, setName] = useState('');
    const [project, setProject] = useState('');
    */
    const [responses, setResponses] = useState([]);
    const [notes, setNotes] = useState([]);
    const [form, setForm] = useState({});
    const [sent, setSent] = useState('');
    const [secondLanguagePrompt, setSecondLanguagePrompt] = useState('');
    const { width, height } = useWindowDimensions();
    const [isLoading,setIsLoading] = useState(true);

    let roles = [];
    if(agenda && agenda.roles)
      roles = agenda.roles;
  
    console.log('evaluation clubs',clubs);
    const scrollViewRef = useRef(null);

    const scrollToTop = () => {
        scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: true });
    };

    useEffect(
        () => {
          if(!clubs || !clubs.length) {
            console.log('trying to initialize');
            initToastmost();
            return;
          }
          getEvaluationForm();
    }, []);

    useEffect(
        () => {
          getEvaluationForm();
    }, [evaluation, evaluation.ID, evaluation.project]);
    
    function sendEvaluation() {
        /*

    async function postEvaluation (evaluation) {

        evaluation.post_id = post_id;

        return await apiClient.post('evaluation?_locale=user', evaluation);

    }

    return useMutation(postEvaluation, {

        onSuccess: (data, error, variables, context) => {

            makeNotification(data.data.status);

            setSent(data.data.message);

        },

        onError: (err, variables, context) => {

            makeNotification('error posting evaluation');

            console.log('error posting evaluation',err);

          },

    

          }

)

        */
    }
    //const { mutate: sendEvaluation } = initSendEvaluation(data.post_id, setSent, makeNotification);

    function getEvaluationForm() {
        const ts = new Date().getTime();
        const url = 'https://'+clubs[0].domain+'/wp-json/rsvptm/v1/evaluation?speaker='+evaluation.ID+'&project='+evaluation.project+'&_locale=user&mobile='+clubs[0].code+'&t='+ts;
        console.log(url);
        setMessage('Loading form ...');
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
          console.log('Evaluation data',data);
          setForm(data.form);
          setIntro(data.intro);
          setIsLoading(false);
    }   ).catch(
          (error) => {
            console.log('fetch error',error);
            setMessage('Unable to connect. Possibly a network error or typo in domain name '+clubs[0].domain+'.');
          }
        )
    }

    function send() {
        const ev = { 
            'evaluate': evaluation, 
            'form': {prompts:form,intro:intro}, 
            'responses': responses, 
            'notes': notes, 
            'evaluator_name': queryData.name, 
            post_id: queryData.post_id 
        };
        console.log('send evaluation', ev);
        fetch('https://' + clubs[0].domain + '/wp-json/rsvptm/v1/evaluation?speaker='+evaluation.ID+'&project='+evaluation.project+'_locale=user&mobile=' + clubs[0].code, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(ev),
        })
        .then((res) => {  
            console.log('response', res);
            if (res.ok) {
                setMessage('');
                return res.json();
            }
            throw new Error('Network response was not ok');
        })
        .then((data) => {
            console.log('returned data', data);
            setSent(data.message || 'Evaluation sent successfully');
            setNotification('Evaluation saved');
            scrollToTop();
        })
        .catch((error) => {
            console.log('fetch error', error);
            setMessage('Unable to connect. Possibly a network error or typo in domain name ' + clubs[0].domain + '.');
        });
    }

    if (isLoading)
        return <TranslatedText term='Loading ...'/>

    function assignmentOptions() {
        let assignment_options = [{ 'value': defaultEvaluation, 'label': 'Choose Speaker' }];
        let label = '';
        const labelLength = 40;
        let ev;
        if(evaluation.ID) {
            label = evaluation.name;
            if(evaluation.project_text)
                label += ' / ' + evaluation.project_text;
            else
                label += ' / Speech Project Not Set';
            if(label.length > labelLength)
                label = label.substring(0,labelLength) + '...';
            console.log('label for new evaluation',label);
            assignment_options.push({ 'value': evaluation, 'label': label });
        }
        if (roles.length)
            roles.map((role) => {
                if ('Speaker' == role.role && role.name != '' && role.ID != evaluation.ID) {
                    label = role.name;
                    if(role.project_text)
                        label += ' / ' + role.project_text;
                    else
                        label += ' / Speech Project Not Set';
                    if(label.length > labelLength)
                        label = label.substring(0,labelLength) + '...';
                    console.log('label based on speech',label);
                    assignment_options.push({ 'value': role, 'label': label });
                }
            });
    
        queryData.members.forEach((opt) => { if(opt.ID != evaluation.ID) { ev = {...defaultEvaluation}; ev.ID = opt.ID; ev.name = opt.name; assignment_options.push({value:ev,label:opt.name}) } });
        return assignment_options;
        //setSpeakerOptions(assignment_options);    
    }

    let openslots = [];

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <BrandHeader />
            <ScrollView style={{width: '100%', marginBottom: 50, paddingBottom: 50 }} ref={scrollViewRef}>
            <TranslatedText term='Evaluation Tool' style={styles.h2} />
            {sent && (
                <RenderHtml source={{html:sent}} contentWidth={width - 20} />
            )}
            <EvaluationProjectChooser evaluation={evaluation} setEvaluation={setEvaluation} makeNotification={setNotification} {...queryData} speakerOptions={assignmentOptions()} />
            <RenderHtml source={{html:intro}} contentWidth={width - 20} />
            {form.map((item, index) => {
                if (!(responses[index] || notes[index]))
                    openslots.push(index);
                return <View><EvaluationPrompt promptindex={index} response={responses[index]} note={notes[index]} setResponses={setResponses} setNotes={setNotes} item={item} /></View>
            })}
            {secondLanguagePrompt && form.second_language.map((item, slindex) => {
                let index = slindex + form.prompts.length;
                if (!(responses[index] || notes[index]))
                    openslots.push(index);
                return <View><EvaluationPrompt promptindex={index} response={responses[index]} note={notes[index]} setResponses={setResponses} setNotes={setNotes} item={item} /></View>
            })}
            {openslots.length > 0 && <Text>{openslots.length} <TranslatedText term='prompts have not been answered' /></Text>}
            {form.second_language_requested && <TranslatedText term='The last four speaking-in-a-second-language prompts were requested by the speaker.' />}
            {!form.second_language_requested && !secondLanguagePrompt && <View><Pressable onPress={() => { setSecondLanguagePrompt(true); }} ><TranslatedText term="Add" /><Text> </Text></Pressable><TranslatedText term='prompts for those speaking in a second language' /></View>}
            <View><Pressable style={styles.button} onPress={send}><TranslatedText style={styles.buttonText} term='Send' /></Pressable></View>
        </ScrollView>
        </SafeAreaView>
    );
}
