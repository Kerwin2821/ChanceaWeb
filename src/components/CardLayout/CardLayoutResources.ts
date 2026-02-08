import { StyleSheet } from 'react-native';
import { Colors } from '../../utils';

export const styles = StyleSheet.create({
    container: {
        width: '100%',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
        minHeight: 70,
        marginBottom: 10,
        position: 'relative',
        paddingLeft: 68,
        paddingRight: 43,
        borderBottomColor: '#f2f2f2',
        borderStyle: 'solid',
        borderBottomWidth: 2,
    },
    containerPhoto: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        overflow: 'hidden',
        left: 8,
        zIndex: 10,
        width: 50,
        height: 50,
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
    },
});