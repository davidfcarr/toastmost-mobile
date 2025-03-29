import { Text, View, Platform } from 'react-native';
import React from 'react';
import RenderHtml from 'react-native-render-html';
//import * as Linking from 'expo-linking';
import { useWindowDimensions } from 'react-native';
import useAgenda from './useAgenda';
import {compareVersions} from 'compare-versions';
const app = require('../app.json');
import { Link } from 'expo-router';

export default function Promo (props) {
    const { width, height } = useWindowDimensions();
    const {toastmostData} = useAgenda();
    const config = app.expo;
    const {version} = config;
    const upgrade = ('android' == Platform.OS) ? 'https://play.google.com/store/apps/details?id=com.toastmost.mobileagenda' : 'https://apps.apple.com/us/app/toastmost/id6741133200';

      return (
        <View style={{margin: 10, marginTop: 20, marginBottom: 150, padding: 10, paddingBottom: 150, borderWidth: 1, borderColor: 'gray' }}>
        <Text>Version {version} {toastmostData.version && toastmostData.latest && compareVersions(version,toastmostData.version) < 0 ? <Text><Text style={{color:'red'}}>A newer version is available.</Text> Latest updates: {toastmostData.latest}. <Link href={upgrade} style={{textDecorationLine: 'underline'}} >Upgrade</Link></Text> : <Text>You have the latest version.</Text>}</Text>
        {(toastmostData && toastmostData.infoScreen) ? <View style={{marginLeft: 5}}><RenderHtml source={{'html':'<html><body>'+toastmostData.infoScreen+'</body></html>'}} contentWidth={width - 20} /></View> : null}
        </View>
      )
}
