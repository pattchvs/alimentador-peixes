import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Card, Header, Input, AnimatedModal } from '../../components/common';
import { useAppContext } from '../../contexts/AppContext';
import { colors } from '../../styles/colors';
import { fontSize, fontWeight, spacing, borderRadius, shadows } from '../../styles/theme';
import { scanWiFi, configureWiFi, getSignalStrength } from '../../services/api';
import { WiFiNetwork } from '../../types';

type NetworkSelectScreenProps = {
    navigation: NativeStackNavigationProp<any>;
};

export function NetworkSelectScreen({ navigation }: NetworkSelectScreenProps) {
    const { setDeviceIp } = useAppContext();
    const [networks, setNetworks] = useState<WiFiNetwork[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedNetwork, setSelectedNetwork] = useState<WiFiNetwork | null>(null);
    const [password, setPassword] = useState('');
    const [connecting, setConnecting] = useState(false);

    useEffect(() => {
        loadNetworks();
    }, []);

    const loadNetworks = async () => {
        setLoading(true);
        try {
            const result = await scanWiFi();
            const sortedNetworks = result.networks.sort((a, b) => b.rssi - a.rssi);
            setNetworks(sortedNetworks);
        } catch (error) {
            Alert.alert(
                'Erro',
                'Não foi possível buscar as redes WiFi. Verifique se está conectado ao alimentador.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async () => {
        if (!selectedNetwork) return;

        setConnecting(true);
        try {
            const result = await configureWiFi(selectedNetwork.ssid, password);

            // Check for success in multiple ways (ESP32 may return different formats)
            const isSuccess = result.success ||
                result.status === 'success' ||
                result.status === 'ok' ||
                (result.message && result.message.toLowerCase().includes('sucesso'));

            if (isSuccess) {
                if (result.ip) {
                    setDeviceIp(result.ip);
                }
                setSelectedNetwork(null);
                setPassword('');
                navigation.navigate('RefillSetup');
            } else {
                Alert.alert('Erro', result.message || 'Falha ao conectar');
            }
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível configurar a rede WiFi.');
        } finally {
            setConnecting(false);
        }
    };

    const renderNetwork = ({ item }: { item: WiFiNetwork }) => {
        const signal = getSignalStrength(item.rssi);

        return (
            <TouchableOpacity
                onPress={() => setSelectedNetwork(item)}
                activeOpacity={0.7}
            >
                <Card style={styles.networkItem}>
                    <View style={styles.networkInfo}>
                        <Ionicons
                            name={item.secure ? 'lock-closed' : 'lock-open'}
                            size={20}
                            color={item.secure ? colors.textMuted : colors.success}
                        />
                        <Text style={styles.networkName}>{item.ssid}</Text>
                    </View>
                    <View style={styles.signalContainer}>
                        <Ionicons name="wifi" size={20} color={signal.color} />
                        <Text style={[styles.signalText, { color: signal.color }]}>
                            {signal.label}
                        </Text>
                    </View>
                </Card>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <Header
                title="Selecionar Rede"
                subtitle={`${networks.length} redes encontradas`}
                showBack
                onBack={() => navigation.goBack()}
                rightAction={
                    <TouchableOpacity onPress={loadNetworks}>
                        <Ionicons name="refresh" size={24} color={colors.primary} />
                    </TouchableOpacity>
                }
            />

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={styles.loadingText}>Buscando redes WiFi...</Text>
                </View>
            ) : (
                <FlatList
                    data={networks}
                    renderItem={renderNetwork}
                    keyExtractor={(item, index) => `${item.ssid}-${index}`}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* Password Modal - Premium AnimatedModal */}
            <AnimatedModal
                visible={selectedNetwork !== null}
                onClose={() => {
                    setSelectedNetwork(null);
                    setPassword('');
                }}
                title="Conectar à Rede"
                subtitle={selectedNetwork?.ssid}
            >
                {selectedNetwork?.secure && (
                    <Input
                        label="Senha da Rede"
                        placeholder="Digite a senha"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        icon={<Ionicons name="key" size={20} color={colors.textMuted} />}
                    />
                )}

                <View style={styles.modalButtons}>
                    <Button
                        title="Cancelar"
                        onPress={() => {
                            setSelectedNetwork(null);
                            setPassword('');
                        }}
                        variant="ghost"
                        style={styles.cancelButton}
                    />
                    <Button
                        title="Conectar"
                        onPress={handleConnect}
                        loading={connecting}
                        disabled={selectedNetwork?.secure && !password}
                        style={styles.connectButton}
                    />
                </View>
            </AnimatedModal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: fontSize.md,
        color: colors.textMuted,
        marginTop: spacing.lg,
    },
    listContent: {
        padding: spacing.lg,
    },
    networkItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    networkInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    networkName: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        color: colors.text,
        marginLeft: spacing.sm,
    },
    signalContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    signalText: {
        fontSize: fontSize.sm,
        marginLeft: spacing.xs,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: colors.overlay,
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
        padding: spacing.xl,
        paddingTop: spacing.md,
        ...shadows.lg,
    },
    modalHeader: {
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    modalHandle: {
        width: 40,
        height: 4,
        backgroundColor: colors.textMuted,
        borderRadius: 2,
    },
    modalTitle: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    modalSubtitle: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
        marginBottom: spacing.lg,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: spacing.md,
        marginTop: spacing.md,
    },
    cancelButton: {
        flex: 1,
    },
    connectButton: {
        flex: 2,
    },
});
