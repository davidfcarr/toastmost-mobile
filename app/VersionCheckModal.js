import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity, Linking, Platform } from 'react-native';

// Only import VersionCheck on native platforms
let VersionCheck = null;
if (Platform.OS !== 'web') {
  try {
    VersionCheck = require('react-native-version-check-expo').default;
  } catch (e) {
    console.warn('Failed to load version check:', e);
  }
}

import useClubMeetingStore from './store';

const SNOOZE_KEY = '@app_update_snooze_time';
const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000; // in milliseconds

export default function VersionCheckModal() {
  const [isVisible, setIsVisible] = useState(false);
  const [storeUrl, setStoreUrl] = useState('');
  const { lastSnoozed, setLastSnoozed } = useClubMeetingStore();

  useEffect(() => {
    checkVersionRequirement();
  }, []);

  const checkVersionRequirement = async () => {

    // Skip version check on web
    if (!VersionCheck || Platform.OS === 'web') {
      return;
    }

    try {
      // 1. Check if the user snoozed the alert within the last 24 hours
      if (lastSnoozed) {
        const timePassed = Date.now() - parseInt(lastSnoozed, 10);
        if (timePassed < TWENTY_FOUR_HOURS) {
          return; // Exit early, do not show the modal
        }
      }

      // 2. Compare current version with store version
      const updateInfo = await VersionCheck.needUpdate();
      
      if (updateInfo && updateInfo.isNeeded) {
        // Get the appropriate store URL
        const url = Platform.OS === 'ios' 
          ? await VersionCheck.getAppStoreUrl()
          : await VersionCheck.getPlayStoreUrl();
        
        setStoreUrl(url);
        setIsVisible(true);
      }
    } catch (error) {
      console.error('Failed to check app version:', error);
    }
  };

  const handleNotNow = async () => {
    try {
      // Save the current timestamp to snooze the modal for 24 hours
      const { setLastSnoozed } = useClubMeetingStore();
      setLastSnoozed(Date.now());
      setIsVisible(false);
    } catch (error) {
      console.error('Failed to save snooze time:', error);
    }
  };

  const handleUpdate = () => {
    if (storeUrl) {
      Linking.openURL(storeUrl).catch((err) => 
        console.error('Failed to open store link:', err)
      );
    }
  };

  return (
    <Modal
      transparent
      animationType="fade"
      visible={isVisible}
      onRequestClose={() => {}} // Disables Android back button closing
    >
      <View style={styles.overlay}>
        <View style={styles.alertContainer}>
          <Text style={styles.title}>Update Available</Text>
          <Text style={styles.message}>
            A new version of the app is available. Please update to get the latest features and bug fixes.
          </Text>
          
          <View style={styles.buttonContainer}>
            
            <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={handleUpdate}>
              <Text style={styles.primaryButtonText}>Update</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={handleNotNow}>
              <Text style={styles.secondaryButtonText}>Not Now</Text>
            </TouchableOpacity>

          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  message: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  primaryButton: {
    backgroundColor: '#007AFF', // Standard iOS blue, change to your theme color
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: '#f0f0f0',
  },
  secondaryButtonText: {
    color: '#555',
    fontWeight: '600',
    fontSize: 16,
  },
});