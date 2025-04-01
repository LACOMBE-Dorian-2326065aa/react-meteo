// components/HeaderWithRefresh.tsx
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface HeaderProps {
    title: string;
    onRefresh?: () => void;
    loading?: boolean;
    showBackButton?: boolean;
}

export default function Header({
      title,
      onRefresh,
      loading = false,
      showBackButton = false
  }: HeaderProps) {
    return (
        <View style={styles.header}>
            {showBackButton && (
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
            )}

            <Text style={styles.title}>{title}</Text>

            {onRefresh && (
                <TouchableOpacity
                    style={styles.refreshButton}
                    onPress={onRefresh}
                    disabled={loading}
                >
                    <Ionicons name="refresh" size={24} color="white" />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingVertical: 20,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        paddingTop: 40,
        paddingHorizontal: 20,
        position: 'relative',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    refreshButton: {
        position: 'absolute',
        right: 20,
        top: 40,
        padding: 8,
        borderRadius: 20,
    },
    backButton: {
        position: 'absolute',
        left: 20,
        top: 40,
        padding: 8,
        borderRadius: 20,
    }
});