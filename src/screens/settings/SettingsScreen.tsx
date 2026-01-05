import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { GradientView } from '../../components/common';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { Card, Header } from '../../components/common';
import { useAppContext } from '../../contexts/AppContext';
import { colors, gradients } from '../../styles/colors';
import { fontSize, fontWeight, spacing, borderRadius } from '../../styles/theme';

type SettingsScreenProps = {
    navigation: NativeStackNavigationProp<any>;
};

export function SettingsScreen({ navigation }: SettingsScreenProps) {
    const { resetApp, refill1Food, refill2Food, deviceStatus } = useAppContext();

    const handleReset = () => {
        Alert.alert(
            'Resetar Configurações',
            'Isso irá apagar todas as configurações do app e você precisará configurar novamente. Deseja continuar?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Resetar',
                    style: 'destructive',
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

    const menuItems = [
        {
            title: 'Gerenciar Refis',
            subtitle: 'Alterar tipo de ração',
            icon: 'flask',
            color: colors.primary,
            onPress: () => navigation.navigate('RefillManagement'),
        },
        {
            title: 'Agendamentos',
            subtitle: `${deviceStatus?.totalAgendamentos || 0} agendamentos ativos`,
            icon: 'calendar',
            color: colors.secondary,
            onPress: () => navigation.navigate('ScheduleManagement'),
        },
        {
            title: 'Histórico',
            subtitle: 'Ver alimentações anteriores',
            icon: 'time',
            color: colors.accent,
            onPress: () => navigation.navigate('History'),
        },
        {
            title: 'Configurações do Dispositivo',
            subtitle: 'Nome, WiFi, conexão',
            icon: 'settings',
            color: colors.info,
            onPress: () => navigation.navigate('DeviceSettings'),
        },
    ];

    const MenuItem = ({
        title,
        subtitle,
        icon,
        color,
        onPress,
    }: {
        title: string;
        subtitle: string;
        icon: string;
        color: string;
        onPress: () => void;
    }) => (
        <TouchableOpacity
            onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onPress();
            }}
            activeOpacity={0.7}
        >
            <Card style={styles.menuItem}>
                <View style={[styles.menuIcon, { backgroundColor: color + '20' }]}>
                    <Ionicons name={icon as any} size={24} color={color} />
                </View>
                <View style={styles.menuContent}>
                    <Text style={styles.menuTitle}>{title}</Text>
                    <Text style={styles.menuSubtitle}>{subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </Card>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Configurações</Text>
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Device Info Card */}
                <Card variant="gradient" style={styles.deviceCard}>
                    <View style={styles.deviceHeader}>
                        <View style={styles.deviceIconContainer}>
                            <Ionicons name="fish" size={32} color={colors.primary} />
                        </View>
                        <View style={styles.deviceInfo}>
                            <Text style={styles.deviceName}>
                                {deviceStatus?.deviceName || 'AquaFeeder'}
                            </Text>
                            <Text style={styles.deviceIp}>
                                {deviceStatus?.ip || 'Não conectado'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.refillsInfo}>
                        <View style={styles.refillItem}>
                            <Text style={styles.refillLabel}>Refil Esquerdo</Text>
                            <Text style={styles.refillValue} numberOfLines={1}>
                                {refill1Food ? `${refill1Food.brand} ${refill1Food.name}` : 'Não configurado'}
                            </Text>
                        </View>
                        <View style={styles.refillDivider} />
                        <View style={styles.refillItem}>
                            <Text style={styles.refillLabel}>Refil Direito</Text>
                            <Text style={styles.refillValue} numberOfLines={1}>
                                {refill2Food ? `${refill2Food.brand} ${refill2Food.name}` : 'Não configurado'}
                            </Text>
                        </View>
                    </View>
                </Card>

                {/* Menu Items */}
                <View style={styles.menuSection}>
                    {menuItems.map((item, index) => (
                        <MenuItem key={index} {...item} />
                    ))}
                </View>

                {/* Danger Zone */}
                <View style={styles.dangerSection}>
                    <Text style={styles.dangerTitle}>Zona de Perigo</Text>
                    <TouchableOpacity
                        onPress={handleReset}
                        activeOpacity={0.7}
                    >
                        <Card style={styles.dangerCard}>
                            <Ionicons name="trash" size={20} color={colors.danger} />
                            <View style={styles.dangerContent}>
                                <Text style={styles.dangerText}>Resetar Configurações</Text>
                                <Text style={styles.dangerSubtext}>
                                    Apagar todas as configurações do app
                                </Text>
                            </View>
                        </Card>
                    </TouchableOpacity>
                </View>

                {/* App Info */}
                <View style={styles.appInfo}>
                    <Text style={styles.appVersion}>AquaFeeder v1.0.0</Text>
                    <Text style={styles.appCopyright}>
                        Alimentador de Peixes Inteligente
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xxl + spacing.lg,
        paddingBottom: spacing.md,
    },
    headerTitle: {
        fontSize: fontSize.xxl,
        fontWeight: fontWeight.bold,
        color: colors.text,
    },
    content: {
        padding: spacing.lg,
        paddingTop: 0,
        paddingBottom: spacing.xxl,
    },
    deviceCard: {
        marginBottom: spacing.lg,
    },
    deviceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    deviceIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    deviceInfo: {
        flex: 1,
    },
    deviceName: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        color: colors.text,
    },
    deviceIp: {
        fontSize: fontSize.sm,
        color: colors.textMuted,
        marginTop: 2,
    },
    refillsInfo: {
        flexDirection: 'row',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        padding: spacing.md,
    },
    refillItem: {
        flex: 1,
    },
    refillLabel: {
        fontSize: fontSize.xs,
        color: colors.textMuted,
        marginBottom: spacing.xs,
    },
    refillValue: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
        color: colors.text,
    },
    refillDivider: {
        width: 1,
        backgroundColor: colors.glassBorder,
        marginHorizontal: spacing.md,
    },
    menuSection: {
        marginBottom: spacing.lg,
        gap: spacing.sm,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    menuIcon: {
        width: 44,
        height: 44,
        borderRadius: borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    menuContent: {
        flex: 1,
    },
    menuTitle: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        color: colors.text,
    },
    menuSubtitle: {
        fontSize: fontSize.sm,
        color: colors.textMuted,
        marginTop: 2,
    },
    dangerSection: {
        marginBottom: spacing.xl,
    },
    dangerTitle: {
        fontSize: fontSize.sm,
        color: colors.danger,
        marginBottom: spacing.sm,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    dangerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.danger + '40',
    },
    dangerContent: {
        flex: 1,
        marginLeft: spacing.md,
    },
    dangerText: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        color: colors.danger,
    },
    dangerSubtext: {
        fontSize: fontSize.sm,
        color: colors.textMuted,
    },
    appInfo: {
        alignItems: 'center',
        paddingTop: spacing.lg,
    },
    appVersion: {
        fontSize: fontSize.sm,
        color: colors.textMuted,
    },
    appCopyright: {
        fontSize: fontSize.xs,
        color: colors.textMuted,
        marginTop: spacing.xs,
    },
});
