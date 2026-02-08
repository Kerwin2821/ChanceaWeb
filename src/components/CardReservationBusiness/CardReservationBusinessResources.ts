import { StyleSheet } from 'react-native';
import { Colors } from '../../utils';
import { height } from '../../utils/Helpers';

export const styles = StyleSheet.create({
    container: {
        width: '90%',
        height: height * 0.15,
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
        minHeight: 130,
        marginBottom: 10,
        position: 'relative',
        borderColor: Colors.primary,
        paddingRight: 43,
        borderWidth: 2,
        borderRadius:16,
    },
    containerPhoto: {
        width: 70,
        height: 70,
    },
    containerChildren: {
        width: '100%',
    },
    containerIcon: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        right: 8,
        zIndex: 10,
    },
    icon: {
        tintColor: 'rgba(66, 66, 66, .5)',
        width: 20,
        height: 20,
    },
    bar: {
        backgroundColor: Colors.white,
        width: 70,
        height: 4,
        position: 'absolute',
        left: 0,
        bottom: -3,
    }
  });