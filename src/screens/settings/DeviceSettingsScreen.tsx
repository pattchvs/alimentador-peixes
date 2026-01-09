import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Alert,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { Button, AnimatedCard, Input, AnimatedStatusDot } from '../../components/common';
import { useAppContext } from '../../contexts/AppContext';
import { colors } from '../../styles/colors';
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
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSaving(true);
        try {
            await updateConfiguration({ deviceName });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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

    const InfoRow = ({ icon, label, value, valueColor }: {
        icon: string;
        label: string;
        value: string;
        valueColor?: string;
    }) => (
        <View style={styles.infoRow}>
            <View style={styles.infoIconCircle}>
                <Ionicons name={icon as any} size={18} color={colors.textMuted} />
            </View>
            <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={[styles.infoValue, valueColor && { color: valueColor }]}>{value}</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Custom Header */}
            <View style={styles.headerContainer}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerLabel}>CONFIGURAÇÕES</Text>
                    <Text style={styles.headerTitle}>Dispositivo</Text>
                </View>
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Device Status Card */}
                <AnimatedCard style={styles.statusCard} delay={50}>
                    <View style={styles.statusHeader}>
                        <View style={styles.deviceIconCircle}>
                            <Ionicons name="hardware-chip-outline" size={28} color={colors.primary} />
                        </View>
                        <View style={styles.statusInfo}>
                            <Text style={styles.deviceId}>
                                {deviceStatus?.deviceId || 'ESP32-AquaFeeder'}
                            </Text>
                            <View style={styles.connectionBadge}>
                                <AnimatedStatusDot isOnline={!!networkInfo?.connected} size={6} />
                                <Text style={styles.connectionText}>
                                    {networkInfo?.connected ? 'Conectado' : 'Desconectado'}
                                </Text>
                            </View>
                        </View>
                    </View>
                </AnimatedCard>

                {/* Device Name */}
                <AnimatedCard style={styles.section} delay={100}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="create-outline" size={20} color={colors.primary} />
                        <Text style={styles.sectionTitle}>Nome do Dispositivo</Text>
                    </View>
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
                </AnimatedCard>

                {/* Network Info */}
                <AnimatedCard style={styles.section} delay={150}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="wifi-outline" size={20} color={colors.primary} />
                        <Text style={styles.sectionTitle}>Conexão de Rede</Text>
                    </View>

                    <InfoRow
                        icon="wifi"
                        label="Rede WiFi"
                        value={networkInfo?.ssid || 'Desconhecido'}
                    />
                    <InfoRow
                        icon="globe-outline"
                        label="Endereço IP"
                        value={networkInfo?.ip || deviceStatus?.ip || 'Desconhecido'}
                    />
                    <InfoRow
                        icon="link-outline"
                        label="Hostname"
                        value={networkInfo?.hostname || 'alimentador.local'}
                    />
                    {signal && (
                        <InfoRow
                            icon="cellular-outline"
                            label="Intensidade"
                            value={`${signal.label} (${networkInfo?.rssi} dBm)`}
                            valueColor={signal.color}
                        />
                    )}
                </AnimatedCard>

                {/* Device Info */}
                <AnimatedCard style={styles.section} delay={200}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
                        <Text style={styles.sectionTitle}>Informações</Text>
                    </View>

                    <InfoRow
                        icon="time-outline"
                        label="Hora do Dispositivo"
                        value={deviceStatus?.horaAtual || '--:--:--'}
                    />
                    <InfoRow
                        icon="calendar-outline"
                        label="Agendamentos"
                        value={`${deviceStatus?.totalAgendamentos || 0} / ${deviceStatus?.maxAgendamentos || 10}`}
                    />
                </AnimatedCard>

                {/* WiFi Reconfigure */}
                <AnimatedCard style={styles.dangerSection} delay={250}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="refresh-outline" size={20} color={colors.warning} />
                        <Text style={[styles.sectionTitle, { color: colors.warning }]}>
                            Alterar Rede WiFi
                        </Text>
                    </View>
                    <Text style={styles.sectionDescription}>
                        Para conectar a uma rede diferente, você precisará reconfigurar o dispositivo.
                    </Text>
                    <Button
                        title="Reconfigurar WiFi"
                        onPress={handleReconfigureWiFi}
                        variant="outline"
                        fullWidth
                        icon={<Ionicons name="wifi" size={18} color={colors.primary} />}
                    />
                </AnimatedCard>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xxl + spacing.lg,
        paddingBottom: spacing.md,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitleContainer: {
        marginLeft: spacing.md,
    },
    headerLabel: {
        fontSize: fontSize.xs,
        color: colors.primary,
        letterSpacing: 2,
        fontWeight: fontWeight.semibold,
    },
    headerTitle: {
        fontSize: fontSize.xxl,
        fontWeight: fontWeight.bold,
        color: colors.text,
    },
    content: {
        padding: spacing.lg,
        gap: spacing.md,
        paddingBottom: spacing.xxl,
    },
    statusCard: {
        marginBottom: spacing.sm,
    },
    statusHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    deviceIconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    statusInfo: {
        flex: 1,
    },
    deviceId: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        color: colors.text,
    },
    connectionBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.xs,
    },
    connectionText: {
        fontSize: fontSize.sm,
        color: colors.textMuted,
        marginLeft: spacing.sm,
    },
    section: {
        padding: spacing.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.semibold,
        color: colors.text,
        marginLeft: spacing.sm,
    },
    sectionDescription: {
        fontSize: fontSize.sm,
        color: colors.textMuted,
        marginBottom: spacing.md,
        lineHeight: 20,
    },
    dangerSection: {
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.warning + '30',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.glassBorder,
    },
    infoIconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.surfaceLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: fontSize.xs,
        color: colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    infoValue: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.medium,
        color: colors.text,
        marginTop: 2,
    },
});
