import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Switch,
    Alert,
    TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { Button, AnimatedCard, AnimatedModal } from '../../components/common';
import { colors } from '../../styles/colors';
import { fontSize, fontWeight, spacing, borderRadius } from '../../styles/theme';
import { getSchedules, addSchedule, updateSchedule, deleteSchedule, formatTime } from '../../services/api';
import { Schedule, RefillType } from '../../types';

type ScheduleManagementScreenProps = {
    navigation: NativeStackNavigationProp<any>;
};

export function ScheduleManagementScreen({ navigation }: ScheduleManagementScreenProps) {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

    // Form state
    const [hour, setHour] = useState('08');
    const [minute, setMinute] = useState('00');
    const [selectedRefill, setSelectedRefill] = useState<RefillType>('ambos');
    const [isActive, setIsActive] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadSchedules();
    }, []);

    const loadSchedules = async () => {
        setLoading(true);
        try {
            const data = await getSchedules();
            setSchedules(data.agendamentos || []);
        } catch (error) {
            console.log('Could not fetch schedules:', error);
        } finally {
            setLoading(false);
        }
    };

    const openAddModal = () => {
        setEditingSchedule(null);
        setHour('08');
        setMinute('00');
        setSelectedRefill('ambos');
        setIsActive(true);
        setModalVisible(true);
    };

    const openEditModal = (schedule: Schedule) => {
        setEditingSchedule(schedule);
        setHour(schedule.hora.toString().padStart(2, '0'));
        setMinute(schedule.minuto.toString().padStart(2, '0'));
        setSelectedRefill(schedule.refill);
        setIsActive(schedule.ativo);
        setModalVisible(true);
    };

    const handleSave = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSaving(true);

        const hourNum = parseInt(hour) || 0;
        const minuteNum = parseInt(minute) || 0;

        if (hourNum < 0 || hourNum > 23 || minuteNum < 0 || minuteNum > 59) {
            Alert.alert('Erro', 'Horário inválido');
            setSaving(false);
            return;
        }

        const scheduleData = {
            hora: hourNum,
            minuto: minuteNum,
            refill: selectedRefill,
            ativo: isActive,
        };

        try {
            if (editingSchedule) {
                await updateSchedule(editingSchedule.id, scheduleData);
            } else {
                await addSchedule(scheduleData);
            }

            setModalVisible(false);
            loadSchedules();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Sucesso', editingSchedule ? 'Agendamento atualizado!' : 'Agendamento criado!');
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível salvar o agendamento.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = (schedule: Schedule) => {
        Alert.alert(
            'Excluir Agendamento',
            `Deseja excluir o agendamento das ${formatTime(schedule.hora, schedule.minuto)}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteSchedule(schedule.id);
                            loadSchedules();
                        } catch (error) {
                            Alert.alert('Erro', 'Não foi possível excluir o agendamento.');
                        }
                    },
                },
            ]
        );
    };

    const handleToggle = async (schedule: Schedule) => {
        try {
            await updateSchedule(schedule.id, { ...schedule, ativo: !schedule.ativo });
            loadSchedules();
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível atualizar o agendamento.');
        }
    };

    const getRefillLabel = (refill: RefillType) => {
        switch (refill) {
            case 'refill1': return 'Esq';
            case 'refill2': return 'Dir';
            case 'ambos': return 'Ambos';
        }
    };

    const getRefillColor = (refill: RefillType) => {
        switch (refill) {
            case 'refill1': return colors.primary;
            case 'refill2': return colors.secondary;
            case 'ambos': return colors.accent;
        }
    };

    const renderSchedule = ({ item, index }: { item: Schedule; index: number }) => (
        <AnimatedCard
            style={styles.scheduleCard}
            delay={index * 50}
            onPress={() => openEditModal(item)}
        >
            <View style={styles.scheduleMain}>
                <View style={[styles.timeCircle, !item.ativo && styles.timeCircleInactive]}>
                    <Text style={[styles.scheduleTime, !item.ativo && styles.inactive]}>
                        {formatTime(item.hora, item.minuto)}
                    </Text>
                </View>
                <View style={styles.scheduleInfo}>
                    <View style={[styles.refillBadge, { backgroundColor: getRefillColor(item.refill) + '20' }]}>
                        <Text style={[styles.refillBadgeText, { color: getRefillColor(item.refill) }]}>
                            {getRefillLabel(item.refill)}
                        </Text>
                    </View>
                    <Text style={styles.scheduleStatus}>
                        {item.ativo ? 'Ativo' : 'Inativo'}
                    </Text>
                </View>
            </View>
            <View style={styles.scheduleActions}>
                <Switch
                    value={item.ativo}
                    onValueChange={() => handleToggle(item)}
                    trackColor={{ false: colors.surfaceLight, true: colors.primary + '50' }}
                    thumbColor={item.ativo ? colors.primary : colors.textMuted}
                />
                <TouchableOpacity
                    onPress={() => handleDelete(item)}
                    style={styles.deleteButton}
                >
                    <Ionicons name="trash-outline" size={18} color={colors.danger} />
                </TouchableOpacity>
            </View>
        </AnimatedCard>
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
                    <Text style={styles.headerLabel}>GERENCIAR</Text>
                    <Text style={styles.headerTitle}>Agendamentos</Text>
                </View>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={openAddModal}
                >
                    <Ionicons name="add" size={24} color={colors.text} />
                </TouchableOpacity>
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{schedules.length}</Text>
                    <Text style={styles.statLabel}>Total</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: colors.success }]}>
                        {schedules.filter(s => s.ativo).length}
                    </Text>
                    <Text style={styles.statLabel}>Ativos</Text>
                </View>
            </View>

            {schedules.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <View style={styles.emptyIconCircle}>
                        <Ionicons name="calendar-outline" size={48} color={colors.textMuted} />
                    </View>
                    <Text style={styles.emptyText}>Nenhum agendamento</Text>
                    <Text style={styles.emptySubtext}>
                        Toque no + para adicionar
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={schedules}
                    renderItem={renderSchedule}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* Add/Edit Modal */}
            <AnimatedModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                title={editingSchedule ? 'Editar' : 'Novo Agendamento'}
            >
                <Text style={styles.fieldLabel}>Horário</Text>
                <View style={styles.timeInputRow}>
                    <TextInput
                        style={styles.timeInput}
                        value={hour}
                        onChangeText={(t) => setHour(t.replace(/[^0-9]/g, '').slice(0, 2))}
                        keyboardType="number-pad"
                        maxLength={2}
                        placeholder="08"
                        placeholderTextColor={colors.textMuted}
                    />
                    <Text style={styles.timeSeparator}>:</Text>
                    <TextInput
                        style={styles.timeInput}
                        value={minute}
                        onChangeText={(t) => setMinute(t.replace(/[^0-9]/g, '').slice(0, 2))}
                        keyboardType="number-pad"
                        maxLength={2}
                        placeholder="00"
                        placeholderTextColor={colors.textMuted}
                    />
                </View>

                <Text style={styles.fieldLabel}>Refil</Text>
                <View style={styles.refillOptions}>
                    {(['ambos', 'refill1', 'refill2'] as RefillType[]).map((refill) => (
                        <TouchableOpacity
                            key={refill}
                            style={[
                                styles.refillOption,
                                selectedRefill === refill && {
                                    backgroundColor: getRefillColor(refill) + '20',
                                    borderColor: getRefillColor(refill),
                                },
                            ]}
                            onPress={() => setSelectedRefill(refill)}
                        >
                            <Text
                                style={[
                                    styles.refillOptionText,
                                    selectedRefill === refill && { color: getRefillColor(refill) },
                                ]}
                            >
                                {refill === 'ambos' ? 'Ambos' : refill === 'refill1' ? 'Esquerdo' : 'Direito'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.activeRow}>
                    <Text style={styles.fieldLabel}>Ativo</Text>
                    <Switch
                        value={isActive}
                        onValueChange={setIsActive}
                        trackColor={{ false: colors.surfaceLight, true: colors.primary + '50' }}
                        thumbColor={isActive ? colors.primary : colors.textMuted}
                    />
                </View>

                <View style={styles.modalButtons}>
                    <Button
                        title="Cancelar"
                        onPress={() => setModalVisible(false)}
                        variant="ghost"
                        style={styles.cancelButton}
                    />
                    <Button
                        title={editingSchedule ? 'Salvar' : 'Criar'}
                        onPress={handleSave}
                        loading={saving}
                        style={styles.saveButton}
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
        flex: 1,
        marginLeft: spacing.md,
    },
    headerLabel: {
        fontSize: fontSize.xs,
        color: colors.primary,
        letterSpacing: 2,
        fontWeight: fontWeight.semibold,
    },
    headerTitle: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
        color: colors.text,
    },
    addButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        marginHorizontal: spacing.lg,
        marginBottom: spacing.md,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
    },
    statItem: {
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
    },
    statValue: {
        fontSize: fontSize.xxl,
        fontWeight: fontWeight.bold,
        color: colors.primary,
    },
    statLabel: {
        fontSize: fontSize.xs,
        color: colors.textMuted,
    },
    statDivider: {
        width: 1,
        height: 32,
        backgroundColor: colors.glassBorder,
    },
    listContent: {
        padding: spacing.lg,
        gap: spacing.sm,
    },
    scheduleCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    scheduleMain: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    timeCircle: {
        width: 72,
        height: 48,
        borderRadius: borderRadius.md,
        backgroundColor: colors.primary + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    timeCircleInactive: {
        backgroundColor: colors.surfaceLight,
    },
    scheduleTime: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.bold,
        color: colors.text,
    },
    scheduleInfo: {
        flex: 1,
    },
    refillBadge: {
        alignSelf: 'flex-start',
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
        marginBottom: 4,
    },
    refillBadgeText: {
        fontSize: fontSize.xs,
        fontWeight: fontWeight.semibold,
    },
    scheduleStatus: {
        fontSize: fontSize.xs,
        color: colors.textMuted,
    },
    scheduleActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    deleteButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.danger + '15',
        justifyContent: 'center',
        alignItems: 'center',
    },
    inactive: {
        color: colors.textMuted,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    emptyIconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    emptyText: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.semibold,
        color: colors.text,
    },
    emptySubtext: {
        fontSize: fontSize.md,
        color: colors.textMuted,
        marginTop: spacing.sm,
    },
    fieldLabel: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
        color: colors.textSecondary,
        marginBottom: spacing.sm,
        marginTop: spacing.md,
    },
    timeInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    timeInput: {
        width: 80,
        height: 64,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        fontSize: fontSize.xxxl,
        fontWeight: fontWeight.bold,
        color: colors.text,
        textAlign: 'center',
        borderWidth: 1,
        borderColor: colors.glassBorder,
    },
    timeSeparator: {
        fontSize: fontSize.xxxl,
        fontWeight: fontWeight.bold,
        color: colors.text,
        marginHorizontal: spacing.md,
    },
    refillOptions: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    refillOption: {
        flex: 1,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        alignItems: 'center',
    },
    refillOptionText: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
        color: colors.textMuted,
    },
    activeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: spacing.lg,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.glassBorder,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: spacing.md,
        marginTop: spacing.xl,
    },
    cancelButton: {
        flex: 1,
    },
    saveButton: {
        flex: 1,
    },
});
