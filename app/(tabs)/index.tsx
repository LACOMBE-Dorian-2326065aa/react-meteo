import { StyleSheet, View, Text, ScrollView } from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import {useState} from "react";
import savedLocations from '@/assets/json/saved-locations.json';
import axios from 'axios';
import Constants from 'expo-constants';

export default function HomeScreen() {
    const [selectedCoordinate, setSelectedCoordinate] = useState<any>(null);
    const [weatherData, setWeatherData] = useState<any>(null);

    const handleMapPress = async (event: { nativeEvent: { coordinate: any; }; }) => {
        const { coordinate } = event.nativeEvent;
        setSelectedCoordinate(coordinate);

        try {
            const currentResponse = await axios.get(
                `https://api.openweathermap.org/data/2.5/weather?lat=${coordinate.latitude}&lon=${coordinate.longitude}&appid=1c856f19750baa7aac089533da337ecb&units=metric&lang=fr`
            );

            const forecastResponse = await axios.get(
                `https://api.openweathermap.org/data/2.5/forecast?lat=${coordinate.latitude}&lon=${coordinate.longitude}&appid=1c856f19750baa7aac089533da337ecb&units=metric&lang=fr`
            );

            setWeatherData({
                current: currentResponse.data,
                forecast: forecastResponse.data
            });

        } catch (error) {
            console.error("Erreur lors de la récupération des données météo:", error);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>MétéOù</Text>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.mapContainer}>
                    <MapView
                        style={styles.map}
                        initialRegion={{
                            latitude: 48.8566,
                            longitude: 2.3522,
                            latitudeDelta: 0.0922,
                            longitudeDelta: 0.0421,
                        }}
                        onPress={handleMapPress}
                    >
                        {savedLocations.map((location: any, index: any) => (
                            <Marker
                                key={index}
                                coordinate={{ latitude: location.latitude, longitude: location.longitude }}
                                title={location.name}
                            />
                        ))}
                        {selectedCoordinate && (
                            <Marker
                                coordinate={selectedCoordinate}
                                title="Position sélectionnée"
                            />
                        )}
                    </MapView>
                </View>

                {weatherData && (
                    <View style={styles.weatherContainer}>
                        <Text style={styles.sectionTitle}>Météo actuelle</Text>
                        <Text>Température: {weatherData.current.main.temp}°C</Text>
                        <Text>Conditions: {weatherData.current.weather[0].description}</Text>
                        <Text>Humidité: {weatherData.current.main.humidity}%</Text>

                        <Text style={styles.sectionTitle}>Prévisions</Text>
                        {weatherData.forecast.list.slice(0, 5).map((forecast: any, index: any) => (
                            <View key={index} style={styles.forecastItem}>
                                <Text>{new Date(forecast.dt * 1000).toLocaleTimeString()}</Text>
                                <Text>Temp: {forecast.main.temp}°C</Text>
                                <Text>{forecast.weather[0].description}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        backgroundColor: '#2f95dc',
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
    mapContainer: {
        height: 400,
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 20,
    },
    map: {
        flex: 1,
    },
    weatherContainer: {
        marginTop: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 10,
        marginTop: 10,
    },
    forecastItem: {
        marginBottom: 10,
        padding: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
    },
});