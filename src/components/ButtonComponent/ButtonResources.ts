import { StyleSheet } from 'react-native';
import { Colors } from '../../utils';
export const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 45,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.blackBackground,
    borderRadius: 40,
    shadowColor: Colors.blackBackground,
    shadowOffset: {
      width: 0,
      height: 0
    },
    marginBottom: 10,
  },
  buttonCancel: {
    backgroundColor: Colors.white,
    borderWidth:2,
    borderColor:Colors.primary
  },
  buttonDisabled: {
    backgroundColor: Colors.gray,
    shadowColor: Colors.transparent,
    borderColor: Colors.transparent
  },
  buttonGhost: {
    borderColor: Colors.transparent,
    shadowColor: Colors.transparent,
    backgroundColor: Colors.transparent
  },
  icon: {
    tintColor: Colors.white,
    marginRight: 8,
    width: 30,
    height: 30,
  },
  text: {
    fontSize: 14,
    fontFamily: 'Bold',
    textAlign: "center",
  }
});
