import {useState} from 'react';
import { Text, View, useWindowDimensions} from "react-native";
import styles from './styles'
import RenderHtml from 'react-native-render-html';
import useAgenda from './useAgenda';

export default function Footer (props) {
    const {toastmostData} = useAgenda();
    const { width, height } = useWindowDimensions();
    const [done,setDone] = useState(false);

    if (done) {
      return null;
    }
    
    setTimeout(() => {
      setDone(true);
    }
    , 5000);

    return (
    <View style={styles.footer}>
      {(toastmostData && toastmostData.infoScreen) ? <RenderHtml source={{'html':'<html><body>'+toastmostData.infoScreen+'</body></html>'}} contentWidth={width - 50} /> : null}
    </View>
    );
}