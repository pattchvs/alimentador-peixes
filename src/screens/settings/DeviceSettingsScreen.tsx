import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
    Linking,
    Platform,
} from 'react-native';
import { GradientView } from '../../components/common';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button, Card, Header, Input } from '../../components/common';
import { useAppContext } from '../../contexts/AppContext';
import { colors, gradients } from '../../styles/colors';
import { fontSize, fontWeight, spacing, borderRadius } from '../../styles/theme';
import { getNetworkInfo, updateConfiguration, getSignalStrength } from '../../services/api';
import { NetworkInfo } from '../../types';

type DeviceSettingsScreenProps = {
    navigation: NativeStackNavigationProp<any>;
};

export function DeviceSettingsScreen({ navigation }: DeviceSettingsScreenProps) {
    const { deviceStatus, resetApp } = useAppContext();
    const [deviceName, setDeviceName] = useState(deviceStatus?.deviceName || 'Meu Aquário');
    const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadNetworkInfo();
    }, []);

    const loadNetworkInfo = async () => {
        try {
            const info = await getNetworkInfo(false);
            setNetworkInfo(info);
        } catch (error) {
            console.log('Could not fetch network info:', error);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateConfiguration({ deviceName });
            Alert.alert('Sucesso', 'Nome do dispositivo atualizado!');
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível salvar as configurações.');
        } finally {
            setSaving(false);
        }
    };

    const handleReconfigureWiFi = () => {
        Alert.alert(
            'Reconfigurar WiFi',
            'Para alterar a rede WiFi, você precisará resetar o dispositivo e configurar novamente. Deseja continuar?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Continuar',
                    onPress: async () => {
                        await resetApp();
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'Setup' }],
                        });
                    },
                },
            ]
        );
    };

    const signal = networkInfo?.rssi ? getSignalStrength(networkInfo.rssi) : null;

    return (
        <View style={styles.container}>
            <Header
                title="Configurações do Dispositivo"
                showBack
                onBack={() => navigation.goBack()}
            />

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Device Name */}
                <Card style={styles.section}>
                    <Text style={styles.sectionTitle}>Nome do Dispositivo</Text>
                    <Input
                        value={deviceName}
                        onChangeText={setDeviceName}
                        placeholder="Ex: Aquário da Sala"
                    />
                    <Button
                        title="Salvar Nome"
                        onPress={handleSave}
                        loading={saving}
                        fullWidth
                    />
                </Card>

                {/* Network Info */}
                <Card style={styles.section}>
                    <Text style={styles.sectionTitle}>Conexão de Rede</Text>

                    <View style={styles.infoRow}>
                        <Ionicons name="wifi" size={20} color={colors.primary} />
                        <Text style={styles.infoLabel}>Rede WiFi:</Text>
                        <Text style={styles.infoValue}>
                            {networkInfo?.ssid || deviceStatus?.ip || 'Desconhecido'}
                        </Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Ionicons name="globe" size={20} color={colors.primary} />
                        <Text style={styles.infoLabel}>Endereço IP:</Text>
                        <Text style={styles.infoValue}>
                            {networkInfo?.ip || deviceStatus?.ip || 'Desconhecido'}
                        </Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Ionicons name="link" size={20} color={colors.primary} />
                        <Text style={styles.infoLabel}>Hostname:</Text>
                        <Text style={styles.infoValue}>
                            {networkInfo?.hostname || 'alimentador.local'}
                        </Text>
                    </View>

                    {signal && (
                        <View style={styles.infoRow}>
                            <Ionicons name="cellular" size={20} color={signal.color} />
                            <Text style={styles.infoLabel}>Sinal:</Text>
                            <Text style={[styles.infoValue, { color: signal.color }]}>
                                {signal.label} ({networkInfo?.rssi} dBm)
                            </Text>
                        </View>
                    )}

                    <View style={styles.infoRow}>
                        <Ionicons
                            name={networkInfo?.connected ? 'checkmark-circle' : 'close-circle'}
                            size={20}
                            color={networkInfo?.connected ? colors.success : colors.danger}
                        />
                        <Text style={styles.infoLabel}>Status:</Text>
                        <Text
                            style={[
                                styles.infoValue,
                                { color: networkInfo?.connected ? colors.success : colors.danger },
                            ]}
                        >
                            {networkInfo?.connected ? 'Conectado' : 'Desconectado'}
                        </Text>
                    </View>
                </Card>

                {/* WiFi Reconfigure */}
                <Card style={styles.section}>
                    <Text style={styles.sectionTitle}>Alterar Rede WiFi</Text>
                    <Text style={styles.sectionDescription}>
                        Para conectar o alimentador a uma rede WiFi diferente, você precisará
                        reconfigurar o dispositivo.
                    </Text>
                    <Button
                        title="Reconfigurar WiFi"
                        onPress={handleReconfigureWiFi}
                        variant="outline"
                        fullWidth
                        icon={<Ionicons name="wifi" size={18} color={colors.primary} />}
                    />
                </Card>

                {/* Device Info */}
                <Card style={styles.section}>
                    <Text style={styles.sectionTitle}>Informações do Dispositivo</Text>

                    <View style={styles.infoRow}>
                        <Ionicons name="hardware-chip" size={20} color={colors.textMuted} />
                        <Text style={styles.infoLabel}>ID:</Text>
                        <Text style={styles.infoValue}>
                            {deviceStatus?.deviceId || 'ESP32-AquaFeeder'}
                        </Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Ionicons name="time" size={20} color={colors.textMuted} />
                        <Text style={styles.infoLabel}>Hora:</Text>
                        <Text style={styles.infoValue}>
                            {deviceStatus?.horaAtual || '--:--:--'}
                        </Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Ionicons name="calendar" size={20} color={colors.textMuted} />
                        <Text style={styles.infoLabel}>Agendamentos:</Text>
                        <Text style={styles.infoValue}>
                            {deviceStatus?.totalAgendamentos || 0} / {deviceStatus?.maxAgendamentos || 10}
                        </Text>
                    </View>
                </Card>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: spacing.lg,
        gap: spacing.lg,
        paddingBottom: spacing.xxl,
    },
    section: {
        padding: spacing.lg,
    },
    sectionTitle: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.semibold,
        color: colors.text,
        marginBottom: spacing.md,
    },
    sectionDescription: {
        fontSize: fontSize.sm,
        color: colors.textMuted,
        marginBottom: spacing.md,
        lineHeight: 20,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.glassBorder,
    },
    infoLabel: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        marginLeft: spacing.sm,
        width: 100,
    },
    infoValue: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
        color: colors.text,
        flex: 1,
    },
});
