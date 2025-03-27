import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import * as Location from 'expo-location';

const LocationScreen = () => {
    const [location, setLocation] = useState<any>(null);
    const [error, setError] = useState<any>(null);
    const [loading, setLoading] = useState<any>(true);

    const getCurrentLocation = async () => {
        setLoading(true);
        setError(null);

        try {
            // Demande la permission
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setError('Permission refusée !');
                setLoading(false);
                return;
            }

            // Récupère la position
            let location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });

            setLocation(location.coords);
            setLoading(false);
        } catch (err: any) {
            setError('Erreur : ' + err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        getCurrentLocation();
    }, []);

    return (
        <View style={styles.container}>
            {loading ? (
                <Text>Chargement...</Text>
            ) : error ? (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <Button title="Réessayer" onPress={getCurrentLocation} />
                </View>
            ) : location ? (
                <View style={styles.locationContainer}>
                    <Text style={styles.title}>Votre position :</Text>
                    <Text>Latitude: {location.latitude?.toFixed(6)}</Text>
                    <Text>Longitude: {location.longitude?.toFixed(6)}</Text>
                    <Text>Précision: {location.accuracy?.toFixed(0)} mètres</Text>
                </View>
            ) : null}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    locationContainer: {
        alignItems: 'center',
        padding: 20,
        borderRadius: 10,
        backgroundColor: '#f5f5f5',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
    },
    text: {
        fontSize: 16,
        marginVertical: 5,
        color: '#555',
    },
    errorContainer: {
        alignItems: 'center',
    },
    errorText: {
        color: 'red',
        marginBottom: 15,
        fontSize: 16,
    },
});

export default LocationScreen;