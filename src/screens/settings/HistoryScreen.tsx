import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    RefreshControl,
} from 'react-native';
import { GradientView } from '../../components/common';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Card, Header } from '../../components/common';
import { colors, gradients } from '../../styles/colors';
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

    const renderHistoryItem = ({ item }: { item: HistoryEntry }) => (
        <Card style={styles.historyItem}>
            <View style={styles.historyMain}>
                <View style={[styles.refillBadge, { backgroundColor: getRefillColor(item.refill) + '20' }]}>
                    <Ionicons
                        name={item.refill === 'ambos' ? 'fish' : 'arrow-forward'}
                        size={18}
                        color={getRefillColor(item.refill)}
                        style={item.refill === 'refill1' ? { transform: [{ scaleX: -1 }] } : {}}
                    />
                </View>
                <View style={styles.historyInfo}>
                    <Text style={styles.historyRefill}>{getRefillLabel(item.refill)}</Text>
                    <Text style={styles.historyTime}>{formatTimestamp(item.timestamp)}</Text>
                </View>
            </View>
            <View style={styles.historyMeta}>
                <View style={[styles.typeBadge, item.manual && styles.manualBadge]}>
                    <Text style={styles.typeBadgeText}>
                        {item.manual ? 'Manual' : 'Agendado'}
                    </Text>
                </View>
            </View>
        </Card>
    );

    return (
        <View style={styles.container}>
            <Header
                title="Histórico"
                subtitle={`${history.length} alimentações`}
                showBack
                onBack={() => navigation.goBack()}
            />

            {history.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="time-outline" size={64} color={colors.textMuted} />
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
    },
    listContent: {
        padding: spacing.lg,
        gap: spacing.sm,
    },
    historyItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    historyMain: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    refillBadge: {
        width: 40,
        height: 40,
        borderRadius: 20,
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
    historyMeta: {
        alignItems: 'flex-end',
    },
    typeBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.sm,
        backgroundColor: colors.primary + '20',
    },
    manualBadge: {
        backgroundColor: colors.accent + '20',
    },
    typeBadgeText: {
        fontSize: fontSize.xs,
        fontWeight: fontWeight.medium,
        color: colors.textSecondary,
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
});
