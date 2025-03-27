import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import savedLocationsData from '@/assets/json/saved-locations.json';

interface SavedLocation {
    name: string;
    latitude: number;
    longitude: number;
}

export default function SavedLocationsScreen() {
    const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);

    useEffect(() => {
        // Load saved locations from JSON file
        // In a real app, this would be loaded from AsyncStorage or a database
        setSavedLocations(savedLocationsData);
    }, []);

    const handleAddNewLocation = () => {
        // Navigate to the search cities screen
        router.push('/villes');
    };

    const handleSelectLocation = (location: SavedLocation) => {
        // In a real app, you might want to do something when a location is selected
        Alert.alert('Location Selected', `${location.name}\nLat: ${location.latitude}, Lon: ${location.longitude}`);
    };

    const renderLocationItem = ({ item }: { item: SavedLocation }) => (
        <TouchableOpacity 
            style={styles.locationItem}
            onPress={() => handleSelectLocation(item)}
        >
            <Text style={styles.locationName}>{item.name}</Text>
            <Text style={styles.coordinates}>Latitude: {item.latitude}</Text>
            <Text style={styles.coordinates}>Longitude: {item.longitude}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['rgba(32,112,238,1)', 'rgba(93,138,191,1)', 'rgba(169,207,214,1)']}
                style={styles.gradient}
            >
                <View style={styles.header}>
                    <Text style={styles.title}>MétéOù</Text>
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    <Text style={styles.sectionTitle}>Villes Enregistrées</Text>
                    
                    <TouchableOpacity 
                        style={styles.addButton} 
                        onPress={handleAddNewLocation}
                    >
                        <Text style={styles.addButtonText}>+ Ajouter une nouvelle ville</Text>
                    </TouchableOpacity>

                    {savedLocations.length === 0 ? (
                        <Text style={styles.emptyText}>Aucune ville enregistrée</Text>
                    ) : (
                        <FlatList
                            data={savedLocations}
                            renderItem={renderLocationItem}
                            keyExtractor={(item, index) => `${item.name}-${item.latitude}-${item.longitude}`}
                            style={styles.list}
                            scrollEnabled={false}
                        />
                    )}
                </ScrollView>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        paddingTop: 40
    },
    content: {
        padding: 16,
    },
    gradient: {
        flex: 1,
        padding: 1,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 20,
        color: '#fff',
        textAlign: 'center',
        letterSpacing: 1
    },
    addButton: {
        backgroundColor: 'rgba(33,150,243,0.9)',
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
        alignItems: 'center',
        elevation: 2
    },
    addButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16
    },
    list: {
        flex: 1,
        marginTop: 10
    },
    locationItem: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        padding: 16,
        marginVertical: 8,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#2196F3',
    },
    locationName: {
        fontSize: 17,
        fontWeight: '600',
        marginBottom: 6,
        color: '#FFFFFF'
    },
    coordinates: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        color: 'rgba(255,255,255,0.7)',
        fontSize: 16
    },
});
