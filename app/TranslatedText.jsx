import {Text} from 'react-native';
import useClubMeetingStore from './store';

export default function TranslatedText(props) {
    const {queryData, language, logMissedTranslation} = useClubMeetingStore();
    let {term, style} = props;
    if(term && queryData && queryData.translations && queryData.translations[term])
    {
        term = queryData.translations[term];
    } else {
        if(logMissedTranslation)
        console.log('Missed translation',term);
    }
    return <Text style={style}>{term}</Text>;
}

export function translateTerm(term, translations = null) {
    if(!translations || !translations[term]) {
        console.log('Missed translation',term);
        return term;
    }
    return translations[term];
}