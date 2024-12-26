import SelectDropdown from 'react-native-select-dropdown'
import { Text, View, TextInput, Pressable, StyleSheet, FlatList, useWindowDimensions } from "react-native";

export default function Select(props) {
    console.log('chooser select props,',props);

    const styles = StyleSheet.create({
        dropdownButtonStyle: {
          width: '95%',
          height: 50,
          backgroundColor: '#E9ECEF',
          borderRadius: 12,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 12,
          marginBottom: 5,
        },
        dropdownButtonTxtStyle: {
          flex: 1,
          fontSize: 18,
          fontWeight: '500',
          color: '#151E26',
        },
        dropdownButtonArrowStyle: {
          fontSize: 28,
        },
        dropdownButtonIconStyle: {
          fontSize: 28,
          marginRight: 8,
        },
        dropdownMenuStyle: {
          backgroundColor: '#E9ECEF',
          borderRadius: 8,
        },
        dropdownItemStyle: {
          width: '100%',
          flexDirection: 'row',
          paddingHorizontal: 12,
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 8,
        },
        dropdownItemTxtStyle: {
          flex: 1,
          fontSize: 18,
          fontWeight: '500',
          color: '#151E26',
        },
        dropdownItemIconStyle: {
          fontSize: 28,
          marginRight: 8,
        },
      });

    return (
        <SelectDropdown
    data={props.options}
    defaultValueByIndex={props.defaultValueByIndex}
    onSelect={(selectedItem, index) => {
    props.onChange(selectedItem.value);
    console.log(selectedItem, index);
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