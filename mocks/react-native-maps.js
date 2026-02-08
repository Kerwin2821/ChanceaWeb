import React, { forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MapView = forwardRef((props, ref) => {
    useImperativeHandle(ref, () => ({
        animateToRegion: (region, duration) => {
            console.log('Mock MapView: animateToRegion called', region);
        },
        animateCamera: (camera, duration) => { },
        fitToCoordinates: (coordinates, options) => { },
        fitToSuppliedMarkers: (markers, options) => { },
        fitToElements: (options) => { },
    }));

    return (
        <View style={[styles.container, props.style]}>
            <Text style={styles.text}>Map not available on Web</Text>
            {props.children}
        </View>
    );
});

export const Marker = (props) => null;
export const Callout = (props) => null;
export const Circle = (props) => null;
export const Polyline = (props) => null;
export const Polygon = (props) => null;
export const UrlTile = (props) => null;
export const LocalTile = (props) => null;
export const Overlay = (props) => null;
export const Heatmap = (props) => null;
export const Geojson = (props) => null;

export const PROVIDER_GOOGLE = 'google';
export const PROVIDER_DEFAULT = 'default';

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#e1e1e1',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        color: '#333',
        padding: 10,
    },
});

export default MapView;
