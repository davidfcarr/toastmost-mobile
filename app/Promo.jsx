import { Text, View } from 'react-native';
import React from 'react';
import RenderHtml from 'react-native-render-html';
//import * as Linking from 'expo-linking';
import { useWindowDimensions } from 'react-native';
import useAgenda from './useAgenda';
import {compareVersions} from 'compare-versions';
const app = require('../app.json');

export default function Promo (props) {
    const { width, height } = useWindowDimensions();
    const {toastmostData} = useAgenda();
    const config = app.expo;
    const {version} = config;

      return (
        <View style={{width: '100%', marginBottom: 150, paddingBottom: 150 }}>
        <Text>Version {version} {toastmostData.version && toastmostData.latest && compareVersions(version,toastmostData.version) < 0 ? <Text><Text style={{color:'red'}}>A newer version is available.</Text> Latest updates: {toastmostData.latest}</Text> : <Text>You have the latest version.</Text>}</Text>        
        {(toastmostData && toastmostData.infoScreen) ? <View style={{marginLeft: 5}}><RenderHtml source={{'html':'<html><body>'+toastmostData.infoScreen+'</body></html>'}} contentWidth={width - 20} /></View> : null}
        </View>
      )
}
