import React, { useRef, useEffect } from "react";
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from "react-native-maps";
const MapComponent = MapView as any;
import { StyleSheet, View, Platform } from "react-native";
import { mapStyle } from "../../utils/Theme";

export interface Coordinate {
    latitude: number;
    longitude: number;
}

export interface MapMarker {
    id: string | number;
    coordinate: Coordinate;
    title?: string;
    description?: string;
    image?: string; // URL for the marker image
    content?: React.ReactNode; // Custom marker content
    onPress?: () => void;
}

interface CustomMapProps {
    initialRegion?: {
        latitude: number;
        longitude: number;
        latitudeDelta: number;
        longitudeDelta: number;
    };
    region?: {
        latitude: number;
        longitude: number;
        latitudeDelta: number;
        longitudeDelta: number;
    };
    markers?: MapMarker[];
    showUserLocation?: boolean;
    userLocation?: Coordinate;
    userLocationRadius?: number; // In meters
    children?: React.ReactNode;
    onMapReady?: () => void;
    onMapPress?: (event: { coordinate: Coordinate }) => void;
    style?: any;
}

const CustomMap: React.FC<CustomMapProps> = ({
    initialRegion,
    region,
    markers,
    showUserLocation,
    userLocation,
    userLocationRadius,
    children,
    onMapReady,
    onMapPress,
    style,
}) => {
    const mapRef = useRef<any>(null);

    useEffect(() => {
        if (region && mapRef.current) {
            mapRef.current.animateToRegion(region, 350);
        }
    }, [region]);

    return (
        <MapComponent
            ref={mapRef}
            style={[styles.map, style] as any}
            initialRegion={initialRegion}
            onMapReady={onMapReady}
            onPress={(e: any) => {
                if (onMapPress) {
                    onMapPress({
                        coordinate: e.nativeEvent.coordinate
                    });
                }
            }}
            customMapStyle={mapStyle}
            provider={PROVIDER_GOOGLE}
            showsUserLocation={false}
        >
            {userLocation && (
                <>
                    <Marker coordinate={userLocation} pinColor="blue">
                    </Marker>
                    {userLocationRadius && (
                        <Circle
                            center={userLocation}
                            radius={userLocationRadius}
                            strokeColor="rgba(0,0,255,0.5)"
                            fillColor="rgba(0,0,255,0.1)"
                        />
                    )}
                </>
            )}

            {markers?.map((marker) => (
                <Marker
                    key={marker.id}
                    coordinate={marker.coordinate}
                    title={marker.title}
                    description={marker.description}
                    onPress={marker.onPress}
                    tracksViewChanges={false}
                >
                    {marker.content}
                </Marker>
            ))}

            {children}
        </MapComponent>
    );
};

const styles = StyleSheet.create({
    map: {
        ...StyleSheet.absoluteFillObject,
    },
});

export default CustomMap;
