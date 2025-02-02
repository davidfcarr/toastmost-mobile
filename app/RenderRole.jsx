import { Text, View, ScrollView, TextInput, Pressable, Image, AppState, Switch, FlatList } from "react-native";
import ProjectChooser from './ProjectChooser';
import styles from './styles'

export default function RenderRole({ item, index, updateRole, user_id, name }) {
      
  return (
    <View key={item.assignment_key}>
    <View style={{flexDirection: 'row',marginTop: 5,alignContent:'center'}}>
        {(item.ID == 0) ? <Pressable style={styles.addButton} onPress={() => { const newitem = {...item}; newitem.ID = user_id; newitem.name = name; console.log('newitem',newitem); updateRole(newitem); }}><Text  style={styles.addButtonText}>+</Text></Pressable> : null}
        {(item.ID == user_id) ? <Pressable style={[styles.addButton,{backgroundColor:'red'}]} onPress={() => { const newitem = {...item}; newitem.ID = 0; newitem.name=''; updateRole(newitem);  }}><Text  style={styles.addButtonText}>-</Text></Pressable>: null}
        <Text style={{paddingTop: 10,fontSize: 20, marginLeft: ((item.ID != 0) && (item.ID != user_id)) ? 33: 5}}> 
          {item.role} {item.name} 
        </Text>
    </View>
        {(item.ID == user_id && 'Speaker' == item.role) ? <View>
        <ProjectChooser {...item} updateRole={updateRole} styles={styles} />
 </View> : null}
      </View>
)

}
