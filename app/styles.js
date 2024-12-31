import { StyleSheet } from "react-native";

const styles = createStyles();
export default styles;

function createStyles() {
    return StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: 'white',
        marginLeft: 'auto',
        marginRight: 'auto',
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
    })
  }