import React, { useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { AnimatedCard, AnimatedStatusDot } from '../../components/common';
import { useAppContext } from '../../contexts/AppContext';
import { colors } from '../../styles/colors';
import { fontSize, fontWeight, spacing, borderRadius, shadows } from '../../styles/theme';

type SettingsScreenProps = {
    navigation: NativeStackNavigationProp<any>;
};

export function SettingsScreen({ navigation }: SettingsScreenProps) {
    const { resetApp, refill1Food, refill2Food, deviceStatus } = useAppContext();

    // Entrance animations
    const headerAnim = useRef(new Animated.Value(0)).current;
    const cardAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.stagger(100, [
            Animated.spring(headerAnim, {
                toValue: 1,
                useNativeDriver: true,
                damping: 15,
            }),
            Animated.spring(cardAnim, {
                toValue: 1,
                useNativeDriver: true,
                damping: 15,
            }),
        ]).start();
    }, []);

    const handleReset = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
            icon: 'flask-outline',
            color: colors.primary,
            screen: 'RefillManagement',
        },
        {
            title: 'Agendamentos',
            subtitle: `${deviceStatus?.totalAgendamentos || 0} configurados`,
            icon: 'calendar-outline',
            color: colors.secondary,
            screen: 'ScheduleManagement',
        },
        {
            title: 'Histórico',
            subtitle: 'Alimentações anteriores',
            icon: 'time-outline',
            color: colors.accent,
            screen: 'History',
        },
        {
            title: 'Dispositivo',
            subtitle: 'Nome, WiFi, conexão',
            icon: 'hardware-chip-outline',
            color: colors.info,
            screen: 'DeviceSettings',
        },
    ];

    const createAnimatedStyle = (anim: Animated.Value) => ({
        opacity: anim,
        transform: [
            {
                translateY: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                }),
            },
        ],
    });

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Premium Header */}
                <Animated.View style={[styles.header, createAnimatedStyle(headerAnim)]}>
                    <Text style={styles.headerLabel}>CONFIGURAÇÕES</Text>
                    <Text style={styles.headerTitle}>Meu AquaFeeder</Text>
                </Animated.View>

                {/* Device Status Card */}
                <AnimatedCard variant="gradient" style={styles.deviceCard} delay={50}>
                    <View style={styles.deviceHeader}>
                        <View style={styles.deviceIconContainer}>
                            <Ionicons name="fish" size={28} color={colors.primary} />
                        </View>
                        <View style={styles.deviceInfo}>
                            <View style={styles.deviceNameRow}>
                                <Text style={styles.deviceName}>
                                    {deviceStatus?.deviceName || 'AquaFeeder'}
                                </Text>
                                <View style={styles.statusBadge}>
                                    <AnimatedStatusDot isOnline={!!deviceStatus} size={6} />
                                    <Text style={styles.statusText}>
                                        {deviceStatus ? 'Online' : 'Offline'}
                                    </Text>
                                </View>
                            </View>
                            <Text style={styles.deviceIp}>
                                {deviceStatus?.ip || 'Aguardando conexão...'}
                            </Text>
                        </View>
                    </View>

                    {/* Refills Summary */}
                    <View style={styles.refillsContainer}>
                        <View style={styles.refillCard}>
                            <View style={[styles.refillIndicator, { backgroundColor: colors.primary }]} />
                            <View style={styles.refillContent}>
                                <Text style={styles.refillLabel}>ESQUERDO</Text>
                                <Text style={styles.refillValue} numberOfLines={1}>
                                    {refill1Food ? refill1Food.name : 'Não configurado'}
                                </Text>
                                {refill1Food && (
                                    <Text style={styles.refillBrand}>{refill1Food.brand}</Text>
                                )}
                            </View>
                        </View>
                        <View style={styles.refillCard}>
                            <View style={[styles.refillIndicator, { backgroundColor: colors.secondary }]} />
                            <View style={styles.refillContent}>
                                <Text style={styles.refillLabel}>DIREITO</Text>
                                <Text style={styles.refillValue} numberOfLines={1}>
                                    {refill2Food ? refill2Food.name : 'Não configurado'}
                                </Text>
                                {refill2Food && (
                                    <Text style={styles.refillBrand}>{refill2Food.brand}</Text>
                                )}
                            </View>
                        </View>
                    </View>
                </AnimatedCard>

                {/* Menu Section */}
                <View style={styles.menuSection}>
                    <Text style={styles.sectionTitle}>Configurações</Text>
                    <View style={styles.menuGrid}>
                        {menuItems.map((item, index) => (
                            <AnimatedCard
                                key={item.screen}
                                style={styles.menuCard}
                                delay={150 + index * 50}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    navigation.navigate(item.screen);
                                }}
                            >
                                <View style={[styles.menuIconCircle, { backgroundColor: item.color + '15' }]}>
                                    <Ionicons name={item.icon as any} size={24} color={item.color} />
                                </View>
                                <Text style={styles.menuTitle}>{item.title}</Text>
                                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                            </AnimatedCard>
                        ))}
                    </View>
                </View>

                {/* Danger Zone */}
                <View style={styles.dangerSection}>
                    <Text style={styles.dangerTitle}>Zona de Perigo</Text>
                    <AnimatedCard
                        style={styles.dangerCard}
                        onPress={handleReset}
                        delay={400}
                    >
                        <View style={styles.dangerIconCircle}>
                            <Ionicons name="trash-outline" size={20} color={colors.danger} />
                        </View>
                        <View style={styles.dangerContent}>
                            <Text style={styles.dangerText}>Resetar Configurações</Text>
                            <Text style={styles.dangerSubtext}>
                                Apagar todas as configurações
                            </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.danger + '60'} />
                    </AnimatedCard>
                </View>

                {/* App Info Footer */}
                <View style={styles.footer}>
                    <View style={styles.footerLogo}>
                        <Ionicons name="fish" size={20} color={colors.primary + '40'} />
                    </View>
                    <Text style={styles.appVersion}>AquaFeeder v1.0.0</Text>
                    <Text style={styles.appCopyright}>
                        Alimentador Inteligente de Peixes
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: spacing.lg,
        paddingTop: spacing.xxl + spacing.xl,
        paddingBottom: spacing.xxl,
    },
    header: {
        marginBottom: spacing.xl,
    },
    headerLabel: {
        fontSize: fontSize.xs,
        color: colors.primary,
        letterSpacing: 2,
        fontWeight: fontWeight.semibold,
        marginBottom: spacing.xs,
    },
    headerTitle: {
        fontSize: fontSize.xxxl,
        fontWeight: fontWeight.bold,
        color: colors.text,
    },
    deviceCard: {
        marginBottom: spacing.xl,
    },
    deviceHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    deviceIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    deviceInfo: {
        flex: 1,
    },
    deviceNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    deviceName: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
        color: colors.text,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
    },
    statusText: {
        fontSize: fontSize.xs,
        color: colors.textSecondary,
        marginLeft: spacing.xs,
    },
    deviceIp: {
        fontSize: fontSize.sm,
        color: colors.textMuted,
        marginTop: spacing.xs,
    },
    refillsContainer: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    refillCard: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        overflow: 'hidden',
    },
    refillIndicator: {
        width: 4,
    },
    refillContent: {
        flex: 1,
        padding: spacing.md,
    },
    refillLabel: {
        fontSize: 10,
        color: colors.textMuted,
        letterSpacing: 1,
        marginBottom: spacing.xs,
    },
    refillValue: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.semibold,
        color: colors.text,
    },
    refillBrand: {
        fontSize: fontSize.xs,
        color: colors.textMuted,
        marginTop: 2,
    },
    menuSection: {
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.semibold,
        color: colors.text,
        marginBottom: spacing.md,
    },
    menuGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
    },
    menuCard: {
        width: '47%',
        paddingVertical: spacing.lg,
        alignItems: 'center',
    },
    menuIconCircle: {
        width: 52,
        height: 52,
        borderRadius: 26,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    menuTitle: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        color: colors.text,
        textAlign: 'center',
    },
    menuSubtitle: {
        fontSize: fontSize.xs,
        color: colors.textMuted,
        marginTop: spacing.xs,
        textAlign: 'center',
    },
    dangerSection: {
        marginBottom: spacing.xl,
    },
    dangerTitle: {
        fontSize: fontSize.xs,
        color: colors.danger,
        letterSpacing: 1,
        fontWeight: fontWeight.semibold,
        marginBottom: spacing.sm,
        textTransform: 'uppercase',
    },
    dangerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.danger + '30',
        backgroundColor: colors.danger + '08',
    },
    dangerIconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.danger + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    dangerContent: {
        flex: 1,
    },
    dangerText: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        color: colors.danger,
    },
    dangerSubtext: {
        fontSize: fontSize.xs,
        color: colors.textMuted,
        marginTop: 2,
    },
    footer: {
        alignItems: 'center',
        paddingTop: spacing.lg,
    },
    footerLogo: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.surfaceLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    appVersion: {
        fontSize: fontSize.sm,
        color: colors.textMuted,
        fontWeight: fontWeight.medium,
    },
    appCopyright: {
        fontSize: fontSize.xs,
        color: colors.textMuted,
        marginTop: spacing.xs,
        opacity: 0.7,
    },
});
