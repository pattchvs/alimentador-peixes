import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    TouchableOpacity,
    Alert,
    Dimensions,
    Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import {
    Card,
    AnimatedCard,
    PulseButton,
    AnimatedStatusDot,
    SkeletonStatCard,
} from '../components/common';
import { useAppContext } from '../contexts/AppContext';
import { colors } from '../styles/colors';
import { fontSize, fontWeight, spacing, borderRadius, shadows } from '../styles/theme';
import { getDeviceStatus, feed, formatTime } from '../services/api';
import { RefillType } from '../types';

const { width } = Dimensions.get('window');

export function HomeScreen() {
    const { refill1Food, refill2Food, deviceStatus, setDeviceStatus } = useAppContext();
    const [refreshing, setRefreshing] = useState(false);
    const [feeding, setFeeding] = useState<RefillType | null>(null);
    const [loading, setLoading] = useState(true);

    // Live clock state - starts from device time and updates locally
    const [liveTime, setLiveTime] = useState<string>('--:--:--');
    const deviceTimeRef = useRef<Date | null>(null);

    // Animation values for staggered entrance
    const headerAnim = useRef(new Animated.Value(0)).current;
    const stat1Anim = useRef(new Animated.Value(0)).current;
    const stat2Anim = useRef(new Animated.Value(0)).current;
    const stat3Anim = useRef(new Animated.Value(0)).current;

    const loadStatus = async () => {
        try {
            const status = await getDeviceStatus();
            setDeviceStatus(status);
        } catch (error) {
            console.log('Could not fetch status:', error);
        } finally {
            setLoading(false);
        }
    };

    const startEntranceAnimations = () => {
        // Reset animations
        headerAnim.setValue(0);
        stat1Anim.setValue(0);
        stat2Anim.setValue(0);
        stat3Anim.setValue(0);

        // Staggered entrance
        Animated.stagger(100, [
            Animated.spring(headerAnim, {
                toValue: 1,
                useNativeDriver: true,
                damping: 15,
            }),
            Animated.spring(stat1Anim, {
                toValue: 1,
                useNativeDriver: true,
                damping: 15,
            }),
            Animated.spring(stat2Anim, {
                toValue: 1,
                useNativeDriver: true,
                damping: 15,
            }),
            Animated.spring(stat3Anim, {
                toValue: 1,
                useNativeDriver: true,
                damping: 15,
            }),
        ]).start();
    };

    useFocusEffect(
        useCallback(() => {
            loadStatus();
            startEntranceAnimations();
        }, [])
    );

    // Initialize live clock from device time
    useEffect(() => {
        if (deviceStatus?.horaAtual) {
            // Parse device time (format: HH:MM:SS)
            const parts = deviceStatus.horaAtual.split(':');
            if (parts.length >= 2) {
                const now = new Date();
                now.setHours(parseInt(parts[0]) || 0);
                now.setMinutes(parseInt(parts[1]) || 0);
                now.setSeconds(parseInt(parts[2]) || 0);
                deviceTimeRef.current = now;
            }
        }
    }, [deviceStatus?.horaAtual]);

    // Update live clock every second
    useEffect(() => {
        const interval = setInterval(() => {
            if (deviceTimeRef.current) {
                deviceTimeRef.current = new Date(deviceTimeRef.current.getTime() + 1000);
                const h = deviceTimeRef.current.getHours().toString().padStart(2, '0');
                const m = deviceTimeRef.current.getMinutes().toString().padStart(2, '0');
                const s = deviceTimeRef.current.getSeconds().toString().padStart(2, '0');
                setLiveTime(`${h}:${m}:${s}`);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadStatus();
        startEntranceAnimations();
        setRefreshing(false);
    };

    const handleFeed = async (refillType: RefillType) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        setFeeding(refillType);

        try {
            await feed(refillType);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setTimeout(loadStatus, 2000);

            const refillLabel =
                refillType === 'ambos' ? 'Ambos os refis' :
                    refillType === 'refill1' ? 'Refil esquerdo' : 'Refil direito';

            Alert.alert('Sucesso! 🐟', `${refillLabel} acionado com sucesso!`);
        } catch (error) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('Erro', 'Não foi possível acionar o alimentador. Verifique a conexão.');
        } finally {
            setFeeding(null);
        }
    };

    const nextSchedule = deviceStatus?.agendamentos?.find(a => a.ativo);

    const createAnimatedStyle = (anim: Animated.Value) => ({
        opacity: anim,
        transform: [
            {
                translateY: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [30, 0],
                }),
            },
            {
                scale: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1],
                }),
            },
        ],
    });

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor={colors.primary}
                    />
                }
            >
                {/* Header with Animated Status */}
                <Animated.View style={[styles.header, createAnimatedStyle(headerAnim)]}>
                    <View>
                        <Text style={styles.greeting}>AquaFeeder</Text>
                        <Text style={styles.deviceName}>
                            {deviceStatus?.deviceName || 'Meu Aquário'}
                        </Text>
                    </View>
                    <View style={styles.statusIndicator}>
                        <AnimatedStatusDot isOnline={!!deviceStatus} size={8} />
                        <Text style={styles.statusText}>
                            {deviceStatus ? 'Online' : 'Offline'}
                        </Text>
                    </View>
                </Animated.View>

                {/* Current Time Card */}
                <AnimatedCard variant="gradient" style={styles.timeCard} delay={50}>
                    <View style={styles.timeContent}>
                        <View style={styles.timeIconContainer}>
                            <Ionicons name="time-outline" size={28} color={colors.primary} />
                        </View>
                        <View style={styles.timeInfo}>
                            <Text style={styles.timeLabel}>Hora do dispositivo</Text>
                            <Text style={styles.timeValue}>
                                {liveTime}
                            </Text>
                        </View>
                    </View>
                    {nextSchedule && (
                        <View style={styles.nextFeedingInfo}>
                            <View style={styles.nextFeedingBadge}>
                                <Ionicons name="alarm" size={14} color={colors.text} />
                                <Text style={styles.nextFeedingBadgeText}>PRÓXIMO</Text>
                            </View>
                            <Text style={styles.nextFeedingText}>
                                {formatTime(nextSchedule.hora, nextSchedule.minuto)}
                            </Text>
                        </View>
                    )}
                </AnimatedCard>

                {/* Quick Feed Section */}
                <Text style={styles.sectionTitle}>Alimentar Agora</Text>

                {/* Main Feed Button - Premium PulseButton */}
                <View style={styles.pulseButtonContainer}>
                    <PulseButton
                        onPress={() => handleFeed('ambos')}
                        loading={feeding === 'ambos'}
                        disabled={feeding !== null && feeding !== 'ambos'}
                        title="Alimentar"
                        subtitle="Ambos os refis"
                        icon="fish"
                    />
                </View>

                {/* Individual Refill Buttons */}
                <View style={styles.refillButtonsRow}>
                    <AnimatedCard
                        style={styles.refillButton}
                        onPress={() => handleFeed('refill1')}
                        delay={150}
                    >
                        <View style={[styles.refillIconContainer, { backgroundColor: colors.primary + '20' }]}>
                            <Ionicons name="arrow-back" size={24} color={colors.primary} />
                        </View>
                        <Text style={styles.refillButtonTitle}>Esquerdo</Text>
                        <Text style={styles.refillButtonFood} numberOfLines={1}>
                            {refill1Food ? `${refill1Food.brand} ${refill1Food.name}` : 'Refil 1'}
                        </Text>
                        {feeding === 'refill1' && (
                            <View style={styles.feedingOverlay}>
                                <Ionicons name="sync" size={24} color={colors.primary} />
                            </View>
                        )}
                    </AnimatedCard>

                    <AnimatedCard
                        style={styles.refillButton}
                        onPress={() => handleFeed('refill2')}
                        delay={200}
                    >
                        <View style={[styles.refillIconContainer, { backgroundColor: colors.secondary + '20' }]}>
                            <Ionicons name="arrow-forward" size={24} color={colors.secondary} />
                        </View>
                        <Text style={styles.refillButtonTitle}>Direito</Text>
                        <Text style={styles.refillButtonFood} numberOfLines={1}>
                            {refill2Food ? `${refill2Food.brand} ${refill2Food.name}` : 'Refil 2'}
                        </Text>
                        {feeding === 'refill2' && (
                            <View style={styles.feedingOverlay}>
                                <Ionicons name="sync" size={24} color={colors.secondary} />
                            </View>
                        )}
                    </AnimatedCard>
                </View>

                {/* Statistics with Staggered Animation */}
                <Text style={styles.sectionTitle}>Estatísticas</Text>
                <View style={styles.statsRow}>
                    {loading ? (
                        <>
                            <SkeletonStatCard />
                            <View style={{ width: spacing.sm }} />
                            <SkeletonStatCard />
                            <View style={{ width: spacing.sm }} />
                            <SkeletonStatCard />
                        </>
                    ) : (
                        <>
                            <Animated.View style={[styles.statCardWrapper, createAnimatedStyle(stat1Anim)]}>
                                <Card style={styles.statCard}>
                                    <Text style={styles.statValue}>
                                        {deviceStatus?.estatisticas?.alimentacoesHoje || 0}
                                    </Text>
                                    <Text style={styles.statLabel}>Hoje</Text>
                                </Card>
                            </Animated.View>
                            <Animated.View style={[styles.statCardWrapper, createAnimatedStyle(stat2Anim)]}>
                                <Card style={styles.statCard}>
                                    <Text style={[styles.statValue, { color: colors.secondary }]}>
                                        {deviceStatus?.estatisticas?.alimentacoesSemana || 0}
                                    </Text>
                                    <Text style={styles.statLabel}>Esta semana</Text>
                                </Card>
                            </Animated.View>
                            <Animated.View style={[styles.statCardWrapper, createAnimatedStyle(stat3Anim)]}>
                                <Card style={styles.statCard}>
                                    <Text style={[styles.statValue, { color: colors.accent }]}>
                                        {deviceStatus?.estatisticas?.totalHistorico || 0}
                                    </Text>
                                    <Text style={styles.statLabel}>Total</Text>
                                </Card>
                            </Animated.View>
                        </>
                    )}
                </View>

                {/* Schedules Preview */}
                {deviceStatus?.agendamentos && deviceStatus.agendamentos.length > 0 && (
                    <>
                        <Text style={styles.sectionTitle}>Agendamentos Ativos</Text>
                        <AnimatedCard style={styles.schedulesCard} delay={300}>
                            {deviceStatus.agendamentos
                                .filter(s => s.ativo)
                                .slice(0, 3)
                                .map((schedule, index) => (
                                    <View
                                        key={schedule.id}
                                        style={[
                                            styles.scheduleItem,
                                            index < 2 && styles.scheduleItemBorder,
                                        ]}
                                    >
                                        <View style={styles.scheduleTime}>
                                            <View style={styles.scheduleTimeIcon}>
                                                <Ionicons name="time" size={16} color={colors.primary} />
                                            </View>
                                            <Text style={styles.scheduleTimeText}>
                                                {formatTime(schedule.hora, schedule.minuto)}
                                            </Text>
                                        </View>
                                        <View style={styles.scheduleRefillBadge}>
                                            <Text style={styles.scheduleRefillText}>
                                                {schedule.refill === 'ambos' ? 'Ambos' :
                                                    schedule.refill === 'refill1' ? 'Esquerdo' : 'Direito'}
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                        </AnimatedCard>
                    </>
                )}
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
        paddingTop: spacing.xxl + spacing.lg,
        paddingBottom: spacing.xxl,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.lg,
    },
    greeting: {
        fontSize: fontSize.sm,
        color: colors.primary,
        textTransform: 'uppercase',
        letterSpacing: 2,
        fontWeight: fontWeight.semibold,
    },
    deviceName: {
        fontSize: fontSize.xxl,
        fontWeight: fontWeight.bold,
        color: colors.text,
        marginTop: spacing.xs,
    },
    statusIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        borderColor: colors.glassBorder,
    },
    statusText: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        marginLeft: spacing.sm,
    },
    timeCard: {
        marginBottom: spacing.lg,
    },
    timeContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timeIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
    },
    timeInfo: {
        marginLeft: spacing.md,
        flex: 1,
    },
    timeLabel: {
        fontSize: fontSize.sm,
        color: colors.textMuted,
    },
    timeValue: {
        fontSize: fontSize.xxl,
        fontWeight: fontWeight.bold,
        color: colors.text,
        letterSpacing: 1,
    },
    nextFeedingInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: spacing.md,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.glassBorder,
    },
    nextFeedingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.accent,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.sm,
    },
    nextFeedingBadgeText: {
        fontSize: fontSize.xs,
        fontWeight: fontWeight.bold,
        color: colors.text,
        marginLeft: spacing.xs,
    },
    nextFeedingText: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
        color: colors.accent,
    },
    sectionTitle: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.semibold,
        color: colors.text,
        marginBottom: spacing.md,
        marginTop: spacing.sm,
    },
    pulseButtonContainer: {
        marginBottom: spacing.lg,
    },
    refillButtonsRow: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.lg,
    },
    refillButton: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: spacing.lg,
    },
    refillIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    refillButtonTitle: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        color: colors.text,
    },
    refillButtonFood: {
        fontSize: fontSize.xs,
        color: colors.textMuted,
        marginTop: spacing.xs,
        textAlign: 'center',
        paddingHorizontal: spacing.sm,
    },
    feedingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: colors.surface + 'EE',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: borderRadius.lg,
    },
    statsRow: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginBottom: spacing.lg,
    },
    statCardWrapper: {
        flex: 1,
    },
    statCard: {
        alignItems: 'center',
        paddingVertical: spacing.md,
    },
    statValue: {
        fontSize: fontSize.xxl,
        fontWeight: fontWeight.bold,
        color: colors.primary,
    },
    statLabel: {
        fontSize: fontSize.xs,
        color: colors.textMuted,
        marginTop: spacing.xs,
    },
    schedulesCard: {
        marginBottom: spacing.lg,
    },
    scheduleItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.md,
    },
    scheduleItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: colors.glassBorder,
    },
    scheduleTime: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    scheduleTimeIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.sm,
    },
    scheduleTimeText: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        color: colors.text,
    },
    scheduleRefillBadge: {
        backgroundColor: colors.surfaceLight,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
    },
    scheduleRefillText: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
    },
});
