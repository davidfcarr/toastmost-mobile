import { StyleSheet } from "react-native";

const styles = createStyles();
export default styles;

function createStyles() {
    return StyleSheet.create({
      container: {
        flex: 1,
        flexGrow: 1,
        backgroundColor: 'white',
        width: '100%',
        marginLeft: 'auto',
        marginRight: 'auto',
        padding: 5,
      },
      inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        padding: 10,
        width: '100%',
        maxWidth: 1024,
        marginHorizontal: 'auto',
        pointerEvents: 'auto',
      },
      domainContainer : {
        flexDirection: 'column',
      },
      input: {
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        padding: 10,
        marginRight: 10,
        fontSize: 18,
        color: 'gray',
        height: 50,
      },
      chooseButton: {
        backgroundColor: 'black',
        borderRadius: 5,
        padding: 10,
        margin: 5,
        width: 300,
      },
      addButton: {
        backgroundColor: 'black',
        borderRadius: 5,
        padding: 10,
        marginRight: 5,
      },
      addButtonText: {
        fontSize: 18,
        color: 'white',
      },
      todoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 4,
        padding: 10,
        borderBottomColor: 'gray',
        borderBottomWidth: 1,
        width: '100%',
        maxWidth: 1024,
        marginHorizontal: 'auto',
        pointerEvents: 'auto',
      },
      todoText: {
        flex: 1,
        fontSize: 18,
        fontFamily: 'Inter_500Medium',
        color: 'black',
      },
      instructions: {
        margin: 5,
      },
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
        borderWidth: 2,
        borderColor: 'black',
        width: '70%',
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
        borderWidth: 2,
        borderColor: 'black',
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
    })
  }