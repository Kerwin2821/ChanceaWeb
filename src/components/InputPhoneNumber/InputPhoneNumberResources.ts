import { StyleSheet } from 'react-native';
import { Colors } from '../../utils';

export const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: 50,
    borderStyle: 'solid',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    position: 'relative',
    height: 50,
    borderWidth:2,
    borderColor:Colors.primary,
  },
  icon: {
    width: 30,
    height: 30,
    tintColor: 'rgba(0,0,0,.5)'
  },
  containerIcon: {
    position: 'absolute',
    right: 8,
    top: 10
  },
  input: {
    width: '100%',
    height: 50,
    color: Colors.black,
    fontSize: 16,
    fontFamily: 'Regular',
    paddingLeft: 10,
    alignItems: 'center'
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  label: {
    width: '100%',
    color: Colors.black,
    fontSize: 14,
    fontFamily: 'SemiBold',
    paddingLeft: 8
  }
});
