import { StyleSheet, View, Text, ScrollView } from 'react-native';
import MapView, {Marker} from 'react-native-maps';
import {useState} from "react";
import savedLocations from '@/assets/json/saved-locations.json';

export default function HomeScreen() {
    const [selectedCoordinate, setSelectedCoordinate] = useState(null);

    const handleMapPress = (event: { nativeEvent: { coordinate: any; }; }) => {
        const { coordinate } = event.nativeEvent;
        setSelectedCoordinate(coordinate);
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
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 10,
    },
});