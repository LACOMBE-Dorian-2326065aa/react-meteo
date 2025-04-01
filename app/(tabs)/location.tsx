import React, { useState, useEffect } from 'react';
import {View, Text, StyleSheet, Button, PermissionsAndroid, ScrollView, Image, Dimensions} from 'react-native';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import Header from "@/app/header";
import { Ionicons } from '@expo/vector-icons';

const LocationScreen = () => {
    const [location, setLocation] = useState<any>(null);
    const [error, setError] = useState<any>(null);
    const [loading, setLoading] = useState<any>(true);
    const [address, setAddress] = useState<any>(null);
    const [weather, setWeather] = useState<any>(null);

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

            const mockWeather = {
                temp: 22,
                condition: 'Ensoleillé',
                details: {
                    humidity: 65,
                    wind: 12,
                    pressure: 1012,
                    feelsLike: 24,
                    visibility: 10
                },
                forecast: [
                    { time: '12h', temp: 22, icon: 'clear' },
                    { time: '15h', temp: 24, icon: 'partly-cloudy' },
                    { time: '18h', temp: 20, icon: 'rain' },
                    { time: '21h', temp: 18, icon: 'clear-night' },
                    { time: '00h', temp: 16, icon: 'cloudy' },
                    { time: '03h', temp: 15, icon: 'mist' },
                ]
            };
            setWeather(mockWeather);

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
                                    source={getWeatherImage('clear')}
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