import { Text, View, ScrollView, TextInput, Pressable, Dimensions, StyleSheet, AppState } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect} from "react";
import { Octicons } from '@expo/vector-icons'
//import Autocomplete from 'react-native-autocomplete-input';
import SelectDropdown from 'react-native-select-dropdown'
import BrandHeader from '../BrandHeader';
import useClubMeetingStore from '../store';
import TranslatedText from '../TranslatedText'; /* <TranslatedText term="" /> */

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

export default function Timer (props) {

  const {queryData,agenda} = useClubMeetingStore();
  const members = (queryData && queryData.members) ? queryData.members : [];
  const timerOptions = [{'name':'','role':'Speaker','display_time':'5 to 7 minutes','min':5*60*1000,'max':7*60*1000}];
  const [timing,setTiming] = useState(timerOptions[0]);
  const [start, setStart] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [pause, setPause] = useState(0);
  const [color, setColor] = useState('');
  const [tracker, setTracker] = useState(null);
  const [log, setLog] = useState([]);
  const [clockColor, setClockColor] = useState('white');
  useEffect(() => {
    if(start) {
        if(tracker)
            clearInterval(tracker);
        const track = setInterval(() => {
            const elapsed = calcElapsed();
            setElapsed(elapsed);
            let c = timerColor(elapsed);
            setColor(c);
            let colorWas = clockColor;
            setClockColor((Math.floor(elapsed/1000) % 2 === 0) ? '#909090' : '#383838');
        }, 55);
        setTracker(track);    
    }
    else {
        clearInterval(tracker);
    }
},[start]);

  let roles = [];
  if(agenda && agenda.roles)
    roles = agenda.roles;
 
    const styles = StyleSheet.create({
        dropdownButtonStyle: {
          width: '95%',
          height: 50,
          backgroundColor: '#E9ECEF',
          borderRadius: 12,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 12,
          marginBottom: 5,
        },
        dropdownButtonTxtStyle: {
          flex: 1,
          fontSize: 18,
          fontWeight: '500',
          color: '#151E26',
        },
        dropdownButtonArrowStyle: {
          fontSize: 28,
        },
        dropdownButtonIconStyle: {
          fontSize: 28,
          marginRight: 8,
        },
        dropdownMenuStyle: {
          backgroundColor: '#E9ECEF',
          borderRadius: 8,
        },
        dropdownItemStyle: {
          width: '100%',
          flexDirection: 'row',
          paddingHorizontal: 12,
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 8,
        },
        dropdownItemTxtStyle: {
          flex: 1,
          fontSize: 18,
          fontWeight: '500',
          color: '#151E26',
        },
        dropdownItemIconStyle: {
          fontSize: 28,
          marginRight: 8,
        },
        buttonRow: {
            flexDirection: 'row',
            margin: 5,
        },
        startButton: {
            backgroundColor: 'green',
            borderRadius: 5,
            padding: 10,
            marginRight: 5,
            width: 110,
          },
          stopButton: {
            backgroundColor: 'red',
            borderRadius: 5,
            padding: 10,
            marginRight: 5,
            width: 110,
          },
          pauseButton: {
            backgroundColor: 'black',
            borderRadius: 5,
            padding: 10,
            marginRight: 5,
            width: 110,
          },
          buttonText: {
            fontSize: 12,
            color: 'white',
            margin: 5,
            textAlign: 'center',
          },
          input: {
            borderColor: 'gray',
            borderWidth: 1,
            borderRadius: 5,
            padding: 10,
            marginRight: 10,
            fontSize: 18,
            color: 'gray',
            height: 50,
          },
          autocompleteContainer: {
            flex: 1,
            left: 0,
            position: 'absolute',
            right: 0,
            top: 0,
            zIndex: 1
          },
      });

    const yellow = timing.min + ((timing.max - timing.min) / 2);
    function calcElapsed () { return new Date().getTime() - start + pause};
    
    function timerColor( el ) {
        let color;
        if(el > timing.max)
            color = 'red';
        else if(el > yellow)
            color = 'yellow';
        else if (el  > timing.min)
            color = 'green';
        else if (el > 0 && start)
            color = 'black';
        else 
            color = 'white';
        return color;
    }

    function getMinMax(display_time) {
        const derived = {min:5,max:7};
        match = display_time.match(/([0-9]+)[^0-9]+([0-9]+)/);
        if(match) {
            derived.min = (match && match[1]) ? parseInt(match[1]) : 5;
            derived.max = (match && match[2]) ? parseInt(match[2]) : 7;    
        }
        const mult = (match && display_time.includes('seconds')) ? 1 : 60;
        derived.min = derived.min * mult * 1000;
        derived.max = derived.max * mult * 1000;
        return derived;
    }

    let match, min, max, display_time;
    const speakerLabel = (queryData.translations && queryData.translations['Speaker']) ? queryData.translations['Speaker'] : 'Speaker';
    const evaluatorLabel = (queryData.translations && queryData.translations['Evaluator']) ? queryData.translations['Evaluator'] : 'Evaluator';
    const topicsLabel = (queryData.translations && queryData.translations['Table Topics']) ? queryData.translations['Table Topics'] : 'Table Topics';
    roles.forEach(
        (role) => {
            let minmax = {};
            let mult = (role.display_time && role.display_time.includes('seconds')) ? 1 : 60;
            if('Speaker' == role.role) {
                if(role.ID > 0) {
                    if(role.display_time) {
                        minmax = getMinMax(role.display_time);
                        display_time = role.display_time;
                    }
                    else {
                        display_time = '5 - 7 minutes';
                        minmax.min = 5 * mult * 1000;
                        minmax.max = 7 * mult * 1000;
                    }
                    timerOptions.push({'role':speakerLabel,'name':role.name,'display_time':role.display_time,'min':minmax.min,'max':minmax.max});
                }
            }
            if('Evaluator' == role.role) {
                if(role.ID > 0) {
                    minmax.min = 2 * mult * 1000;
                    minmax.max = 3 * mult * 1000;
                    timerOptions.push({'role':evaluatorLabel,'name':role.name,'display_time':'2 to 3 minutes','min':min * 60 *1000,'max':max * 60 * 1000});    
                }
            }
        }        
    );
    timerOptions.push({'role':evaluatorLabel,'name':'','display_time':'2 to 3 minutes','min':2 * 60 *1000,'max':3 * 60 * 1000});
    timerOptions.push({'role':speakerLabel,'name':'','display_time':'5 to 15 seconds','min':5000,"max":15000});
    timerOptions.push({'role':speakerLabel,'name':'','display_time':'30 to 60 seconds','min':30 * 1000,"max":60 * 1000});
    timerOptions.push({'role':speakerLabel,'name':'','display_time':'2 to 3 minutes','min':2*60*1000,"max":3*60*1000});
    timerOptions.push({'role':speakerLabel,'name':'','display_time':'3 to 5 minutes','min':3*60*1000,"max":5*60*1000});
    timerOptions.push({'role':speakerLabel,'name':'','display_time':'4 to 6 minutes','min':4*60*1000,"max":6*60*1000});
    timerOptions.push({'role':speakerLabel,'name':'','display_time':'6 to 8 minutes','min':6*60*1000,"max":8*60*1000});
    timerOptions.push({'role':speakerLabel,'name':'','display_time':'8 to 10 minutes','min':8*60*1000,"max":10*60*1000});
    timerOptions.push({'role':speakerLabel,'name':'','display_time':'10 to 12 minutes','min':10*60*1000,"max":12*60*1000});
    timerOptions.push({'role':speakerLabel,'name':'','display_time':'12 to 15 minutes','min':12*60*1000,"max":15*60*1000});
    timerOptions.push({'role':topicsLabel,'name':'','display_time':'1 to 2 minutes','min':60 * 1000,"max":120 * 1000});
    if(members)
    members.forEach(
        (member) => {
            timerOptions.push({'role':topicsLabel,'name':member.name,'display_time':'1 to 2 minutes','min':60 * 1000,"max":120 * 1000});
        }
    );

    return (
        <SafeAreaView style={{'flex':1}}>
        <BrandHeader />
        <View style={{flex:1}}>
          <ScrollView>
        <SelectDropdown
    data={timerOptions}
    defaultValue={timerOptions[0]}
    keyExtractor={(item, index) => item.role + index}
    onSelect={(selectedItem, index) => {
      if(!selectedItem.display_time)
        selectedItem.display_time = '5 to 7 minutes';
      setTiming(selectedItem);
    }}
    renderButton={(selectedItem, isOpened) => {
      return (
        <View style={styles.dropdownButtonStyle}>
          <Octicons name="chevron-down" size={24} color='black' selectable={undefined} style={{ width: 24 }} />
          <Text style={styles.dropdownButtonTxtStyle}>
            {selectedItem && selectedItem.role+' '+selectedItem.name+' '+selectedItem.display_time}
          </Text>
        </View>
      );
    }}
    renderItem={(item, index, isSelected) => {
      return (
        <View key={'timeropt'+index} style={{...styles.dropdownItemStyle, ...(isSelected && {backgroundColor: '#D2D9DF'})}}>
          <Text style={styles.dropdownItemTxtStyle}>{item.role+' '+item.name+' '+item.display_time}</Text>
        </View>
      );
    }}
    showsVerticalScrollIndicator={false}
    dropdownStyle={styles.dropdownMenuStyle}
  />
    <TextInput style={styles.input} value={timing.name} placeholder="Name" placeholderTextColor="gray" 
    onChangeText={(value) => { let up = {...timing}; up.name = value; setTiming(up); }} />
    <TextInput style={styles.input} value={timing.display_time} placeholder="Timing" placeholderTextColor="gray" 
    onChangeText={(value) => { let up = {...timing}; up.display_time = value; const minmax = getMinMax(value); console.log('minmax',minmax); up.min = minmax.min; up.max = minmax.max; setTiming(up); }} />
    <View style={styles.buttonRow}>
    <Pressable style={styles.startButton} onPress={() => {setStart(new Date().getTime()); setElapsed(0);}}><Text style={styles.buttonText}><TranslatedText term="Start" /></Text></Pressable>
    <Pressable style={styles.stopButton} onPress={() => {setStart(0);setPause(0); let time = new Date(elapsed).toTimeString(); let match = time.match(/[0-9]{2}\:([^\s]+)/); log.push(match[1]+' '+timing.role+' '+timing.name); setColor('white'); }}><Text style={styles.buttonText}><TranslatedText term="Stop" /></Text></Pressable>
    <Pressable style={styles.pauseButton} onPress={() => {setStart(0);setPause(elapsed);}}><Text style={styles.buttonText}><TranslatedText term="Pause" /></Text></Pressable>
    </View>
    {!roles.length && !members.length ? <Text style={{fontStyle:'italic'}}>Stand-alone mode. This Timer works best when connected to a club's membership list and meeting agendas.</Text> : null}
    {!start && log.length ? log.map( (entry,entryindex) => { return (entryindex == log.length - 1) ? <Text style={{fontWeight: 'bold'}}>{entry}</Text> : <Text>{entry}</Text> } ) : null}    
    <View style={{backgroundColor: color, width: '100%',height: 1000 }}>{'black' == color && <Text style={{color:'white'}}>Timing <Octicons name="clock" size={24} color={clockColor} selectable={undefined} style={{ width: 24 }} /></Text>}{['green','yellow','red'].includes(color) ? <View><Text style={{color:'yellow' == (color ? 'black' : 'white'),fontSize: 100}}>{color.toUpperCase()}<Octicons name="clock" size={24} color={clockColor} selectable={undefined} style={{ width: 24 }} /></Text></View> : null}</View>
    </ScrollView>
    </View>
        </SafeAreaView>
    );
} 
