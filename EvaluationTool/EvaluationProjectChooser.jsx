import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Text, Platform } from 'react-native';
import SelectDropdown from 'react-native-select-dropdown';
import TranslatedText from './TranslatedText';
import useClubMeetingStore from "./store";
import { AntDesign } from '@expo/vector-icons';

export function EvaluationProjectChooser(props) {
    const { project, setProject } = props.project;
    const [isLoading, setIsLoading] = useState(true);
    const [pathsData, setPathsData] = useState(null);
    const [selectedPath, setSelectedPath] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('');
    const [levels, setLevels] = useState([]);
    const [projects, setProjects] = useState([]);
    
    const {clubs} = useClubMeetingStore();
    const club = (clubs && clubs.length) ? clubs[0] : {};

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const response = await fetch('https://'+club.domain+'/wp-json/rsvptm/v1/paths_and_projects');
            const data = await response.json();
            console.log('Fetched data paths:', data.paths); 
            // Verify data structure
            if (Array.isArray(data.paths)) {
                const formattedPaths = data.paths.map(path => ({
                    label: path.label || String(path),
                    value: path.value || String(path)
                }));
                setPathsData({...data, paths: formattedPaths});
            } else {
                console.error('Paths data is not an array:', data.paths);
            }
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching projects:', error);
            setIsLoading(false);
        }
    };

    // Add a useEffect to monitor state changes
    useEffect(() => {
        console.log('pathsData updated:', pathsData?.paths);
    }, [pathsData]);

    const handlePathSelect = (selectedItem) => {
        setSelectedPath(selectedItem.value);
        setSelectedLevel('');
        setProject(null);
        
        // Update levels based on selected path
        if (pathsData?.manuals && pathsData.manuals[selectedItem.value]) {
            setLevels(pathsData.manuals[selectedItem.value].filter(item => item.value !== ''));
        } else {
            setLevels([]);
        }
        setProjects([]);
    };

    const handleLevelSelect = (selectedItem) => {
        setSelectedLevel(selectedItem.value);
        setProject(null);
        
        // Update projects based on selected level
        if (pathsData?.projects && pathsData.projects[selectedItem.value]) {
            setProjects(pathsData.projects[selectedItem.value].filter(item => item.value !== ''));
        } else {
            setProjects([]);
        }
    };

    if (isLoading) {
        return <ActivityIndicator size="large" />;
    }

    return (
        <View style={styles.projectChooserContainer}>
            <View style={styles.dropdownSection}>
                <TranslatedText term="Select Path" style={styles.label} />
                <SelectDropdown
                    data={pathsData?.paths || []}
                    defaultButtonText="Choose a Path"
                    onSelect={handlePathSelect}
                    buttonTextAfterSelection={(selectedItem) => selectedItem.label}
                    rowTextForSelection={(item) => item.label}
                    buttonStyle={styles.dropdownButton}
                    buttonTextStyle={styles.dropdownButtonText}
                    dropdownStyle={styles.dropdown}
                    rowStyle={styles.dropdownItemStyle}
                    rowTextStyle={styles.dropdownItemTxtStyle}
                    renderDropdownIcon={(isOpened) => (
                        <View style={styles.iconContainer}>
                            <AntDesign 
                                name={isOpened ? 'caretup' : 'caretdown'} 
                                size={12} 
                                color="#444"
                            />
                        </View>
                    )}
                    dropdownIconPosition="right"
                    defaultValue={selectedPath || null}
                />
            </View>

            {selectedPath && (
                <View style={styles.dropdownSection}>
                    <TranslatedText term="Select Level" style={styles.label} />
                    <SelectDropdown
                        data={levels}
                        defaultButtonText="Choose a Level"
                        onSelect={handleLevelSelect}
                        buttonTextAfterSelection={(selectedItem) => selectedItem.label}
                        rowTextForSelection={(item) => item.label}
                        buttonStyle={styles.dropdownButton}
                        buttonTextStyle={styles.dropdownButtonText}
                        rowStyle={styles.dropdownItemStyle}
                        rowTextStyle={styles.dropdownItemTxtStyle}
                        dropdownStyle={styles.dropdown}
                        renderDropdownIcon={(isOpened) => (
                            <View style={styles.iconContainer}>
                                <AntDesign 
                                    name={isOpened ? 'caretup' : 'caretdown'} 
                                    size={12} 
                                    color="#444"
                                />
                            </View>
                        )}
                        dropdownIconPosition="right"
                    />
                </View>
            )}

            {selectedLevel && (
                <View style={styles.dropdownSection}>
                    <TranslatedText term="Select Project" style={styles.label} />
                    <SelectDropdown
                        data={projects}
                        defaultButtonText="Choose a Project"
                        onSelect={(selectedItem) => setProject(selectedItem)}
                        buttonTextAfterSelection={(selectedItem) => selectedItem.label}
                        rowTextForSelection={(item) => item.label}
                        buttonStyle={styles.dropdownButton}
                        buttonTextStyle={styles.dropdownButtonText}
                        rowStyle={styles.dropdownItemStyle}
                        rowTextStyle={styles.dropdownItemTxtStyle}
                        dropdownStyle={styles.dropdown}
                        renderDropdownIcon={(isOpened) => (
                            <View style={styles.iconContainer}>
                                <AntDesign 
                                    name={isOpened ? 'caretup' : 'caretdown'} 
                                    size={12} 
                                    color="#444"
                                />
                            </View>
                        )}
                        dropdownIconPosition="right"
                    />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    projectChooserContainer: {
        padding: 16,
        backgroundColor: '#fff',
        width: '100%',
    },
    dropdownSection: {
        marginBottom: 20,
        width: '100%',
        alignItems: 'center',
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        color: '#333',
        alignSelf: 'flex-start',
    },
    dropdownButton: {
        width: '90%',
        height: 50,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#dee2e6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dropdownButtonText: {
        fontSize: 16,
        color: '#333333',
        textAlign: 'left',
        fontFamily: Platform.select({
            ios: 'System',
            android: 'Roboto'
        }),
    },
    iconContainer: {
        padding: 8,
    },
    dropdown: {
        width: '90%',
        backgroundColor: '#ffffff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#dee2e6',
        marginTop: 0,
    },
    dropdownItemStyle: {
        borderBottomWidth: 1,
        borderBottomColor: '#dee2e6',
    },
    dropdownItemTxtStyle: {
        color: '#333333',
        fontSize: 16,
        textAlign: 'left',
    }
});
