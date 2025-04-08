import {Text} from 'react-native';
import useClubMeetingStore from './store';

export default function TranslatedText(props) {
    const {queryData, language, missedTranslation, setMissedTranslation} = useClubMeetingStore();
    let {term, style} = props;
    if(term && queryData && queryData.translations && queryData.translations[term])
    {
        term = queryData.translations[term];
    } else {
        if(missedTranslation && Array.isArray(missedTranslation) && !missedTranslation.includes(term)) {
            setMissedTranslation(missedTranslation.push(term));
        }
    }
    return <Text style={style}>{term}</Text>;
}

export function translateTerm(term, translations = null) {
    if(!translations || !translations[term]) {
        return term;
    }
    return translations[term];
}