import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export interface Coordinate {
    latitude: number;
    longitude: number;
}

export interface MapMarker {
    id: string | number;
    coordinate: Coordinate;
    title?: string;
    description?: string;
    image?: string;
    content?: React.ReactNode;
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
    userLocationRadius?: number;
    children?: React.ReactNode;
    onMapReady?: () => void;
    onMapPress?: (event: { coordinate: Coordinate }) => void;
    style?: any;
}

const CustomMap: React.FC<CustomMapProps> = ({
    initialRegion,
    region,
    markers,
    userLocation,
    onMapReady,
    onMapPress,
    style,
}) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    const markersRef = useRef<L.Marker[]>([]);
    const [mapError, setMapError] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    const lat = region?.latitude || initialRegion?.latitude || markers?.[0]?.coordinate?.latitude || 0;
    const lng = region?.longitude || initialRegion?.longitude || markers?.[0]?.coordinate?.longitude || 0;

    // Initialize Map
    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;

        try {
            // Validate coordinates
            const centerLat = typeof lat === 'number' && !isNaN(lat) ? lat : 0;
            const centerLng = typeof lng === 'number' && !isNaN(lng) ? lng : 0;

            const map = L.map(mapContainerRef.current, {
                center: [centerLat, centerLng],
                zoom: 15,
                zoomControl: true,
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            map.on('click', (e) => {
                if (onMapPress) {
                    onMapPress({
                        coordinate: {
                            latitude: e.latlng.lat,
                            longitude: e.latlng.lng
                        }
                    });
                }
            });

            mapRef.current = map;
            setIsLoaded(true);
            if (onMapReady) onMapReady();

            // Force a resize check after a small delay to ensure it fills the container
            setTimeout(() => {
                map.invalidateSize();
            }, 100);

        } catch (err) {
            console.error("Error initializing Leaflet map:", err);
            setMapError("No se pudo cargar el mapa. Verifica tu conexión.");
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    // Update markers and center when they change
    useEffect(() => {
        if (!mapRef.current || !isLoaded) return;

        const map = mapRef.current;

        // Clear existing markers
        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];

        // Add user location if available
        if (userLocation && !isNaN(userLocation.latitude) && !isNaN(userLocation.longitude)) {
            const userMarker = L.marker([userLocation.latitude, userLocation.longitude])
                .addTo(map)
                .bindPopup("Estás aquí");
            markersRef.current.push(userMarker);
        }

        // Add markers
        if (markers && markers.length > 0) {
            markers.forEach(marker => {
                if (isNaN(marker.coordinate.latitude) || isNaN(marker.coordinate.longitude)) return;

                // Create a custom marker icon (User Photo in circle)
                const markerHtml = marker.image
                    ? `
                        <div style="
                            width: 60px; 
                            height: 60px; 
                            border-radius: 30px; 
                            border: 3px solid white; 
                            box-shadow: 0 2px 8px rgba(0,0,0,0.4);
                            overflow: hidden;
                            background-color: #ddd;
                        ">
                            <img src="${marker.image}" style="width: 100%; height: 100%; object-fit: cover;" />
                        </div>
                    `
                    : `
                        <div style="
                            background-color: #553986; 
                            width: 36px; 
                            height: 36px; 
                            border-radius: 18px; 
                            border: 2px solid white; 
                            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            color: white;
                        ">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                <polyline points="9 22 9 12 15 12 15 22"></polyline>
                            </svg>
                        </div>
                    `;

                const customIcon = L.divIcon({
                    html: markerHtml,
                    className: 'custom-user-icon',
                    iconSize: marker.image ? [60, 60] : [36, 36],
                    iconAnchor: marker.image ? [30, 30] : [18, 18],
                    popupAnchor: [0, marker.image ? -30 : -18]
                });

                const m = L.marker([marker.coordinate.latitude, marker.coordinate.longitude], {
                    icon: customIcon
                }).addTo(map);

                if (marker.title || marker.description) {
                    m.bindPopup(`<b>${marker.title || ''}</b><br/>${marker.description || ''}`);
                }

                if (marker.onPress) {
                    m.on('click', () => marker.onPress!());
                }

                markersRef.current.push(m);
            });
        }

        // Update view if region changes
        if (typeof lat === 'number' && typeof lng === 'number' && !isNaN(lat) && !isNaN(lng)) {
            map.setView([lat, lng], map.getZoom());
        }

    }, [markers, userLocation, lat, lng, isLoaded]);

    if (mapError) {
        return (
            <View style={[styles.container, style, styles.centered]}>
                <Text style={styles.errorText}>{mapError}</Text>
                <TouchableOpacity
                    onPress={() => window.location.reload()}
                    style={styles.retryButton}
                >
                    <Text style={styles.retryText}>Reintentar</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={[styles.container, style]}>
            <div
                ref={mapContainerRef}
                style={{ height: '100%', width: '100%' }}
            />
            {!isLoaded && (
                <View style={[StyleSheet.absoluteFill, styles.centered]}>
                    <ActivityIndicator size="large" color="#553986" />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        overflow: 'hidden',
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: '#6c757d',
        textAlign: 'center',
        marginBottom: 15,
        paddingHorizontal: 20,
    },
    retryButton: {
        backgroundColor: '#553986',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    retryText: {
        color: 'white',
        fontWeight: 'bold',
    }
});

export default CustomMap;
