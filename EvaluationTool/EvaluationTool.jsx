import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TranslatedText from '../TranslatedText';
import styles from '../styles';
import { EvaluationPrompt } from '../EvaluationPrompt';
import { EvaluationProjectChooser } from '../EvaluationProjectChooser';
import BrandHeader from '../BrandHeader';
import useClubMeetingStore from "../store";

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
    const [evaluatorName, setEvaluatorName] = useState('');
    const [evaluatorEmail, setEvaluatorEmail] = useState('');
    const [project, setProject] = useState('');
    const [responses, setResponses] = useState([]);
    const [notes, setNotes] = useState([]);
    const [form, setForm] = useState({});
    const [sent, setSent] = useState('');
    const [secondLanguagePrompt, setSecondLanguagePrompt] = useState('');
    const {clubs, meeting, queryData, agenda, message, setMessage} = useClubMeetingStore();
    const club = (clubs && clubs.length) ? clubs[0] : {};
  
    useEffect(() => {
        fetchEvaluationForm();
    }, []);

    const fetchEvaluationForm = async () => {
        try {
            const response = await fetch('https://'+club.domain+'/wp-json/rsvptm/v1/evaluation/?project='+project+'&speaker=&_locale=user');
            const data = await response.json();
            if (data.second_language_requested > 0) {
                setForm({
                    'prompts': data.form.concat(data.second_language),
                    'intro': data.intro,
                    'second_language_requested': true
                });
            } else {
                setForm({
                    'prompts': data.form,
                    'intro': data.intro,
                    'second_language_requested': false,
                    'second_language': data.second_language
                });
            }
        } catch (error) {
            console.error('Error fetching evaluation form:', error);
        }
    };

    const sendEvaluation = async () => {
        try {
            const response = await fetch('https://'+club.domain+'/wp-json/rsvptm/v1/evaluation/?project='+project+'&speaker=&_locale=user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    evaluatorName,
                    evaluatorEmail,
                    project,
                    responses,
                    notes
                })
            });
            const data = await response.json();
            setSent(true);
        } catch (error) {
            console.error('Error sending evaluation:', error);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <BrandHeader />
            <ScrollView>
                <View style={styles.evaluationContainer}>
                    <TranslatedText term="Evaluation Form" style={styles.h1} />
                    
                    <EvaluationProjectChooser
                        project={{
                            project: project,
                            setProject: setProject
                        }}
                    />
                    {form.prompts && form.prompts.map((item, index) => (
                        <EvaluationPrompt
                            key={index}
                            item={item}
                            promptindex={index}
                            note={notes[index]}
                            response={responses[index]}
                            setResponses={setResponses}
                            setNotes={setNotes}
                        />
                    ))}
                    <Pressable
                        style={styles.submitButton}
                        onPress={sendEvaluation}
                    >
                        <Text style={styles.buttonText}>
                            <TranslatedText term="Submit Evaluation" />
                        </Text>
                    </Pressable>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
