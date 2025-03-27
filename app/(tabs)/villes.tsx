import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ActivityIndicator, FlatList, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface City {
    name: string;
    lat: number;
    lon: number;
    country: string;
    state?: string;
}

export default function VillesScreen() {
    const [cityName, setCityName] = useState('');
    const [cities, setCities] = useState<City[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchCityCoordinates = async () => {
        if (!cityName.trim()) {
            setError('Veuillez entrer un nom de ville');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const apiKey = '1c856f19750baa7aac089533da337ecb'; 
            const response = await fetch(
                `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityName)}&limit=5&appid=${apiKey}`
            );

            if (!response.ok) {
                throw new Error('Erreur réseau');
            }

            const data = await response.json();
            
            if (data.length === 0) {
                setError('Aucune ville trouvée');
                setCities([]);
            } else {
                setCities(data);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            setError('Erreur lors de la recherche: ' + errorMessage);
            setCities([]);
        } finally {
            setLoading(false);
        }
    };

    const renderCityItem = ({ item }: { item: City }) => (
        <View style={styles.cityItem}>
            <Text style={styles.cityName}>{item.name}, {item.country} {item.state ? `(${item.state})` : ''}</Text>
            <Text style={styles.coordinates}>Latitude: {item.lat}</Text>
            <Text style={styles.coordinates}>Longitude: {item.lon}</Text>
        </View>
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
                    <Text style={styles.sectionTitle}>Recherche de Villes</Text>
                    
                    <View style={styles.searchContainer}>
                        <TextInput
                            style={styles.input}
                            value={cityName}
                            onChangeText={setCityName}
                            placeholder="Entrez le nom d'une ville"
                            placeholderTextColor="rgba(255,255,255,0.7)"
                        />
                        <TouchableOpacity 
                            style={styles.button} 
                            onPress={fetchCityCoordinates}
                            disabled={loading}
                        >
                            <Text style={styles.buttonText}>Rechercher</Text>
                        </TouchableOpacity>
                    </View>

                    {error && <Text style={styles.errorText}>{error}</Text>}
                    
                    {loading ? (
                        <ActivityIndicator size="large" color="#FFFFFF" style={styles.loader} />
                    ) : (
                        <FlatList
                            data={cities}
                            renderItem={renderCityItem}
                            keyExtractor={(item, index) => `${item.name}-${item.lat}-${item.lon}-${index}`}
                            style={styles.list}
                            scrollEnabled={false}
                            ListEmptyComponent={
                                !error && !loading ? (
                                    <Text style={styles.emptyText}>Aucun résultat à afficher</Text>
                                ) : null
                            }
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
    searchContainer: {
        flexDirection: 'row',
        marginBottom: 20,
        gap: 10
    },
    input: {
        flex: 1,
        height: 50,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
        borderRadius: 8,
        paddingHorizontal: 16,
        backgroundColor: 'rgba(255,255,255,0.2)',
        color: '#FFFFFF',
        fontSize: 16
    },
    button: {
        backgroundColor: 'rgba(33,150,243,0.9)',
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        paddingHorizontal: 20,
        elevation: 2
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16
    },
    errorText: {
        color: '#FF5252',
        marginBottom: 10,
        textAlign: 'center',
        fontWeight: '500'
    },
    loader: {
        marginTop: 20,
        marginBottom: 30
    },
    list: {
        flex: 1,
        marginTop: 10
    },
    cityItem: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        padding: 16,
        marginVertical: 8,
        borderRadius: 8,
        borderLeftWidth: 4,
        borderLeftColor: '#2196F3',
    },
    cityName: {
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