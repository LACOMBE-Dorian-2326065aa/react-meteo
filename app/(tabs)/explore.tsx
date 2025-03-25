import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, PermissionsAndroid, Platform } from 'react-native';
import Geolocation from 'react-native-geolocation-service';


export default function LocationScreen() {
    const [position, setPosition] = useState<any>(null);
    const [error, setError] = useState<string>("null");

    const requestLocationPermission = async () => {
        try {
            if (Platform.OS === 'android') {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
                );
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            }
            return true;
        } catch (err) {
            return false;
        }
    };

    const getLocation = async () => {
        try {
            const hasPermission = await requestLocationPermission();

            if (!hasPermission) {
                return;
            }

            Geolocation.getCurrentPosition(
                (pos) => {
                    setPosition({
                        latitude: pos.coords.latitude,
                        longitude: pos.coords.longitude,
                        accuracy: pos.coords.accuracy,
                    });
                },
                (err) => setError(err.message),
                { enableHighAccuracy: true, timeout: 15000 }
            );
        } catch (error) {
            return;
        }
    };

    useEffect(() => {
        getLocation();
    }, []);

    return (
        <View style={styles.container}>
            {position ? (
                <View style={styles.coordinatesContainer}>
                    <Text style={styles.text}>Latitude: {position.latitude.toFixed(6)}</Text>
                    <Text style={styles.text}>Longitude: {position.longitude.toFixed(6)}</Text>
                    <Text style={styles.text}>Précision: {position.accuracy}m</Text>
                </View>
            ) : (
                <Text style={styles.loading}>Chargement de la position...</Text>
            )}

            {error && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>⚠️ Erreur: {error}</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    coordinatesContainer: {
        backgroundColor: '#f8f9fa',
        padding: 20,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    text: {
        fontSize: 18,
        marginVertical: 5,
        color: '#333',
    },
    loading: {
        fontSize: 18,
        color: '#666',
    },
    errorContainer: {
        position: 'absolute',
        bottom: 30,
        backgroundColor: '#ffebe6',
        padding: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ff3b30',
    },
    errorText: {
        color: '#ff3b30',
        fontSize: 16,
    }

});