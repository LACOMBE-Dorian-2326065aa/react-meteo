import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, PermissionsAndroid, Platform, Button, Linking } from 'react-native';
import Geolocation from 'react-native-geolocation-service';

export default function LocationScreen() {
    const [position, setPosition] = useState<{
        latitude: number;
        longitude: number;
        accuracy: number;
    } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const requestLocationPermission = async () => {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    title: "Autorisation de localisation",
                    message: "Cette application a besoin d'accéder à votre position",
                    buttonNeutral: "Demander plus tard",
                    buttonNegative: "Annuler",
                    buttonPositive: "OK"
                }
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        } catch (err) {
            console.warn("Erreur de permission:", err);
            return false;
        }
    };

    const getLocation = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const hasPermission = await requestLocationPermission();

            if (!hasPermission) {
                setError("Autorisation refusée - Activez la localisation dans les paramètres");
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
                    const errorMessages: { [key: number]: string } = {
                        1: "Permission refusée dans les paramètres",
                        2: "GPS désactivé - Activez-le dans les paramètres",
                        3: "Timeout - Vérifiez votre connexion Internet"
                    };
                    setError(errorMessages[err.code] || "Erreur inconnue");
                    setIsLoading(false);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 10000
                }
            );
        } catch (error) {
            setError("Erreur critique : " + (error instanceof Error ? error.message : JSON.stringify(error)));
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
                    <Text style={styles.text}>Précision: ±{position.accuracy.toFixed(0)} mètres</Text>
                </View>
            ) : (
                <Text style={styles.loading}>
                    {isLoading ? "Chargement de la position..." : "Position non disponible"}
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
                        title="Paramètres"
                        onPress={openSettings}
                        color="#34C759"
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