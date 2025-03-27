import { StyleSheet, View, Text, ScrollView, Dimensions } from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import {useState} from "react";
import savedLocations from '@/assets/json/saved-locations.json';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { LineChart } from 'react-native-chart-kit';

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
            console.error("Erreur lors de la récupération des données météo : ", error);
        }
    };

    const getValueColor = (value: number, type: 'temp' | 'humidity') => {
        if (type === 'temp') {
            if (value < 10) return '#2196F3'; // Bleu pour froid
            if (value > 25) return '#FF5252'; // Rouge pour chaud
            return '#FFFFFF'; // Blanc pour températures modérées
        }

        if (type === 'humidity') {
            if (value < 30) return '#FF5252'; // Rouge pour sec
            if (value > 70) return '#2196F3'; // Bleu pour humide
            return '#FFFFFF'; // Blanc pour humidité normale
        }

        return '#FFFFFF'; // Couleur par défaut
    };

    // Préparer les données pour le graphique
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
                            <Text style={styles.sectionTitle}>{weatherData.current.name}</Text>
                            <View style={styles.weatherDescription}>
                                <Text style={styles.weatherDescriptionElement}>
                                    Température : 
                                    <Text style={{ color: getValueColor(weatherData.current.main.temp, 'temp') }}>
                                        {weatherData.current.main.temp}°C
                                    </Text>
                                </Text>
                                <Text style={styles.weatherDescriptionElement}>
                                    Conditions : {weatherData.current.weather[0].description.charAt(0).toUpperCase() + weatherData.current.weather[0].description.slice(1)}
                                </Text>
                                <Text style={styles.weatherDescriptionElement}>
                                    Humidité : 
                                    <Text style={{ color: getValueColor(weatherData.current.main.humidity, 'humidity') }}>
                                        {weatherData.current.main.humidity}%
                                    </Text>
                                </Text>
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
        lineHeight: 30,
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
});