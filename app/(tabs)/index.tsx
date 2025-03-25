import { Image, StyleSheet, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';

export default function HomeScreen() {
    return (
        <ParallaxScrollView
            headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
            headerImage={
                <Image
                    source={require('@/assets/images/meteo-banner.png')}
                    style={styles.reactLogo}
                />
            }>

            <View style={styles.mapContainer}>
                <MapView
                    style={styles.map}
                    initialRegion={{
                        latitude: 48.8566,
                        longitude: 2.3522,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                    }}
                >
                </MapView>
            </View>

            <ThemedText style={styles.title}>Météo Actuelle</ThemedText>
        </ParallaxScrollView>
    );
}

const styles = StyleSheet.create({
    reactLogo: {
        height: 200,
        width: 380,
        bottom: 0,
        left: 0,
    },
    mapContainer: {
        height: 400,
        borderRadius: 12,
        overflow: 'hidden',
        marginVertical: 20,
    },
    map: {
        flex: 1,
    },
    title: {
        fontSize: 20,
        marginTop: 10,
        marginBottom: 5,
    },
});