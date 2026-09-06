import { Text, View, Pressable, FlatList, ScrollView, Switch, AppState, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect, useRef } from "react";
import { Octicons } from '@expo/vector-icons'
import SelectDropdown from 'react-native-select-dropdown'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import EditRole from '../EditRole';
import EditableNote from '../EditableNote';
import SuggestRole from '../SuggestRole';
import styles from '../styles';
import BrandHeader from '../BrandHeader';
import useAgenda from '../useAgenda';
import Settings from './Settings';
import { useFocusEffect } from 'expo-router';
import Promo from '../Promo';
import TranslatedText from '../TranslatedText'; /* <TranslatedText term="" /> */
import { Link } from 'expo-router';
import useClubMeetingStore from '../store';
import OrderLoadingScreen from '../BangGavel';
import { normalizeAbsenceOptions } from '../absencePromptUtils';

// Import VersionCheckModal - Metro automatically uses .web.js on web platform
import VersionCheckModal from '../VersionCheckModal';

export function ErrorBoundary({ error, retry }) {
  return (
    <SafeAreaView>
    <View style={{ flex: 1}}>
      <Text>{error.message}</Text>
      <Pressable onPress={retry} style={{backgroundColor:'black',padding: 10, borderRadius: 5, margin: 10}}><Text style={{color:'white'}}>Try Again?</Text></Pressable>
      <Text>Try navigating to the <Link href="/Settings"  style={{textDecorationLine: 'underline'}}>Settings</Link> screen.</Text>
      </View>
    </SafeAreaView>
  );
}

export default function Home (props) {
    const [edit,setEdit] = useState('');
    const [suggest,setSuggest] = useState('');
    const [assign,setAssign] = useState(false);
    const [editNotes,setEditNotes] = useState(false);
    const [absenceUntil, setAbsenceUntil] = useState('');
    const [addToList, setAddToList] = useState(0);
    const [managerUntil, setManagerUntil] = useState('');
    const [showAbsenceEditor, setShowAbsenceEditor] = useState(false);
    const [localAbsences, setLocalAbsences] = useState([]);
    const [absenceUpcoming, setAbsenceUpcoming] = useState([]);
    const [absenceMemberList, setAbsenceMemberList] = useState([]);
    const [absenceManagerCap, setAbsenceManagerCap] = useState(false);
    const [absenceLoading, setAbsenceLoading] = useState(false);
    const {updateRole, getToastData, absence, fetchAbsences} = useAgenda();
    const timeNow = Date.now();
    const {clubs, setClubs, meeting, setMeeting,agenda,setAgenda, message, setMessage,queryData,language,nextUpdate,setNextUpdate,newsite} = useClubMeetingStore();
    const club = (clubs && clubs.length) ? clubs[0] : {};
    const appState = useRef(AppState.currentState);
    const absences = Array.isArray(localAbsences) ? localAbsences : [];
    const upcoming = Array.isArray(absenceUpcoming) ? absenceUpcoming : [];
    const memberList = Array.isArray(absenceMemberList) ? absenceMemberList : [];
    const currentUserId = queryData?.user_id ?? 0;
    const currentPostId = agenda?.post_id || queryData?.agendas?.[meeting]?.post_id || queryData?.post_id;
    const currentUserName = queryData?.current_user_name || queryData?.name || 'Me';
    const myAbsence = absences.find((entry) => String(entry.ID) === String(currentUserId));
    const myAbsenceUntil = myAbsence && myAbsence.until ? myAbsence.until : '';
    const absenceOptions = normalizeAbsenceOptions(upcoming).map((item) => ({
      label: item.label || item.name || `Meeting ${item.value}`,
      value: item.value,
    }));

    function applyAbsenceResponse(result) {
      if (!result) {
        return;
      }

      const payload = result?.data && typeof result.data === 'object' ? result.data : result;
      const nextAbsences = Array.isArray(result)
        ? result
        : Array.isArray(payload?.absences)
          ? payload.absences
          : [];
      const nextUpcoming = Array.isArray(payload?.upcoming)
        ? payload.upcoming
        : Array.isArray(payload?.future_dates)
          ? payload.future_dates
          : [];
      const nextMemberList = Array.isArray(payload?.memberlist) ? payload.memberlist : [];

      setLocalAbsences(nextAbsences);
      setAbsenceUpcoming(nextUpcoming);
      setAbsenceMemberList(nextMemberList);

      if (typeof payload?.can_manage_others !== 'undefined') {
        setAbsenceManagerCap(!!payload.can_manage_others);
      }
    }

    function isPlannedAbsencePseudoRole(item) {
      if (!item || typeof item !== 'object') {
        return false;
      }
      const assignmentKey = String(item.assignment_key || '').toLowerCase();
      const roleLabel = String(item.role || '').toLowerCase();
      return (
        assignmentKey === 'planned_absence_1'
        || assignmentKey.includes('planned_absence')
        || assignmentKey.includes('planned-absence')
        || roleLabel === 'planned absences'
        || roleLabel === 'planned absence'
      );
    }

    async function loadAbsences() {
      if (!currentPostId || !currentUserId) {
        return;
      }
      setAbsenceLoading(true);
      const result = await fetchAbsences({ post_id: currentPostId, user_id: currentUserId });
      applyAbsenceResponse(result);
      setAbsenceLoading(false);
    }

    const updateAbsence = async (payload) => {
      const result = await absence({
        ...payload,
        post_id: currentPostId,
        user_id: currentUserId,
      });

      applyAbsenceResponse(result);
      await loadAbsences();

      setAbsenceUntil(payload.until || '');
    };

    const canManageOthers = !!absenceManagerCap;

    function getMemberName(id) {
      if (!Array.isArray(memberList)) {
        return '';
      }
      const match = memberList.find((item) => String(item.value) === String(id));
      return match?.label ? match.label : '';
    }

    function removeAbsence(id, index, until) {
      const normalizedId = parseInt(id, 10);
      if (!normalizedId) {
        return;
      }
      updateAbsence({ operation: 'remove', index, ID: normalizedId, until: until ? until : '' });
    }

    function addAbsence(id, selectedUntil = '') {
      const normalizedId = parseInt(id, 10);
      if (!normalizedId) {
        setMessage('Please select a member first.');
        return;
      }
      const normalizedUntil = (selectedUntil === null || typeof selectedUntil === 'undefined') ? '' : selectedUntil;
      updateAbsence({
        operation: 'add',
        ID: normalizedId,
        name: getMemberName(normalizedId) || currentUserName,
        until: normalizedUntil,
      });
    }

    function addSelfSingleMeeting() {
      setAbsenceUntil('');
      addAbsence(currentUserId, '');
    }

    function extendSelfAbsenceUntil(selectedUntil) {
      setAbsenceUntil(selectedUntil || '');
      addAbsence(currentUserId, selectedUntil || '');
    }

    function formatUntilDate(untilDate) {
      if (!untilDate) {
        return '';
      }
      const raw = Number(untilDate);
      if (!Number.isNaN(raw) && raw > 0) {
        const millis = raw < 1000000000000 ? raw * 1000 : raw;
        return new Date(millis).toLocaleDateString();
      }
      return new Date(untilDate).toLocaleDateString();
    }

    const memberOptions = Array.isArray(memberList)
      ? memberList
        .map((item) => {
          if (!item) {
            return null;
          }
          const value = item.value ?? item.ID;
          const label = item.label ?? item.name ?? value;
          if (!value) {
            return null;
          }
          return { value: String(value), label: String(label) };
        })
        .filter(Boolean)
      : [];

    function renderPlannedAbsencesPanel() {
      return (
        <View style={{ paddingHorizontal: 10, paddingTop: 10, paddingBottom: 6 }}>
          <Text style={{ fontWeight: '700', marginBottom: 6 }}>Planned Absences</Text>
          {absenceLoading ? <Text>Loading absences...</Text> : null}
          {absences.length ? absences.map((item, index) => (
            <View key={`${item.ID || index}-${item.name || 'member'}`} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 }}>
              <Text>{item.label || item.name || 'Member'}{item.dates ? ` (${item.dates})` : ''}</Text>
              </View>
          )) : <Text>No planned absences.</Text>}
          {currentUserId ? (
            <View style={{ marginTop: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                {myAbsence ? (
                  <Pressable
                    onPress={() => removeAbsence(currentUserId, absences.findIndex((entry) => String(entry.ID) === String(currentUserId)), myAbsenceUntil)}
                    style={{ flexDirection: 'row', alignItems: 'center' }}
                  >
                    <Octicons name="x-circle" size={20} color="red" style={{ width: 24 }} />
                    <Text>Remove Me</Text>
                  </Pressable>
                ) : (
                  <Pressable onPress={addSelfSingleMeeting} style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Octicons name="plus" size={20} color="black" style={{ width: 24 }} />
                    <Text>Add Me</Text>
                  </Pressable>
                )}

                {canManageOthers ? (
                  <Pressable
                    onPress={() => setShowAbsenceEditor(!showAbsenceEditor)}
                    style={{ flexDirection: 'row', alignItems: 'center' }}
                  >
                    <Octicons name="pencil" size={20} color="black" style={{ width: 24 }} />
                    <Text>{showAbsenceEditor ? 'Hide Editor' : 'Edit Absences'}</Text>
                  </Pressable>
                ) : null}
              </View>

              {myAbsence ? (
                <>
                  <Text style={{ marginBottom: 6 }}>Absent until</Text>
                  <SelectDropdown
                    data={absenceOptions}
                    defaultValue={absenceOptions.find((option) => option.value === (absenceUntil || myAbsenceUntil)) || absenceOptions[0]}
                    defaultValueByIndex={Math.max(0, absenceOptions.findIndex((option) => option.value === (absenceUntil || myAbsenceUntil)))}
                    onSelect={(selectedItem) => {
                      const selectedUntil = selectedItem?.value || '';
                      extendSelfAbsenceUntil(selectedUntil);
                    }}
                    renderButton={(selectedItem) => (
                      <View style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 10, backgroundColor: '#fff' }}>
                        <Text>{(selectedItem && selectedItem.label) || 'Select meeting'}</Text>
                      </View>
                    )}
                    renderItem={(item, index, isSelected) => (
                      <View style={{ padding: 10, backgroundColor: isSelected ? '#dfe7f5' : '#fff' }}>
                        <Text>{item.label}</Text>
                      </View>
                    )}
                    dropdownStyle={{ borderRadius: 8 }}
                    showsVerticalScrollIndicator={false}
                  />
                </>
              ) : (
                <SelectDropdown
                  data={absenceOptions}
                  defaultValueByIndex={0}
                  onSelect={(selectedItem) => setAbsenceUntil(selectedItem?.value || '')}
                  renderButton={(selectedItem) => (
                    <View style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 10, backgroundColor: '#fff', minWidth: 180 }}>
                      <Text>{(selectedItem && selectedItem.label) || 'Select future meeting'}</Text>
                    </View>
                  )}
                  renderItem={(item, index, isSelected) => (
                    <View style={{ padding: 10, backgroundColor: isSelected ? '#dfe7f5' : '#fff' }}>
                      <Text>{item.label}</Text>
                    </View>
                  )}
                  dropdownStyle={{ borderRadius: 8 }}
                  showsVerticalScrollIndicator={false}
                />
              )}

              {canManageOthers ? (
                <View style={{ marginTop: 12 }}>
                  {showAbsenceEditor ? (
                    <View style={{ marginTop: 10, padding: 10, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, backgroundColor: '#f9fafb' }}>
                      {absences.map((ab, index) => (
                        <View key={`manager-${ab.ID || index}`} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <Text>{ab.label || ab.name || 'Member'}</Text>
                          <Pressable
                            onPress={() => removeAbsence(ab.ID, index, ab.until)}
                            style={{ paddingVertical: 6, paddingHorizontal: 10, backgroundColor: '#b91c1c', borderRadius: 6 }}
                          >
                            <Text style={{ color: '#fff' }}>Remove</Text>
                          </Pressable>
                        </View>
                      ))}

                      <Text style={{ marginTop: 6, marginBottom: 4 }}>Add Member to List</Text>
                      <SelectDropdown
                        data={memberOptions}
                        defaultValueByIndex={Math.max(0, memberOptions.findIndex((option) => option.value === String(addToList)))}
                        onSelect={(selectedItem) => setAddToList(selectedItem?.value || 0)}
                        renderButton={(selectedItem) => (
                          <View style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 10, backgroundColor: '#fff' }}>
                            <Text>{(selectedItem && selectedItem.label) || 'Select member'}</Text>
                          </View>
                        )}
                        renderItem={(item, index, isSelected) => (
                          <View style={{ padding: 10, backgroundColor: isSelected ? '#dfe7f5' : '#fff' }}>
                            <Text>{item.label}</Text>
                          </View>
                        )}
                        dropdownStyle={{ borderRadius: 8 }}
                        showsVerticalScrollIndicator={false}
                      />

                      <Text style={{ marginTop: 10, marginBottom: 4 }}>One meeting or several?</Text>
                      <SelectDropdown
                        data={absenceOptions}
                        defaultValue={absenceOptions.find((option) => option.value === managerUntil) || absenceOptions[0]}
                        defaultValueByIndex={Math.max(0, absenceOptions.findIndex((option) => option.value === managerUntil))}
                        onSelect={(selectedItem) => setManagerUntil(selectedItem?.value || '')}
                        renderButton={(selectedItem) => (
                          <View style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 10, backgroundColor: '#fff' }}>
                            <Text>{(selectedItem && selectedItem.label) || 'This meeting only'}</Text>
                          </View>
                        )}
                        renderItem={(item, index, isSelected) => (
                          <View style={{ padding: 10, backgroundColor: isSelected ? '#dfe7f5' : '#fff' }}>
                            <Text>{item.label}</Text>
                          </View>
                        )}
                        dropdownStyle={{ borderRadius: 8 }}
                        showsVerticalScrollIndicator={false}
                      />

                      <Pressable
                        onPress={() => addAbsence(addToList, managerUntil)}
                        style={{ marginTop: 10, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: '#111827', borderRadius: 6, alignSelf: 'flex-start' }}
                      >
                        <Text style={{ color: '#fff' }}>Add</Text>
                      </Pressable>
                    </View>
                  ) : null}
                </View>
              ) : null}
            </View>
          ) : null}
        </View>
      );
    }

    useEffect(() => {
      loadAbsences();
    }, [currentPostId, currentUserId, clubs?.[0]?.domain]);


      useEffect(() => {
        if(clubs.length)
          getToastData(clubs[0],'useEffect initial');
      }, []);
    
    useEffect(() => {
      const newagenda = (queryData && queryData.agendas) ? queryData.agendas[meeting] : {};
      setAgenda(newagenda);
    }
    ,[meeting]);

    if(!club) {
      return <SafeAreaView><View><BrandHeader  isHome={true} /><Text>Loading clubs list ...</Text></View></SafeAreaView>;
    }
    
    if(!club.code)  {
      return <Settings />;
    }

    if(!agenda || !agenda.roles || !agenda.roles.length || !queryData || !queryData.agendas) {
    console.log('loading message agenda',agenda);
    console.log('loading message queryData',queryData);
    return <SafeAreaView><View><BrandHeader  isHome={true} /><Text>Loading ...</Text>
    <OrderLoadingScreen />
            <Pressable
                  onPress={() => {
                    getToastData(clubs[0],'button');
                    setMessage('Checking server for updates ...'+clubs[0].domain);
                  }}
                >
<MaterialCommunityIcons name="refresh" size={24} color="black" />
</Pressable>
      </View></SafeAreaView>;
    }

    if(edit) {
      const item = agenda.roles.find((element) => {if(element.assignment_key == edit) return element;});
      item.index = agenda.roles.findIndex((element) => (element.assignment_key == edit));
      return (<SafeAreaView><View><BrandHeader isHome={true} setEdit={setEdit} mode="edit" />
      <ScrollView>
      <EditRole item={item} members={queryData.members} updateRole={updateRole} queryData={queryData} setEdit={setEdit} mode="edit" />
      <Pressable style={[styles.addButton,{marginTop:50}]} onPress={() => setEdit('')}><Text style={styles.buttonText}><TranslatedText term="Done" /></Text></Pressable>
      <Promo />
      </ScrollView>
      </View>
      </SafeAreaView>);
    }

    if(suggest) {
      const item = agenda.roles.find((element) => {if(element.assignment_key == suggest) return element;});
      return (<SafeAreaView><View><BrandHeader isHome={true} setSuggest={setSuggest} mode="suggest" />
      <ScrollView>
      <SuggestRole item={item} members={queryData.members} queryData={queryData} setSuggest={setSuggest} mode="suggest" />
      <Pressable style={[styles.addButton,{marginTop:50}]} onPress={() => setSuggest('')}><Text style={styles.buttonText}>Done</Text></Pressable>
      <Promo />
      </ScrollView>
      </View>
      </SafeAreaView>);
    }

    if(clubs.length && queryData.domain && queryData.domain != clubs[0].domain) {
      console.log('wrong queryData.domain',queryData.domain);
      console.log('wrong clubs[0].domain',clubs[0].domain);
      return (<SafeAreaView><View><BrandHeader isHome={true} />
      <View style={styles.container}>
      <Text><TranslatedText term="New website" />: {clubs[0].domain}</Text>
      <Pressable
                  onPress={() => {
                    getToastData(clubs[0],'button new website');
                    setMessage('Checking server for updates ...'+clubs[0].domain);
                  }}
                >
<MaterialCommunityIcons name="refresh" size={24} color="black" />
</Pressable>
<TranslatedText term="Click the refresh button if the new site's agenda does not load within 60 seconds." />
</View>
      </View>
      </SafeAreaView>);
    }

      return (
        <SafeAreaView style={styles.container}>
          <View style={{ width: '100%', flex: 1 }}>
            <BrandHeader isHome={true} />

            {club.url && (!agenda.roles || !agenda.roles.length) ? (
              <View>
                <Text style={{ backgroundColor: 'black', color: 'white', padding: 10, margin: 5 }}>
                  Loading agenda. If this takes more than a few seconds, check the club access code.
                </Text>
              </View>
            ) : null}
            <View style={{ flexDirection: 'row', paddingLeft: 10 }}>
              {club.domain && agenda && queryData.agendas ? (<View style={{flexDirection: 'row'}}>
                {meeting > 0 ? <Pressable
                  onPress={() => {
                    const prevMeeting = (meeting > 0) ? meeting - 1 : queryData.agendas.length - 1;
                    setMeeting(prevMeeting);
                  }}
                  style={{ marginLeft: 10 }}
                >
                  <Octicons name="arrow-left" size={24} color="black" style={{ width: 24 }} />
                </Pressable> : null}
                <Text>{agenda && agenda.title}</Text>
                {meeting < queryData.agendas.length -1 ?
                <Pressable
                  onPress={() => {
                    const nextMeeting = meeting + 1;
                    if (queryData.agendas.length > nextMeeting) setMeeting(nextMeeting);
                    else setMeeting(0);
                  }}
                  style={{ marginLeft: 10 }}
                >
                  <Octicons name="arrow-right" size={24} color="black" style={{ width: 24 }} />
                </Pressable>
                : null }
              </View>)
               : null}
            </View>

            {club.domain && agenda.roles.length > 0 ? (
              <View style={{ width: '100%', flex: 1 }}>
                <FlatList
                  data={agenda.roles}
                  ListHeaderComponent={<View>
                                      <View style={{ flexDirection: 'row',padding: 5, justifyContent: 'space-between' }}>
                    <Octicons name="plus" size={15} color="black" style={{ width: 15 }} /><TranslatedText term="Take Role" /><Octicons name="x-circle" size={15} color="red" style={{ width: 15 }} /><TranslatedText term="Cancel" /><Octicons name="pencil" size={15} color="black" style={{ width: 15 }} /><TranslatedText term="Edit" /><Octicons name="paper-airplane" size={15} color="black" style={{ width: 15 }} /><TranslatedText term="Suggest" />                
                  </View>
                  <View style={{flexDirection: 'row'}}>
                  <Switch
          trackColor={{false: '#767577', true: '#81b0ff'}}
          thumbColor={assign ? '#f5dd4b' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={() => {
            const newassign = !assign;
            setAssign(newassign);
          }}
          value={assign}
        /><TranslatedText term="Assign" style={{marginLeft: 10, marginRight: 10}} />
<Switch
          trackColor={{false: '#767577', true: '#81b0ff'}}
          thumbColor={editNotes ? '#f5dd4b' : '#f4f3f4'}
          ios_backgroundColor="#3e3e3e"
          onValueChange={() => {
            const neweditn = !editNotes;
            setEditNotes(neweditn);
          }}
          value={editNotes}
        /><TranslatedText term="Notes" style={{marginLeft: 10}} /><Text> ({(agenda.editable && agenda.editable.length) ? agenda.editable.length : 0})</Text>
                  </View>
                  {editNotes && agenda.editable.length ? agenda.editable.map((item) => <EditableNote key={item.key} item={item} post_id={agenda.post_id} />) : null}
                    </View>}
                  ListFooterComponent={<Promo />}
                  renderItem={({ item, index:itemIndex }) => {
                    if(isPlannedAbsencePseudoRole(item)) {
                      return renderPlannedAbsencesPanel();
                    }

                    const roleid = parseInt(item.ID);
                    const isMe = (roleid == queryData.user_id);
                    const name = (item.name) ? item.name : 'Open';
                    const isAbsenceRole = typeof item.role === 'string' && item.role.includes('Absence');

                    if(assign)
                      return (
                        <EditRole item={item} members={queryData.members} updateRole={updateRole} queryData={queryData} setEdit={setEdit} mode="assign" />
                      )

                      if(item.ID && item.ID != '0' && !isMe) {
                        return (
                          <View style={{ flexDirection: 'row', justifyContent: 'start', padding: 10 }}>
                          {isAbsenceRole ? <Octicons name="check" size={24} color="black" style={{ width: 24, marginRight: 15 }} /> : <Pressable onPress={() => {setEdit(item.assignment_key);}}>
                            <Octicons name="pencil" size={24} color="black" style={{ marginLeft: 80, width: 24 }} />
                            </Pressable>}
                            <View>
                              <Text style={styles.role}><TranslatedText term={item.role} /></Text>
                              <Text style={styles.name}>{name}</Text>
                            </View>
                          </View>
                        )  
                      }

                      if(isMe)
                      return (
                        <View style={{ flexDirection: 'row', justifyContent: 'start', padding: 10 }}>
                          <Pressable onPress={() => {
                            if(isAbsenceRole) {
                              removeAbsence(currentUserId, absences.findIndex((entry) => String(entry.ID) === String(currentUserId)), myAbsenceUntil);
                              return;
                            }
                            const update = {...item,index:itemIndex,ID:0,name:''};
                            console.log('updateRole',update);
                            updateRole(update);
                          }}>
                          <Octicons name="x-circle" size={24} color="red" style={{ width: 24, marginRight: 15 }} />
                          </Pressable>
                          {isAbsenceRole ? null : <View style={{flexDirection: 'row'}}><Pressable onPress={() => {const update = {...item,index:itemIndex,ID:0,name:''}; console.log('updateRole',update); updateRole(update); setSuggest(item.assignment_key);}}>
                          <Octicons name="paper-airplane" size={24} color="black" style={{ width: 24, marginRight: 15 }} />
                          </Pressable>
                          <Pressable onPress={() => {setEdit(item.assignment_key);}}>
                          <Octicons name="pencil" size={24} color="black" style={{ width: 24 }} />
                          </Pressable>
                          </View>}
                          <View>
                          <Text style={styles.role}><TranslatedText term={item.role} /></Text>
                          <Text style={styles.name}>{name}</Text>
                          </View>
                        </View>
                      )
                    return (
                      <View style={{ flexDirection: 'row', justifyContent: 'start', padding: 10 }}>
                        <Pressable onPress={() => {
                          if(isAbsenceRole) {
                            addSelfSingleMeeting();
                            return;
                          }
                          const update = {...item,index:itemIndex,ID:queryData.user_id,name:queryData.name,wasopen:true};
                          console.log('updateRole',update);
                          updateRole(update);
                          if('Speaker' == item.role) setEdit(item.assignment_key);
                        }}>
                        <Octicons name="plus" size={24} color="black" style={{ width: 24, marginRight: 15 }} />
                        </Pressable>
                        {isAbsenceRole  ? null:  <View style={{flexDirection: 'row'}}>
                          <Pressable onPress={() => {setSuggest(item.assignment_key);}}>
                          <Octicons name="paper-airplane" size={24} color="black" style={{ width: 24, marginRight: 15 }} />
                          </Pressable>
                          <Pressable onPress={() => {setEdit(item.assignment_key);}}>
                          <Octicons name="pencil" size={24} color="black" style={{ width: 24 }} />
                          </Pressable>
                        </View>}
                        <View>
                        <Text style={styles.role}><TranslatedText term={item.role} /></Text>
                        <Text style={styles.name}>{name}</Text>
                        </View>
                      </View>
                    )

                  }}
                />
              </View>
            ) : null}
          </View>
        <VersionCheckModal />
        </SafeAreaView>
      );

}