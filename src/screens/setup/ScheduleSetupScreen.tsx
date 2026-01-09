import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Switch,
} from 'react-native';
import { GradientView } from '../../components/common';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { Button, Card, Header } from '../../components/common';
import { useAppContext } from '../../contexts/AppContext';
import { colors, gradients } from '../../styles/colors';
import { fontSize, fontWeight, spacing, borderRadius } from '../../styles/theme';
import { createSchedule } from '../../services/api';
import { RefillType } from '../../types';

type ScheduleSetupScreenProps = {
    navigation: NativeStackNavigationProp<any>;
};

interface ScheduleConfig {
    enabled: boolean;
    hour: number;
    minute: number;
    refill: RefillType;
}

export function ScheduleSetupScreen({ navigation }: ScheduleSetupScreenProps) {
    const { completeSetup } = useAppContext();
    const [saving, setSaving] = useState(false);

    const [morningSchedule, setMorningSchedule] = useState<ScheduleConfig>({
        enabled: true,
        hour: 8,
        minute: 0,
        refill: 'ambos',
    });

    const [eveningSchedule, setEveningSchedule] = useState<ScheduleConfig>({
        enabled: true,
        hour: 18,
        minute: 0,
        refill: 'ambos',
    });

    const refillOptions: { value: RefillType; label: string }[] = [
        { value: 'ambos', label: 'Ambos' },
        { value: 'refill1', label: 'Esquerdo' },
        { value: 'refill2', label: 'Direito' },
    ];

    const adjustTime = (
        schedule: ScheduleConfig,
        setSchedule: (s: ScheduleConfig) => void,
        field: 'hour' | 'minute',
        delta: number
    ) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const newValue = schedule[field] + delta;

        if (field === 'hour') {
            setSchedule({
                ...schedule,
                hour: newValue < 0 ? 23 : newValue > 23 ? 0 : newValue,
            });
        } else {
            if (newValue < 0) {
                setSchedule({ ...schedule, minute: 55, hour: schedule.hour - 1 < 0 ? 23 : schedule.hour - 1 });
            } else if (newValue > 55) {
                setSchedule({ ...schedule, minute: 0, hour: (schedule.hour + 1) % 24 });
            } else {
                setSchedule({ ...schedule, minute: newValue });
            }
        }
    };

    const handleFinish = async () => {
        setSaving(true);
        try {
            // Create schedules on device (may fail if not connected)
            try {
                if (morningSchedule.enabled) {
                    await createSchedule({
                        hora: morningSchedule.hour,
                        minuto: morningSchedule.minute,
                        refill: morningSchedule.refill,
                        ativo: true,
                    });
                }

                if (eveningSchedule.enabled) {
                    await createSchedule({
                        hora: eveningSchedule.hour,
                        minuto: eveningSchedule.minute,
                        refill: eveningSchedule.refill,
                        ativo: true,
                    });
                }
            } catch {
                // Silently fail - device might not be connected yet
            }

            // Mark setup as complete
            await completeSetup();

            // Navigate to Home
            navigation.reset({
                index: 0,
                routes: [{ name: 'MainTabs' }],
            });
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível salvar os agendamentos.');
        } finally {
            setSaving(false);
        }
    };

    const handleSkip = async () => {
        await completeSetup();
        navigation.reset({
            index: 0,
            routes: [{ name: 'MainTabs' }],
        });
    };

    const renderScheduleCard = (
        title: string,
        icon: string,
        schedule: ScheduleConfig,
        setSchedule: (s: ScheduleConfig) => void
    ) => (
        <Card variant="glass" style={styles.scheduleCard}>
            <View style={styles.scheduleHeader}>
                <View style={styles.scheduleTitle}>
                    <Ionicons name={icon as any} size={24} color={colors.primary} />
                    <Text style={styles.scheduleTitleText}>{title}</Text>
                </View>
                <Switch
                    value={schedule.enabled}
                    onValueChange={(value) => setSchedule({ ...schedule, enabled: value })}
                    trackColor={{ false: colors.surfaceLight, true: colors.primary }}
                    thumbColor={colors.text}
                />
            </View>

            {schedule.enabled && (
                <>
                    {/* Time picker */}
                    <View style={styles.timePicker}>
                        <View style={styles.timeColumn}>
                            <TouchableOpacity
                                onPress={() => adjustTime(schedule, setSchedule, 'hour', 1)}
                                style={styles.timeArrow}
                            >
                                <Ionicons name="chevron-up" size={28} color={colors.textMuted} />
                            </TouchableOpacity>
                            <Text style={styles.timeValue}>
                                {schedule.hour.toString().padStart(2, '0')}
                            </Text>
                            <TouchableOpacity
                                onPress={() => adjustTime(schedule, setSchedule, 'hour', -1)}
                                style={styles.timeArrow}
                            >
                                <Ionicons name="chevron-down" size={28} color={colors.textMuted} />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.timeSeparator}>:</Text>

                        <View style={styles.timeColumn}>
                            <TouchableOpacity
                                onPress={() => adjustTime(schedule, setSchedule, 'minute', 5)}
                                style={styles.timeArrow}
                            >
                                <Ionicons name="chevron-up" size={28} color={colors.textMuted} />
                            </TouchableOpacity>
                            <Text style={styles.timeValue}>
                                {schedule.minute.toString().padStart(2, '0')}
                            </Text>
                            <TouchableOpacity
                                onPress={() => adjustTime(schedule, setSchedule, 'minute', -5)}
                                style={styles.timeArrow}
                            >
                                <Ionicons name="chevron-down" size={28} color={colors.textMuted} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Refill selector */}
                    <Text style={styles.refillLabel}>Qual refil usar:</Text>
                    <View style={styles.refillOptions}>
                        {refillOptions.map((option) => (
                            <TouchableOpacity
                                key={option.value}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    setSchedule({ ...schedule, refill: option.value });
                                }}
                                style={[
                                    styles.refillOption,
                                    schedule.refill === option.value && styles.refillOptionActive,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.refillOptionText,
                                        schedule.refill === option.value && styles.refillOptionTextActive,
                                    ]}
                                >
                                    {option.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </>
            )}
        </Card>
    );

    return (
        <View style={styles.container}>
            <Header
                title="Horários de Alimentação"
                subtitle="Configure os agendamentos"
                showBack
                onBack={() => navigation.goBack()}
            />

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.description}>
                    Configure os horários em que o alimentador irá funcionar automaticamente.
                    Você pode alterar isso depois nas configurações.
                </Text>

                {renderScheduleCard(
                    'Manhã',
                    'sunny',
                    morningSchedule,
                    setMorningSchedule
                )}

                {renderScheduleCard(
                    'Noite',
                    'moon',
                    eveningSchedule,
                    setEveningSchedule
                )}

                <View style={styles.infoCard}>
                    <Ionicons name="information-circle" size={20} color={colors.info} />
                    <Text style={styles.infoText}>
                        Você pode criar mais agendamentos nas configurações do app após a configuração inicial.
                    </Text>
                </View>
            </ScrollView>

            <View style={styles.bottomSection}>
                <Button
                    title="Pular por agora"
                    onPress={handleSkip}
                    variant="ghost"
                    style={styles.skipButton}
                />
                <Button
                    title="Finalizar Configuração"
                    onPress={handleFinish}
                    loading={saving}
                    fullWidth
                    icon={<Ionicons name="checkmark" size={20} color={colors.text} />}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: spacing.lg,
    },
    description: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
        marginBottom: spacing.lg,
        lineHeight: 24,
    },
    scheduleCard: {
        marginBottom: spacing.lg,
    },
    scheduleHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    scheduleTitle: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    scheduleTitleText: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.semibold,
        color: colors.text,
        marginLeft: spacing.sm,
    },
    timePicker: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    timeColumn: {
        alignItems: 'center',
    },
    timeArrow: {
        padding: spacing.xs,
    },
    timeValue: {
        fontSize: 48,
        fontWeight: fontWeight.bold,
        color: colors.text,
        width: 80,
        textAlign: 'center',
    },
    timeSeparator: {
        fontSize: 48,
        fontWeight: fontWeight.bold,
        color: colors.text,
        marginHorizontal: spacing.sm,
    },
    refillLabel: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        marginBottom: spacing.sm,
    },
    refillOptions: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    refillOption: {
        flex: 1,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: borderRadius.md,
        backgroundColor: colors.surface,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    refillOptionActive: {
        borderColor: colors.primary,
        backgroundColor: colors.glass,
    },
    refillOptionText: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
        color: colors.textMuted,
    },
    refillOptionTextActive: {
        color: colors.primary,
    },
    infoCard: {
        flexDirection: 'row',
        backgroundColor: colors.surface,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        borderLeftWidth: 3,
        borderLeftColor: colors.info,
        alignItems: 'flex-start',
    },
    infoText: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        marginLeft: spacing.sm,
        flex: 1,
        lineHeight: 20,
    },
    bottomSection: {
        padding: spacing.lg,
        paddingBottom: spacing.xxl,
    },
    skipButton: {
        marginBottom: spacing.sm,
    },
});
