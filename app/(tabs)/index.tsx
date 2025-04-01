import { StyleSheet, View, Text, ScrollView, Dimensions, TouchableOpacity, Image } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useEffect, useState, useRef } from "react";
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart } from 'react-native-chart-kit';
import { Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';

let initialLocations = require('@/assets/json/saved-locations.json');

interface LocationWeather {
    [key: string]: {
        icon: string;
        temp: number;
    };
}

export default function HomeScreen() {
    const [selectedCoordinate, setSelectedCoordinate] = useState<any>(null);
    const [weatherData, setWeatherData] = useState<any>(null);
    const [savedLocations, setSavedLocations] = useState<any[]>(initialLocations);
    const [locationsWeather, setLocationsWeather] = useState<LocationWeather>({});
    const mapRef = useRef<MapView>(null);
    const params = useLocalSearchParams();

    const refreshPage = () => {
        setSelectedCoordinate(null);
        setWeatherData(null);
        loadSavedLocations();
    };

    const loadSavedLocations = async () => {
        try {
            const saved = await AsyncStorage.getItem('savedLocations');
            if (saved) {
                const parsed = JSON.parse(saved);
                const allLocations = [...initialLocations, ...parsed];
                setSavedLocations(allLocations);

                const weathers = await Promise.all(
                    allLocations.map(async (location) => {
                        try {
                            const response = await axios.get(
                                `https://api.openweathermap.org/data/2.5/weather?lat=${location.latitude}&lon=${location.longitude}&appid=1c856f19750baa7aac089533da337ecb&units=metric`
                            );
                            return {
                                id: `${location.latitude},${location.longitude}`,
                                data: {
                                    icon: response.data.weather[0].icon,
                                    temp: response.data.main.temp
                                }
                            };
                        } catch (error) {
                            console.error("Erreur météo pour", location.name, error);
                            return null;
                        }
                    })
                );

                const weatherMap = weathers.reduce((acc, curr) => {
                    if (curr) acc[curr.id] = curr.data;
                    return acc;
                }, {} as LocationWeather);

                setLocationsWeather(weatherMap);
            }
        } catch (error) {
            console.error('Erreur de chargement:', error);
        }
    };

    useEffect(() => {
        const {latitude, longitude} = params;

        if (latitude && longitude) {
            const lat = parseFloat(String(latitude));
            const lon = parseFloat(String(longitude));

            if (!isNaN(lat) && !isNaN(lon)) {
                const coordinate = {latitude: lat, longitude: lon};
                setSelectedCoordinate(coordinate);
                fetchWeatherForLocation(coordinate);

                if (mapRef.current) {
                    mapRef.current.animateToRegion({
                        latitude: lat,
                        longitude: lon,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                    }, 1000);
                }
            }
        }
        loadSavedLocations();
    }, [params.latitude, params.longitude]);

    const fetchWeatherForLocation = async (coordinate: { latitude: number, longitude: number }) => {
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
            console.error("Erreur lors de la récupération des données météo : ", error);
        }
    };

    const saveLocation = async (coordinate: any, locationName: string) => {
        if (!coordinate || !locationName) return;

        const newLocation = {
            name: locationName,
            latitude: coordinate.latitude,
            longitude: coordinate.longitude,
        };

        try {
            const updatedLocations = [...savedLocations, newLocation];
            setSavedLocations(updatedLocations);

            await AsyncStorage.setItem(
                'savedLocations',
                JSON.stringify(updatedLocations.filter(loc => !initialLocations.includes(loc)))
            );

            try {
                const response = await axios.get(
                    `https://api.openweathermap.org/data/2.5/weather?lat=${coordinate.latitude}&lon=${coordinate.longitude}&appid=1c856f19750baa7aac089533da337ecb&units=metric`
                );

                setLocationsWeather(prev => ({
                    ...prev,
                    [`${coordinate.latitude},${coordinate.longitude}`]: {
                        icon: response.data.weather[0].icon,
                        temp: response.data.main.temp
                    }
                }));
            } catch (error) {
                console.error("Erreur météo pour la nouvelle position", error);
            }

            alert('Position enregistrée avec succès !');
        } catch (error) {
            console.error('Erreur de sauvegarde:', error);
            alert('Erreur lors de la sauvegarde');
        }
    };

    const handleMapPress = async (event: { nativeEvent: { coordinate: any; }; }) => {
        const { coordinate } = event.nativeEvent;
        setSelectedCoordinate(coordinate);
        fetchWeatherForLocation(coordinate);
    };

    const getValueColor = (value: number, type: 'temp' | 'humidity') => {
        if (type === 'temp') {
            if (value < 10) return '#2196F3';
            if (value > 25) return '#FF5252';
            return '#000';
        }

        if (type === 'humidity') {
            if (value < 30) return '#FF5252';
            if (value > 70) return '#2196F3';
            return '#000';
        }

        return '#000';
    };

    const getWeatherIcon = (iconCode: string) => {
        const iconMap: { [key: string]: any } = {
            '01d': require('@/assets/images/clear.png'),
            '01n': require('@/assets/images/clear-night.png'),
            '02d': require('@/assets/images/partly-cloudy.png'),
            '02n': require('@/assets/images/partly-cloudy-night.png'),
            '03d': require('@/assets/images/cloudy.png'),
            '03n': require('@/assets/images/cloudy.png'),
            '04d': require('@/assets/images/cloudy.png'),
            '04n': require('@/assets/images/cloudy.png'),
            '09d': require('@/assets/images/rain.png'),
            '09n': require('@/assets/images/rain.png'),
            '10d': require('@/assets/images/rain.png'),
            '10n': require('@/assets/images/rain.png'),
            '11d': require('@/assets/images/thunderstorm.png'),
            '11n': require('@/assets/images/thunderstorm.png'),
            '13d': require('@/assets/images/snow.png'),
            '13n': require('@/assets/images/snow.png'),
            '50d': require('@/assets/images/mist.png'),
            '50n': require('@/assets/images/mist.png'),
        };
        return iconMap[iconCode] || require('@/assets/images/default.png');
    };

    const prepareChartData = () => {
        if (!weatherData?.forecast) return null;

        const labels = weatherData.forecast.list
            .slice(0, 8)
            .map((item: any) => new Date(item.dt * 1000).getHours() + 'h');

        const temps = weatherData.forecast.list
            .slice(0, 8)
            .map((item: any) => item.main.temp);

        return {
            labels,
            datasets: [
                {
                    data: temps,
                    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                    strokeWidth: 2
                }
            ]
        };
    };

    const chartData = prepareChartData();

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={['rgba(32,112,238,1)', 'rgba(93,138,191,1)', 'rgba(169,207,214,1)']}
                style={styles.gradient}
            >
                <View style={styles.header}>
                    <Text style={styles.title}>MétéOù</Text>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={refreshPage}
                    >
                        <Ionicons name="refresh" size={24} color="white" />
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    <View style={styles.mapContainer}>
                        <MapView
                            ref={mapRef}
                            style={styles.map}
                            initialRegion={{
                                latitude: 48.8566,
                                longitude: 2.3522,
                                latitudeDelta: 0.0922,
                                longitudeDelta: 0.0421,
                            }}
                            onPress={handleMapPress}
                        >
                            {savedLocations.map((location: any, index: any) => {
                                const locationId = `${location.latitude},${location.longitude}`;
                                const weather = locationsWeather[locationId];

                                return (
                                    <Marker
                                        key={index}
                                        coordinate={{ latitude: location.latitude, longitude: location.longitude }}
                                        title={location.name}
                                    >
                                        <View style={styles.markerContainer}>
                                            {weather ? (
                                                <>
                                                    <Image
                                                        source={getWeatherIcon(weather.icon)}
                                                        style={styles.weatherIcon}
                                                    />
                                                    <Text style={styles.markerTemp}>{Math.round(weather.temp)}°</Text>
                                                </>
                                            ) : (
                                                <Image
                                                    source={require('@/assets/images/default.png')}
                                                    style={styles.defaultMarker}
                                                />
                                            )}
                                        </View>
                                    </Marker>
                                );
                            })}
                            {selectedCoordinate && (
                                <Marker
                                    coordinate={selectedCoordinate}
                                    title="Position sélectionnée"
                                >
                                    <View style={styles.selectedMarker}>
                                        <Image
                                            source={require('@/assets/images/default.png')}
                                            style={styles.selectedMarkerIcon}
                                        />
                                    </View>
                                </Marker>
                            )}
                        </MapView>
                    </View>

                    {weatherData && (
                        <View style={styles.weatherContainer}>
                            <Text style={styles.sectionTitle}>{weatherData.current.name}</Text>
                            <View style={styles.weatherDescription}>
                                <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 8}}>
                                    <Text style={[styles.weatherDescriptionElement, {flex: 1}]}>Température :</Text>
                                    <View style={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                        borderRadius: 16,
                                        paddingHorizontal: 12,
                                        paddingVertical: 4
                                    }}>
                                        <Text style={{
                                            color: getValueColor(weatherData.current.main.temp, 'temp'),
                                            fontWeight: '800',
                                            fontSize: 16
                                        }}>
                                            {Math.round(weatherData.current.main.temp)}°C
                                        </Text>
                                    </View>
                                </View>

                                <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 8}}>
                                    <Text style={[styles.weatherDescriptionElement, {flex: 1}]}>Conditions :</Text>
                                    <Text style={[styles.weatherDescriptionElement, {fontWeight: '600'}]}>
                                        {weatherData.current.weather[0].description.charAt(0).toUpperCase() +
                                            weatherData.current.weather[0].description.slice(1)}
                                    </Text>
                                </View>

                                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                    <Text style={[styles.weatherDescriptionElement, {flex: 1}]}>Humidité :</Text>
                                    <View style={{
                                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                        borderRadius: 16,
                                        paddingHorizontal: 12,
                                        paddingVertical: 4
                                    }}>
                                        <Text style={{
                                            color: getValueColor(weatherData.current.main.humidity, 'humidity'),
                                            fontWeight: '800',
                                            fontSize: 16
                                        }}>
                                            {weatherData.current.main.humidity}%
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            <View style={styles.saveButton}>
                                <Button
                                    title="Enregistrer la position"
                                    onPress={() => saveLocation(selectedCoordinate, weatherData.current.name)}
                                />
                            </View>
                            <Text style={styles.sectionTitle}>Prévisions sur 24h</Text>

                            {chartData && (
                                <View style={styles.chartContainer}>
                                    <LineChart
                                        data={chartData}
                                        width={Dimensions.get('window').width - 55}
                                        height={230}
                                        yAxisSuffix="°C"
                                        yAxisInterval={1}
                                        chartConfig={{
                                            backgroundColor: 'rgba(32, 112, 238, 0.3)',
                                            backgroundGradientFrom: 'rgba(32, 112, 238, 0.6)',
                                            backgroundGradientTo: 'rgba(93, 138, 191, 0.8)',
                                            decimalPlaces: 1,
                                            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                                            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                                            style: {
                                                borderRadius: 8
                                            },
                                            propsForDots: {
                                                r: '5',
                                                strokeWidth: '2',
                                                stroke: '#fff',
                                                fill: '#2070EE'
                                            },
                                            propsForBackgroundLines: {
                                                strokeWidth: 0.5,
                                                stroke: 'rgba(255, 255, 255, 0.3)'
                                            },
                                            propsForVerticalLabels: {
                                                dx: -5
                                            }
                                        }}
                                        bezier
                                        style={{
                                            borderRadius: 8,
                                            paddingRight: 50
                                        }}
                                    />
                                </View>
                            )}

                            <Text style={styles.sectionTitle}>Détails des prévisions</Text>
                            <View style={styles.forecastDetails}>
                                {weatherData.forecast.list.slice(0, 5).map((forecast: any, index: any) => (
                                    <View key={index} style={styles.forecastDetailItem}>
                                        <Text style={styles.forecastTime}>
                                            {new Date(forecast.dt * 1000).toLocaleTimeString([], { hour: '2-digit' })}
                                        </Text>
                                        <Text style={styles.forecastTemp}>
                                            {Math.round(forecast.main.temp)}°C
                                        </Text>
                                        <Text style={styles.forecastDescription}>
                                            {weatherData.current.weather[0].description.charAt(0).toUpperCase() + weatherData.current.weather[0].description.slice(1)}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
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
        position: 'relative',
    },
    backButton: {
        position: 'absolute',
        left: 16,
        top: 55,
    },
    backButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
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
    weatherDescription: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 8,
        padding: 10,
    },
    weatherDescriptionElement: {
        color: '#fff',
        fontSize: 16,
        lineHeight: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 10,
        marginTop: 10,
        color: '#fff',
        textAlign: 'center',
        letterSpacing: 1
    },
    chartContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 16,
        padding: 10,
        marginBottom: 20,
    },
    forecastDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
    },
    forecastDetailItem: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 8,
        padding: 12,
        marginBottom: 10,
        width: '48%',
        alignItems: 'center',
    },
    forecastTime: {
        color: '#fff',
        fontWeight: 'bold',
        marginBottom: 5,
    },
    forecastTemp: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    forecastDescription: {
        color: '#fff',
        fontSize: 12,
        textAlign: 'center',
    },
    saveButton: {
        marginTop: 10,
        marginBottom: 30,
    },
    markerContainer: {
        alignItems: 'center',
        width: 35,
        transform: [{ translateY: 12 }],
    },
    weatherIcon: {
        width: 20,
        height: 20,
        resizeMode: 'contain',
        transform: [{scale: 1.5}],
    },
    markerTemp: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
        marginTop: -13,
        marginRight: -16,
        textShadowColor: 'rgba(0, 0, 0, 1)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    defaultMarker: {
        width: 40,
        height: 40,
        resizeMode: 'contain',
    },
    selectedMarker: {
        alignItems: 'center',
    },
    selectedMarkerIcon: {
        width: 40,
        height: 40,
        resizeMode: 'contain',
    }
});