import SelectDropdown from 'react-native-select-dropdown'
import { Text, View, TextInput, Pressable, StyleSheet, FlatList, useWindowDimensions } from "react-native";
import styles from './styles'
export default function Select(props) {
    return (
        <SelectDropdown
    data={props.options}
    defaultValueByIndex={props.defaultValueByIndex}
    onSelect={(selectedItem, index) => {
    props.onChange(selectedItem.value);
    }}
    renderButton={(selectedItem, isOpened) => {
      return (
        <View style={styles.dropdownButtonStyle}>
          <Text style={styles.dropdownButtonTxtStyle}>
            {(selectedItem && selectedItem.label) || props.label}
          </Text>
        </View>
      );
    }}
    renderItem={(item, index, isSelected) => {
      return (
        <View style={{...styles.dropdownItemStyle, ...(isSelected && {backgroundColor: '#D2D9DF'})}}>
          <Text style={styles.dropdownItemTxtStyle}>{item.label}</Text>
        </View>
      );
    }}
    showsVerticalScrollIndicator={false}
    dropdownStyle={styles.dropdownMenuStyle}
  />
    )
}