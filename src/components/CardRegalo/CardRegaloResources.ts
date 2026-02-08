import { StyleSheet, Platform } from 'react-native';
import { Colors } from '../../utils';
import { height, width } from '../../utils/Helpers';

export const styles = StyleSheet.create({
    container: {
        width: Math.min(width * 0.75, 380), // Capped to match toggle switch and avoid overflow on Web
        height: 135,
        alignItems: 'center',
        flexDirection: 'row',
        marginBottom: 16,
        backgroundColor: Colors.white,
        borderRadius: 20,
        // Improved Shadow for Web/App visibility
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        paddingHorizontal: 16,
        borderWidth: 1,
        borderColor: '#EFEFEF', // Subtle border to prevent "melting" into background
        alignSelf: 'center',
    },
    containerPhoto: {
        width: 85,
        height: 85,
        borderRadius: 12,
        overflow: 'hidden',
    },
    contentInfo: {
        flex: 1,
        paddingLeft: 16,
        justifyContent: 'center',
    },
    containerAvatar: {
        width: 32,
        height: 32,
        position: 'absolute',
        right: -8,
        bottom: -8,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: Colors.white,
        backgroundColor: Colors.gray,
        overflow: 'hidden',
        zIndex: 20,
    },
    statusBadge: {
        marginTop: 8,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
        alignSelf: 'flex-start',
    },
    statusText: {
        fontSize: 11,
        color: Colors.white,
    }
});