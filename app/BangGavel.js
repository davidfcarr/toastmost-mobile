import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function CleanGavelLoading() {
  const swingAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        // Gavel sits poised up in the air
        Animated.timing(swingAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        // Rapid, snappy down-swing strike
        Animated.timing(swingAnim, {
          toValue: 0,
          duration: 90,
          useNativeDriver: true,
        }),
        // Brief pause at the bottom of the strike loop
        Animated.delay(200),
      ])
    );
    
    animation.start();
    return () => animation.stop();
  }, [swingAnim]);

  // Controls the pivot rotation of the gavel assembly
  const gavelRotation = swingAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['15deg', '-35deg'], // Swings naturally through an arc space
  });

  // Slight translation down during the swing to give it weight
  const gavelTranslationY = swingAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, -10],
  });

  return (
    <View style={styles.container}>

      {/* Main Focus Stage */}
      <View style={styles.stage}>

        {/* DYNAMIC GAVEL ASSEMBLY */}
        <Animated.View 
          style={[
            styles.gavelWrapper, 
            { 
              transform: [
                { rotate: gavelRotation },
                { translateY: gavelTranslationY }
              ] 
            }
          ]}
        >
          {/* Long wooden handle */}
          <View style={styles.gavelHandle}>
            <View style={styles.handleTip} />
          </View>

          {/* Detailed Gavel Mallet Head */}
          <View style={styles.gavelHeadContainer}>
            <View style={styles.malletRim} />
            <View style={styles.malletCore}>
              <View style={styles.malletRidge} />
            </View>
            <View style={styles.malletRim} />
          </View>
        </Animated.View>

      </View>

      {/* Footer Loading Text */}
      <Text style={styles.loadingText}>LOADING Club Data...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: height * 0.08,
  },
  textContainer: {
    alignItems: 'center',
  },

  /* MAIN DISPLAY STAGE */
  stage: {
    width: width * 0.9,
    height: height * 0.45,
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* GAVEL PIECES & PIVOT WRAPPER */
  gavelWrapper: {
    width: 220,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  gavelHandle: {
    width: 140,
    height: 14,
    backgroundColor: '#CD853F', // Light polished wood tone
    borderWidth: 2,
    borderColor: '#5C3818',
    borderRadius: 4,
    position: 'absolute',
    left: 10,
    transform: [{ rotate: '-10deg' }],
    flexDirection: 'row',
    alignItems: 'center',
  },
  handleTip: {
    width: 16,
    height: 20,
    backgroundColor: '#8B5A2B',
    borderColor: '#5C3818',
    borderWidth: 2,
    borderRadius: 5,
    left: -6,
  },
  gavelHeadContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    right: 15,
    transform: [{ rotate: '80deg' }], // Orients the blocky head properly against the handle layout
  },
  malletCore: {
    width: 48,
    height: 68,
    backgroundColor: '#8B5A2B', // Rich dark brown wood
    borderWidth: 3,
    borderColor: '#4A2E16',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  malletRidge: {
    width: '100%',
    height: 12,
    backgroundColor: '#CD853F', // Decorative gold inlay ring accent
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#4A2E16',
  },
  malletRim: {
    width: 10,
    height: 56,
    backgroundColor: '#5C3818',
    borderRadius: 2,
    borderWidth: 2,
    borderColor: '#4A2E16',
  },

  /* FOOTER */
  loadingText: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 4,
  },
});