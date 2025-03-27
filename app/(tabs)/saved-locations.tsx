import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import savedLocationsData from '@/assets/json/saved-locations.json';

interface SavedLocation {
    name: string;
    latitude: number;
    longitude: number;
}

export default function SavedLocationsScreen() {
    const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Load saved locations from both JSON file and AsyncStorage
        loadSavedLocations();
    }, []);
    
    const loadSavedLocations = async () => {
        try {
            setIsLoading(true);
            
            // Get saved locations from AsyncStorage
            const savedLocationsStr = await AsyncStorage.getItem('savedLocations');
            const asyncStorageLocations = savedLocationsStr ? JSON.parse(savedLocationsStr) : [];
            
            // Combine with default locations from JSON file, avoiding duplicates
            const combinedLocations = [...savedLocationsData];
            
            asyncStorageLocations.forEach((location: SavedLocation) => {
                const isDuplicate = combinedLocations.some(
                    loc => loc.latitude === location.latitude && loc.longitude === location.longitude
                );
                
                if (!isDuplicate) {
                    combinedLocations.push(location);
                }
            });
            
            setSavedLocations(combinedLocations);
        } catch (error) {
            console.error('Erreur de chargement:', error);
            Alert.alert("Erreur", "Impossible de charger les emplacements sauvegardés.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddNewLocation = () => {
        router.push('/villes');
    };

    const handleSelectLocation = (location: SavedLocation) => {
        Alert.alert('Location Selected', `${location.name}\nLat: ${location.latitude}, Lon: ${location.longitude}`);
    };
    
    const handleDeleteLocation = async (location: SavedLocation) => {
        try {
            // Check if it's a default location from JSON file
            const isDefaultLocation = savedLocationsData.some(
                loc => loc.latitude === location.latitude && loc.longitude === location.longitude
            );
            
            if (isDefaultLocation) {
                Alert.alert("Information", "Les emplacements par défaut ne peuvent pas être supprimés.");
                return;
            }
            
            Alert.alert(
                "Confirmation",
                `Voulez-vous supprimer ${location.name} de vos favoris ?`,
                [
                    { text: "Annuler", style: "cancel" },
                    {
                        text: "Supprimer",
                        style: "destructive",
                        onPress: async () => {
                            // Get current saved locations
                            const savedLocationsStr = await AsyncStorage.getItem('savedLocations');
                            const currentLocations = savedLocationsStr ? JSON.parse(savedLocationsStr) : [];
                            
                            // Filter out the selected location
                            const updatedLocations = currentLocations.filter(
                                (loc: SavedLocation) => 
                                    loc.latitude !== location.latitude || loc.longitude !== location.longitude
                            );
                            
                            // Save updated list
                            await AsyncStorage.setItem('savedLocations', JSON.stringify(updatedLocations));
                            
                            // Refresh the list
                            loadSavedLocations();
                        }
                    }
                ]
            );
        } catch (error) {
            console.error('Erreur de suppression:', error);
            Alert.alert("Erreur", "Impossible de supprimer cet emplacement.");
        }
    };

    const renderLocationItem = ({ item }: { item: SavedLocation }) => (
        <TouchableOpacity 
            style={styles.locationItem}
            onPress={() => handleSelectLocation(item)}
            onLongPress={() => handleDeleteLocation(item)}
        >
            <Text style={styles.locationName}>{item.name}</Text>
            <Text style={styles.coordinates}>Latitude: {item.latitude}</Text>
            <Text style={styles.coordinates}>Longitude: {item.longitude}</Text>
            <Text style={styles.hintText}>Appuyez longuement pour supprimer</Text>
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

                    {isLoading ? (
                        <Text style={styles.emptyText}>Chargement des villes...</Text>
                    ) : savedLocations.length === 0 ? (
                        <Text style={styles.emptyText}>Aucune ville enregistrée</Text>
                    ) : (
                        <FlatList
                            data={savedLocations}
                            renderItem={renderLocationItem}
                            keyExtractor={(item, index) => `${item.name}-${item.latitude}-${item.longitude}-${index}`}
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
    hintText: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.6)',
        fontStyle: 'italic',
        marginTop: 5,
        textAlign: 'right'
    },
});
