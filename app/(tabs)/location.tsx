import React, { useState, useEffect } from 'react';
import {View, Text, StyleSheet, Button, PermissionsAndroid, ScrollView, Image, Dimensions, Alert} from 'react-native';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import Header from "@/app/header";
import { Ionicons } from '@expo/vector-icons';

const OPENWEATHERMAP_API_KEY = "1c856f19750baa7aac089533da337ecb";

// Interface pour typer les données météo
interface WeatherData {
    temp: number;
    condition: string;
    details: {
        humidity: number;
        wind: number;
        pressure: number;
        feelsLike: number;
        visibility: number;
    };
    forecast: {
        time: string;
        temp: number;
        icon: string;
    }[];
}

const LocationScreen = () => {
    const [location, setLocation] = useState<any>(null);
    const [error, setError] = useState<any>(null);
    const [loading, setLoading] = useState<any>(true);
    const [address, setAddress] = useState<any>(null);
    const [weather, setWeather] = useState<WeatherData | null>(null);

    // Fonction pour récupérer les données météo depuis l'API OpenWeatherMap
    const fetchWeatherData = async (latitude: number, longitude: number) => {
        try {
            // Récupération des données actuelles
            const currentResponse = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&lang=fr&appid=${OPENWEATHERMAP_API_KEY}`
            );
            const currentData = await currentResponse.json();
            
            if (currentData.cod && currentData.cod !== 200) {
                throw new Error(currentData.message || 'Erreur lors de la récupération des données météo');
            }
            
            // Récupération des prévisions
            const forecastResponse = await fetch(
                `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&lang=fr&appid=${OPENWEATHERMAP_API_KEY}`
            );
            const forecastData = await forecastResponse.json();
            
            if (forecastData.cod && forecastData.cod !== '200') {
                throw new Error(forecastData.message || 'Erreur lors de la récupération des prévisions');
            }
            
            // Transformer les données au format attendu par l'application
            const weatherData: WeatherData = {
                temp: Math.round(currentData.main.temp),
                condition: currentData.weather[0].description.charAt(0).toUpperCase() + currentData.weather[0].description.slice(1),
                details: {
                    humidity: currentData.main.humidity,
                    wind: Math.round(currentData.wind.speed * 3.6), // Conversion m/s en km/h
                    pressure: currentData.main.pressure,
                    feelsLike: Math.round(currentData.main.feels_like),
                    visibility: Math.round(currentData.visibility / 1000), // Conversion m en km
                },
                forecast: forecastData.list.slice(0, 6).map((item: any) => {
                    const date = new Date(item.dt * 1000);
                    const hours = date.getHours();
                    return {
                        time: `${hours}h`,
                        temp: Math.round(item.main.temp),
                        icon: mapWeatherIconToApp(item.weather[0].icon),
                    };
                })
            };
            
            return weatherData;
        } catch (error: any) {
            console.error('Erreur API météo:', error);
            throw error;
        }
    };
    
    // Fonction pour mapper les codes d'icônes OpenWeatherMap aux icônes de l'app
    const mapWeatherIconToApp = (iconCode: string): string => {
        const iconMapping: {[key: string]: string} = {
            '01d': 'clear',
            '01n': 'clear-night',
            '02d': 'partly-cloudy',
            '02n': 'partly-cloudy',
            '03d': 'cloudy',
            '03n': 'cloudy',
            '04d': 'cloudy',
            '04n': 'cloudy',
            '09d': 'rain',
            '09n': 'rain',
            '10d': 'rain',
            '10n': 'rain',
            '11d': 'thunderstorm',
            '11n': 'thunderstorm',
            '13d': 'snow',
            '13n': 'snow',
            '50d': 'mist',
            '50n': 'mist',
        };
        return iconMapping[iconCode] || 'clear';
    };

    const getCurrentLocation = async () => {
        setLoading(true);
        setError(null);
        setAddress(null);
        setWeather(null);

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
            if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                setError('Permission refusée !');
                setLoading(false);
                return;
            }

            let location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
            });
            setLocation(location.coords);

            let addressResponse = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            });
            if (addressResponse.length > 0) {
                setAddress(addressResponse[0]);
            }

            // Appel à l'API OpenWeatherMap
            try {
                const weatherData = await fetchWeatherData(
                    location.coords.latitude,
                    location.coords.longitude
                );
                setWeather(weatherData);
            } catch (weatherError: any) {
                setError('Erreur données météo : ' + weatherError.message);
            }

            setLoading(false);
        } catch (err: any) {
            setError('Erreur : ' + err.message);
            setLoading(false);
        }
    };

    const refreshPage = () => {
        getCurrentLocation();
    };

    const getWeatherImage = (icon: string) => {
        const iconMap: { [key: string]: any } = {
            'clear': require('@/assets/images/clear.png'),
            'clear-night': require('@/assets/images/clear-night.png'),
            'partly-cloudy': require('@/assets/images/partly-cloudy.png'),
            'cloudy': require('@/assets/images/cloudy.png'),
            'rain': require('@/assets/images/rain.png'),
            'thunderstorm': require('@/assets/images/thunderstorm.png'),
            'snow': require('@/assets/images/snow.png'),
            'mist': require('@/assets/images/mist.png'),
        };
        return iconMap[icon] || require('@/assets/images/default.png');
    };

    useEffect(() => {
        getCurrentLocation();
    }, []);

    return (
        <LinearGradient
            colors={['rgba(32,112,238,1)', 'rgba(93,138,191,1)', 'rgba(169,207,214,1)']}
            style={styles.gradient}>
            <Header title="MétéOù" onRefresh={refreshPage}></Header>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <Text style={styles.loadingText}>Chargement de votre position...</Text>
                    </View>
                ) : error ? (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{error}</Text>
                        <Button
                            title="Réessayer"
                            onPress={getCurrentLocation}
                            color="#2070EE"
                        />
                    </View>
                ) : location ? (
                    <View style={styles.contentContainer}>
                        <View style={styles.locationSection}>
                            <Text style={styles.sectionTitle}>Localisation</Text>
                            <View style={styles.locationBox}>
                                <View style={styles.addressContainer}>
                                    <Ionicons name="location" size={20} color="#fff" />
                                    <Text style={styles.cityText}>
                                        {address?.city || 'Inconnu'}
                                    </Text>
                                </View>
                                <View style={styles.coordsContainer}>
                                    <Text style={styles.coordsText}>
                                        Lat: {location.latitude.toFixed(4)}
                                    </Text>
                                    <Text style={styles.coordsText}>
                                        Long: {location.longitude.toFixed(4)}
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.weatherSection}>
                            <View style={styles.weatherMain}>
                                <Image
                                    source={getWeatherImage(weather?.forecast[0]?.icon || 'clear')}
                                    style={styles.weatherImage}
                                />
                                <Text style={styles.temperatureText}>
                                    {weather?.temp || '--'}°C
                                </Text>
                                <Text style={styles.weatherCondition}>
                                    {weather?.condition || ''}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.forecastContainer}>
                            <Text style={styles.sectionTitle}>Prévisions horaires</Text>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.forecastScroll}>
                                {weather?.forecast?.map((item: any, index: number) => (
                                    <View key={index} style={styles.forecastCard}>
                                        <Text style={styles.forecastTime}>{item.time}</Text>
                                        <Image
                                            source={getWeatherImage(item.icon)}
                                            style={styles.forecastImage}
                                        />
                                        <Text style={styles.forecastTemp}>{item.temp}°C</Text>
                                    </View>
                                ))}
                            </ScrollView>
                        </View>

                        <View style={styles.detailsSection}>
                            <Text style={styles.sectionTitle}>Détails Météo</Text>
                            <View style={styles.detailsGrid}>
                                <View style={styles.detailItem}>
                                    <Ionicons name="water" size={20} color="#fff" />
                                    <Text style={styles.detailLabel}>Humidité</Text>
                                    <Text style={styles.detailValue}>
                                        {weather?.details?.humidity || '--'}%
                                    </Text>
                                </View>
                                <View style={styles.detailItem}>
                                    <Ionicons name="speedometer" size={20} color="#fff" />
                                    <Text style={styles.detailLabel}>Pression</Text>
                                    <Text style={styles.detailValue}>
                                        {weather?.details?.pressure || '--'} hPa
                                    </Text>
                                </View>
                                <View style={styles.detailItem}>
                                    <Ionicons name="flag" size={20} color="#fff" />
                                    <Text style={styles.detailLabel}>Vent</Text>
                                    <Text style={styles.detailValue}>
                                        {weather?.details?.wind || '--'} km/h
                                    </Text>
                                </View>
                                <View style={styles.detailItem}>
                                    <Ionicons name="thermometer" size={20} color="#fff" />
                                    <Text style={styles.detailLabel}>Ressenti</Text>
                                    <Text style={styles.detailValue}>
                                        {weather?.details?.feelsLike || '--'}°C
                                    </Text>
                                </View>
                                <View style={styles.detailItem}>
                                    <Ionicons name="eye" size={20} color="#fff" />
                                    <Text style={styles.detailLabel}>Visibilité</Text>
                                    <Text style={styles.detailValue}>
                                        {weather?.details?.visibility || '--'} km
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                ) : null}
            </ScrollView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
        padding: 20,
        paddingBottom: 40,
    },
    contentContainer: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: Dimensions.get('window').height * 0.7,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 10,
        marginLeft: 5,
    },
    locationSection: {
        marginBottom: 20,
    },
    locationBox: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 15,
        padding: 15,
    },
    addressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    cityText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginLeft: 8,
    },
    addressText: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        marginBottom: 10,
    },
    coordsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 5,
    },
    coordsText: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
        fontFamily: 'monospace',
    },
    weatherSection: {
        marginBottom: 20,
    },
    weatherMain: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 15,
        padding: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    weatherImage: {
        width: 60,
        height: 60,
        marginBottom: 10,
    },
    temperatureText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#fff',
    },
    weatherCondition: {
        fontSize: 18,
        color: '#fff',
        marginTop: 5,
    },
    forecastContainer: {
        marginBottom: 25,
    },
    forecastScroll: {
        paddingHorizontal: 10,
    },
    forecastCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 12,
        padding: 15,
        marginRight: 10,
        alignItems: 'center',
        minWidth: 80,
    },
    forecastTime: {
        color: '#fff',
        fontSize: 14,
        marginBottom: 5,
    },
    forecastImage: {
        width: 30,
        height: 30,
        marginBottom: 5,
    },
    forecastTemp: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    detailsSection: {
        marginBottom: 20,
    },
    detailsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    detailItem: {
        width: '48%',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        alignItems: 'center',
    },
    detailLabel: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        marginTop: 5,
    },
    detailValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 3,
    },
    loadingText: {
        fontSize: 18,
        color: '#fff',
        textAlign: 'center',
    },
    errorContainer: {
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        padding: 25,
        borderRadius: 12,
        width: '90%',
        alignSelf: 'center',
        marginTop: 50,
    },
    errorText: {
        color: '#ffcccc',
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
    },
});

export default LocationScreen;