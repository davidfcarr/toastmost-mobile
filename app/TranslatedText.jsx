import {Text} from 'react-native';
import useClubMeetingStore from './store';

export default function TranslatedText(props) {
    const {queryData, language} = useClubMeetingStore();
    let {term, style} = props;
    if(term && queryData && queryData.translations && queryData.translations[term])
    {
        term = queryData.translations[term];
    } else {
        console.log('no translation found',term);
    }
    return <Text style={style}>{term}</Text>;
}

export function translateTerm(term, translations = null) {
    if(!translations)
        return term;
    return (translations[term]) ? translations[term] : term;
}