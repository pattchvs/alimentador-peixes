import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Modal,
    Switch,
    Alert,
    TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { Button, Card, Header } from '../../components/common';
import { colors } from '../../styles/colors';
import { fontSize, fontWeight, spacing, borderRadius, shadows } from '../../styles/theme';
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
            case 'refill1': return 'Esquerdo';
            case 'refill2': return 'Direito';
            case 'ambos': return 'Ambos';
        }
    };

    const renderSchedule = ({ item }: { item: Schedule }) => (
        <Card style={styles.scheduleCard}>
            <TouchableOpacity
                style={styles.scheduleContent}
                onPress={() => openEditModal(item)}
                activeOpacity={0.7}
            >
                <View style={styles.scheduleInfo}>
                    <Text style={[styles.scheduleTime, !item.ativo && styles.inactive]}>
                        {formatTime(item.hora, item.minuto)}
                    </Text>
                    <Text style={[styles.scheduleRefill, !item.ativo && styles.inactive]}>
                        {getRefillLabel(item.refill)}
                    </Text>
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
                        <Ionicons name="trash-outline" size={20} color={colors.danger} />
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Card>
    );

    return (
        <View style={styles.container}>
            <Header
                title="Agendamentos"
                subtitle={`${schedules.length} configurados`}
                showBack
                onBack={() => navigation.goBack()}
                rightAction={
                    <TouchableOpacity onPress={openAddModal}>
                        <Ionicons name="add-circle" size={28} color={colors.primary} />
                    </TouchableOpacity>
                }
            />

            {schedules.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="calendar-outline" size={64} color={colors.textMuted} />
                    <Text style={styles.emptyText}>Nenhum agendamento</Text>
                    <Text style={styles.emptySubtext}>
                        Toque no + para adicionar um agendamento
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
            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <View style={styles.modalHandle} />
                        </View>

                        <Text style={styles.modalTitle}>
                            {editingSchedule ? 'Editar Agendamento' : 'Novo Agendamento'}
                        </Text>

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
                                        selectedRefill === refill && styles.refillOptionActive,
                                    ]}
                                    onPress={() => setSelectedRefill(refill)}
                                >
                                    <Text
                                        style={[
                                            styles.refillOptionText,
                                            selectedRefill === refill && styles.refillOptionTextActive,
                                        ]}
                                    >
                                        {getRefillLabel(refill)}
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
                                title={editingSchedule ? 'Salvar' : 'Adicionar'}
                                onPress={handleSave}
                                loading={saving}
                                style={styles.saveButton}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    listContent: {
        padding: spacing.lg,
    },
    scheduleCard: {
        marginBottom: spacing.sm,
    },
    scheduleContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    scheduleInfo: {
        flex: 1,
    },
    scheduleTime: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
        color: colors.text,
    },
    scheduleRefill: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },
    inactive: {
        color: colors.textMuted,
    },
    scheduleActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    deleteButton: {
        padding: spacing.sm,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    emptyText: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.semibold,
        color: colors.text,
        marginTop: spacing.lg,
    },
    emptySubtext: {
        fontSize: fontSize.md,
        color: colors.textMuted,
        textAlign: 'center',
        marginTop: spacing.sm,
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
        marginBottom: spacing.lg,
        textAlign: 'center',
    },
    fieldLabel: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        color: colors.text,
        marginBottom: spacing.sm,
    },
    timeInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    timeInput: {
        width: 80,
        height: 60,
        backgroundColor: colors.surfaceLight,
        borderRadius: borderRadius.md,
        textAlign: 'center',
        fontSize: fontSize.xxl,
        fontWeight: fontWeight.bold,
        color: colors.text,
    },
    timeSeparator: {
        fontSize: fontSize.xxl,
        fontWeight: fontWeight.bold,
        color: colors.text,
        marginHorizontal: spacing.md,
    },
    refillOptions: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginBottom: spacing.lg,
    },
    refillOption: {
        flex: 1,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.md,
        backgroundColor: colors.surfaceLight,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    refillOptionActive: {
        borderColor: colors.primary,
        backgroundColor: colors.primary + '20',
    },
    refillOptionText: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.medium,
        color: colors.textSecondary,
    },
    refillOptionTextActive: {
        color: colors.primary,
    },
    activeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    cancelButton: {
        flex: 1,
    },
    saveButton: {
        flex: 2,
    },
});
