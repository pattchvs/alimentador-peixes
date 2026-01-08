import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AnimatedCard } from '../../components/common';
import { colors } from '../../styles/colors';
import { fontSize, fontWeight, spacing, borderRadius } from '../../styles/theme';
import { getHistory, formatTimestamp } from '../../services/api';
import { HistoryEntry } from '../../types';

type HistoryScreenProps = {
    navigation: NativeStackNavigationProp<any>;
};

export function HistoryScreen({ navigation }: HistoryScreenProps) {
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        try {
            const data = await getHistory();
            setHistory(data.historico || []);
        } catch (error) {
            console.log('Could not fetch history:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        loadHistory();
    };

    const getRefillLabel = (refill: string) => {
        switch (refill) {
            case 'refill1': return 'Esquerdo';
            case 'refill2': return 'Direito';
            case 'ambos': return 'Ambos';
            default: return refill;
        }
    };

    const getRefillColor = (refill: string) => {
        switch (refill) {
            case 'refill1': return colors.primary;
            case 'refill2': return colors.secondary;
            case 'ambos': return colors.accent;
            default: return colors.textMuted;
        }
    };

    const getRefillIcon = (refill: string) => {
        switch (refill) {
            case 'refill1': return 'arrow-back';
            case 'refill2': return 'arrow-forward';
            case 'ambos': return 'fish';
            default: return 'fish';
        }
    };

    const renderHistoryItem = ({ item, index }: { item: HistoryEntry; index: number }) => (
        <AnimatedCard style={styles.historyItem} delay={index * 30}>
            <View style={styles.historyMain}>
                <View style={[styles.refillCircle, { backgroundColor: getRefillColor(item.refill) + '15' }]}>
                    <Ionicons
                        name={getRefillIcon(item.refill) as any}
                        size={20}
                        color={getRefillColor(item.refill)}
                    />
                </View>
                <View style={styles.historyInfo}>
                    <Text style={styles.historyRefill}>{getRefillLabel(item.refill)}</Text>
                    <Text style={styles.historyTime}>{formatTimestamp(item.timestamp)}</Text>
                </View>
            </View>
            <View style={[styles.typeBadge, item.manual && styles.manualBadge]}>
                <Ionicons
                    name={item.manual ? 'hand-left-outline' : 'alarm-outline'}
                    size={12}
                    color={item.manual ? colors.accent : colors.primary}
                />
                <Text style={[styles.typeBadgeText, item.manual && styles.manualBadgeText]}>
                    {item.manual ? 'Manual' : 'Agendado'}
                </Text>
            </View>
        </AnimatedCard>
    );

    // Group history by date
    const todayCount = history.filter(h => {
        const date = new Date(h.timestamp);
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }).length;

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
                    <Text style={styles.headerLabel}>ALIMENTAÇÕES</Text>
                    <Text style={styles.headerTitle}>Histórico</Text>
                </View>
            </View>

            {/* Stats */}
            <View style={styles.statsRow}>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{history.length}</Text>
                    <Text style={styles.statLabel}>Total</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={[styles.statValue, { color: colors.success }]}>{todayCount}</Text>
                    <Text style={styles.statLabel}>Hoje</Text>
                </View>
            </View>

            {history.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <View style={styles.emptyIconCircle}>
                        <Ionicons name="time-outline" size={48} color={colors.textMuted} />
                    </View>
                    <Text style={styles.emptyText}>Nenhum histórico</Text>
                    <Text style={styles.emptySubtext}>
                        As alimentações aparecerão aqui
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={history}
                    renderItem={renderHistoryItem}
                    keyExtractor={(item, index) => `${item.timestamp}-${index}`}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor={colors.primary}
                        />
                    }
                />
            )}
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
    historyItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    historyMain: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    refillCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    historyInfo: {
        flex: 1,
    },
    historyRefill: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        color: colors.text,
    },
    historyTime: {
        fontSize: fontSize.sm,
        color: colors.textMuted,
        marginTop: 2,
    },
    typeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
        backgroundColor: colors.primary + '15',
        gap: 4,
    },
    manualBadge: {
        backgroundColor: colors.accent + '15',
    },
    typeBadgeText: {
        fontSize: fontSize.xs,
        fontWeight: fontWeight.medium,
        color: colors.primary,
    },
    manualBadgeText: {
        color: colors.accent,
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
});
