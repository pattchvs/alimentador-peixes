import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    TouchableOpacity,
    Alert,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { Card } from '../components/common';
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

    const loadStatus = async () => {
        try {
            const status = await getDeviceStatus();
            setDeviceStatus(status);
        } catch (error) {
            console.log('Could not fetch status:', error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadStatus();
        }, [])
    );

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadStatus();
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
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.greeting}>AquaFeeder</Text>
                        <Text style={styles.deviceName}>
                            {deviceStatus?.deviceName || 'Meu Aquário'}
                        </Text>
                    </View>
                    <View style={styles.statusIndicator}>
                        <View style={[styles.statusDot, deviceStatus && styles.statusDotOnline]} />
                        <Text style={styles.statusText}>
                            {deviceStatus ? 'Online' : 'Offline'}
                        </Text>
                    </View>
                </View>

                {/* Current Time Card */}
                <Card variant="gradient" style={styles.timeCard}>
                    <View style={styles.timeContent}>
                        <Ionicons name="time-outline" size={24} color={colors.textSecondary} />
                        <View style={styles.timeInfo}>
                            <Text style={styles.timeLabel}>Hora do dispositivo</Text>
                            <Text style={styles.timeValue}>
                                {deviceStatus?.horaAtual || '--:--:--'}
                            </Text>
                        </View>
                    </View>
                    {nextSchedule && (
                        <View style={styles.nextFeedingInfo}>
                            <Ionicons name="alarm" size={16} color={colors.accent} />
                            <Text style={styles.nextFeedingText}>
                                Próxima alimentação: {formatTime(nextSchedule.hora, nextSchedule.minuto)}
                            </Text>
                        </View>
                    )}
                </Card>

                {/* Quick Feed Section */}
                <Text style={styles.sectionTitle}>Alimentar Agora</Text>

                {/* Main Feed Button - Both Refills */}
                <TouchableOpacity
                    onPress={() => handleFeed('ambos')}
                    disabled={feeding !== null}
                    activeOpacity={0.8}
                >
                    <View style={[styles.mainFeedButton, shadows.lg]}>
                        {feeding === 'ambos' ? (
                            <View style={styles.feedingAnimation}>
                                <Ionicons name="sync" size={48} color={colors.text} />
                                <Text style={styles.feedingText}>Alimentando...</Text>
                            </View>
                        ) : (
                            <>
                                <Ionicons name="fish" size={48} color={colors.text} />
                                <Text style={styles.mainFeedText}>Alimentar</Text>
                                <Text style={styles.mainFeedSubtext}>Ambos os refis</Text>
                            </>
                        )}
                    </View>
                </TouchableOpacity>

                {/* Individual Refill Buttons */}
                <View style={styles.refillButtonsRow}>
                    <TouchableOpacity
                        onPress={() => handleFeed('refill1')}
                        disabled={feeding !== null}
                        activeOpacity={0.8}
                        style={styles.refillButtonWrapper}
                    >
                        <Card
                            style={{
                                ...styles.refillButton,
                                ...(feeding === 'refill1' ? styles.refillButtonActive : {}),
                            }}
                        >
                            <View style={styles.refillIconContainer}>
                                <Ionicons name="arrow-back" size={24} color={colors.primary} />
                            </View>
                            <Text style={styles.refillButtonTitle}>Esquerdo</Text>
                            <Text style={styles.refillButtonFood} numberOfLines={1}>
                                {refill1Food ? `${refill1Food.brand} ${refill1Food.name}` : 'Refil 1'}
                            </Text>
                        </Card>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => handleFeed('refill2')}
                        disabled={feeding !== null}
                        activeOpacity={0.8}
                        style={styles.refillButtonWrapper}
                    >
                        <Card
                            style={{
                                ...styles.refillButton,
                                ...(feeding === 'refill2' ? styles.refillButtonActive : {}),
                            }}
                        >
                            <View style={styles.refillIconContainer}>
                                <Ionicons name="arrow-forward" size={24} color={colors.secondary} />
                            </View>
                            <Text style={styles.refillButtonTitle}>Direito</Text>
                            <Text style={styles.refillButtonFood} numberOfLines={1}>
                                {refill2Food ? `${refill2Food.brand} ${refill2Food.name}` : 'Refil 2'}
                            </Text>
                        </Card>
                    </TouchableOpacity>
                </View>

                {/* Statistics */}
                <Text style={styles.sectionTitle}>Estatísticas</Text>
                <View style={styles.statsRow}>
                    <Card style={styles.statCard}>
                        <Text style={styles.statValue}>
                            {deviceStatus?.estatisticas?.alimentacoesHoje || 0}
                        </Text>
                        <Text style={styles.statLabel}>Hoje</Text>
                    </Card>
                    <Card style={styles.statCard}>
                        <Text style={styles.statValue}>
                            {deviceStatus?.estatisticas?.alimentacoesSemana || 0}
                        </Text>
                        <Text style={styles.statLabel}>Esta semana</Text>
                    </Card>
                    <Card style={styles.statCard}>
                        <Text style={styles.statValue}>
                            {deviceStatus?.estatisticas?.totalHistorico || 0}
                        </Text>
                        <Text style={styles.statLabel}>Total</Text>
                    </Card>
                </View>

                {/* Schedules Preview */}
                {deviceStatus?.agendamentos && deviceStatus.agendamentos.length > 0 && (
                    <>
                        <Text style={styles.sectionTitle}>Agendamentos Ativos</Text>
                        <Card style={styles.schedulesCard}>
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
                                            <Ionicons name="time" size={18} color={colors.primary} />
                                            <Text style={styles.scheduleTimeText}>
                                                {formatTime(schedule.hora, schedule.minuto)}
                                            </Text>
                                        </View>
                                        <Text style={styles.scheduleRefill}>
                                            {schedule.refill === 'ambos' ? 'Ambos' :
                                                schedule.refill === 'refill1' ? 'Esquerdo' : 'Direito'}
                                        </Text>
                                    </View>
                                ))}
                        </Card>
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
        color: colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 1,
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
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.danger,
        marginRight: spacing.sm,
    },
    statusDotOnline: {
        backgroundColor: colors.success,
    },
    statusText: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
    },
    timeCard: {
        marginBottom: spacing.lg,
    },
    timeContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timeInfo: {
        marginLeft: spacing.md,
    },
    timeLabel: {
        fontSize: fontSize.sm,
        color: colors.textMuted,
    },
    timeValue: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
        color: colors.text,
    },
    nextFeedingInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.md,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.glassBorder,
    },
    nextFeedingText: {
        fontSize: fontSize.sm,
        color: colors.accent,
        marginLeft: spacing.sm,
    },
    sectionTitle: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.semibold,
        color: colors.text,
        marginBottom: spacing.md,
        marginTop: spacing.sm,
    },
    mainFeedButton: {
        height: 160,
        borderRadius: borderRadius.xl,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    mainFeedText: {
        fontSize: fontSize.xxl,
        fontWeight: fontWeight.bold,
        color: colors.text,
        marginTop: spacing.sm,
    },
    mainFeedSubtext: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
    },
    feedingAnimation: {
        alignItems: 'center',
    },
    feedingText: {
        fontSize: fontSize.lg,
        color: colors.text,
        marginTop: spacing.sm,
    },
    refillButtonsRow: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.lg,
    },
    refillButtonWrapper: {
        flex: 1,
    },
    refillButton: {
        alignItems: 'center',
        paddingVertical: spacing.lg,
    },
    refillButtonActive: {
        borderColor: colors.primary,
        borderWidth: 2,
    },
    refillIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.surfaceLight,
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
    statsRow: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginBottom: spacing.lg,
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: spacing.md,
    },
    statValue: {
        fontSize: fontSize.xl,
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
        paddingVertical: spacing.sm,
    },
    scheduleItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: colors.glassBorder,
    },
    scheduleTime: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    scheduleTimeText: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        color: colors.text,
        marginLeft: spacing.sm,
    },
    scheduleRefill: {
        fontSize: fontSize.sm,
        color: colors.textMuted,
    },
});
