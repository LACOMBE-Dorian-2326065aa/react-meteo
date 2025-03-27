import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, PermissionsAndroid, Platform, Button, Linking } from 'react-native';
import Geolocation from 'react-native-geolocation-service';

export default function LocationScreen() {
    const [position, setPosition] = useState<any>(null);
    const [error, setError] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const requestLocationPermission = async () => {
        try {
            let granted;
            if (Platform.OS === 'android') {
                granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
                );
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            }
        } catch (err) {
            console.warn(err);
            return false;
        }
    };

    const checkLocationEnabled = async () => {
        try {
            const enabled = await Geolocation.getProviderStatus();
            if (!enabled.locationEnabled) {
                setError("Activez le service de localisation dans les paramètres du téléphone");
                setIsLoading(false);
                return false;
            }
            return true;
        } catch (error) {
            setError("Impossible de vérifier l'état de la localisation");
            setIsLoading(false);
            return false;
        }
    };

    const getLocation = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const isLocationEnabled = await checkLocationEnabled();
            if (!isLocationEnabled) return;

            const hasPermission = await requestLocationPermission();

            if (!hasPermission) {
                setError("Autorisation requise - Ouvrez les paramètres de l'application pour l'activer");
                setIsLoading(false);
                return;
            }

            Geolocation.getCurrentPosition(
                (pos) => {
                    setPosition({
                        latitude: pos.coords.latitude,
                        longitude: pos.coords.longitude,
                        accuracy: pos.coords.accuracy,
                    });
                    setIsLoading(false);
                },
                (err) => {
                    setError(err.message || "Impossible d'obtenir la position");
                    setIsLoading(false);
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
            );
        } catch (error) {
            setError("Erreur critique lors de l'accès à la localisation");
            setIsLoading(false);
        }
    };

    const openSettings = () => {
        Linking.openSettings();
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
                    <Text style={styles.text}>Précision: {position.accuracy.toFixed(0)} mètres</Text>
                </View>
            ) : (
                <Text style={styles.loading}>
                    {isLoading ? "Chargement de la position..." : "Aucune position disponible"}
                </Text>
            )}

            {error && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>⚠️ {error}</Text>
                    <Button
                        title="Réessayer"
                        onPress={getLocation}
                        color="#007AFF"
                    />
                    <Button
                        title="Ouvrir les paramètres"
                        onPress={openSettings}
                        color="#FF3B30"
                    />
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