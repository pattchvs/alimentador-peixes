import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    Alert,
    Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { Button, AnimatedCard, Header } from '../../components/common';
import { useAppContext } from '../../contexts/AppContext';
import { colors } from '../../styles/colors';
import { fontSize, fontWeight, spacing, borderRadius, shadows } from '../../styles/theme';
import { updateConfiguration } from '../../services/api';
import { FishFood } from '../../types';
import fishFoodsData from '../../data/fishFoods.json';

const fishFoods = fishFoodsData as FishFood[];

type RefillManagementScreenProps = {
    navigation: NativeStackNavigationProp<any>;
};

export function RefillManagementScreen({ navigation }: RefillManagementScreenProps) {
    const { refill1Food, refill2Food, setRefill1Food, setRefill2Food } = useAppContext();
    const [editingRefill, setEditingRefill] = useState<1 | 2 | null>(null);
    const [saving, setSaving] = useState(false);

    const handleSelectFood = async (food: FishFood) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSaving(true);

        try {
            if (editingRefill === 1) {
                await setRefill1Food(food);
                await updateConfiguration({
                    refill1Nome: `${food.brand} ${food.name}`,
                });
            } else if (editingRefill === 2) {
                await setRefill2Food(food);
                await updateConfiguration({
                    refill2Nome: `${food.brand} ${food.name}`,
                });
            }

            setEditingRefill(null);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Sucesso', 'Ração atualizada com sucesso!');
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível atualizar a ração.');
        } finally {
            setSaving(false);
        }
    };

    const renderRefillCard = (refillNumber: 1 | 2, food: FishFood | null) => {
        const color = refillNumber === 1 ? colors.primary : colors.secondary;
        const label = refillNumber === 1 ? 'Esquerdo' : 'Direito';

        return (
            <AnimatedCard
                style={styles.refillCard}
                delay={refillNumber === 1 ? 50 : 150}
                onPress={() => setEditingRefill(refillNumber)}
            >
                <View style={styles.refillHeader}>
                    <View style={[styles.refillIndicator, { backgroundColor: color }]} />
                    <View style={styles.refillTitleContainer}>
                        <Text style={styles.refillLabel}>REFIL {refillNumber}</Text>
                        <Text style={styles.refillTitle}>{label}</Text>
                    </View>
                    <View style={[styles.refillIconCircle, { backgroundColor: color + '15' }]}>
                        <Ionicons
                            name={refillNumber === 1 ? 'arrow-back' : 'arrow-forward'}
                            size={20}
                            color={color}
                        />
                    </View>
                </View>

                {food ? (
                    <View style={styles.foodInfo}>
                        {food.image ? (
                            <Image source={{ uri: food.image }} style={styles.foodImage} />
                        ) : (
                            <View style={styles.foodImagePlaceholder}>
                                <Ionicons name="fish" size={28} color={colors.textMuted} />
                            </View>
                        )}
                        <View style={styles.foodDetails}>
                            <Text style={styles.foodBrand}>{food.brand}</Text>
                            <Text style={styles.foodName}>{food.name}</Text>
                            <View style={styles.foodTypeBadge}>
                                <Text style={styles.foodType}>{food.type}</Text>
                            </View>
                        </View>
                        <Ionicons name="create-outline" size={20} color={colors.textMuted} />
                    </View>
                ) : (
                    <View style={styles.emptyFood}>
                        <Ionicons name="add-circle-outline" size={32} color={colors.textMuted} />
                        <Text style={styles.emptyFoodText}>Toque para selecionar</Text>
                    </View>
                )}
            </AnimatedCard>
        );
    };

    const renderFoodItem = ({ item, index }: { item: FishFood; index: number }) => {
        const isSelected =
            (editingRefill === 1 && refill1Food?.id === item.id) ||
            (editingRefill === 2 && refill2Food?.id === item.id);
        const color = editingRefill === 1 ? colors.primary : colors.secondary;

        return (
            <AnimatedCard
                style={[
                    styles.foodItem,
                    isSelected && { borderColor: color, borderWidth: 2 },
                ]}
                delay={index * 30}
                onPress={() => handleSelectFood(item)}
            >
                <View style={styles.foodItemImage}>
                    {item.image ? (
                        <Image source={{ uri: item.image }} style={styles.foodThumb} />
                    ) : (
                        <View style={styles.foodThumbPlaceholder}>
                            <Ionicons name="fish" size={24} color={colors.textMuted} />
                        </View>
                    )}
                </View>
                <View style={styles.foodItemInfo}>
                    <Text style={styles.foodItemBrand}>{item.brand}</Text>
                    <Text style={styles.foodItemName}>{item.name}</Text>
                </View>
                {isSelected && (
                    <View style={[styles.checkCircle, { backgroundColor: color }]}>
                        <Ionicons name="checkmark" size={16} color={colors.text} />
                    </View>
                )}
            </AnimatedCard>
        );
    };

    if (editingRefill !== null) {
        const color = editingRefill === 1 ? colors.primary : colors.secondary;
        return (
            <View style={styles.container}>
                <View style={styles.selectionHeader}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => setEditingRefill(null)}
                    >
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <View>
                        <Text style={styles.selectionSubtitle}>REFIL {editingRefill}</Text>
                        <Text style={styles.selectionTitle}>
                            {editingRefill === 1 ? 'Esquerdo' : 'Direito'}
                        </Text>
                    </View>
                    <View style={[styles.headerIndicator, { backgroundColor: color }]} />
                </View>

                <Text style={styles.selectPrompt}>Selecione a ração:</Text>

                <FlatList
                    data={fishFoods}
                    renderItem={renderFoodItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerLabel}>GERENCIAR</Text>
                    <Text style={styles.headerTitle}>Refis</Text>
                </View>
            </View>

            <View style={styles.content}>
                {renderRefillCard(1, refill1Food)}
                {renderRefillCard(2, refill2Food)}
            </View>
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
        paddingBottom: spacing.lg,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
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
        gap: spacing.lg,
    },
    listContent: {
        padding: spacing.lg,
        paddingTop: 0,
        gap: spacing.sm,
    },
    refillCard: {
        padding: 0,
        overflow: 'hidden',
    },
    refillHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
        paddingBottom: spacing.md,
    },
    refillIndicator: {
        width: 4,
        height: 40,
        borderRadius: 2,
        marginRight: spacing.md,
    },
    refillTitleContainer: {
        flex: 1,
    },
    refillLabel: {
        fontSize: 10,
        color: colors.textMuted,
        letterSpacing: 1,
    },
    refillTitle: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
        color: colors.text,
    },
    refillIconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    foodInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
        paddingTop: 0,
    },
    foodImage: {
        width: 64,
        height: 64,
        borderRadius: borderRadius.md,
        marginRight: spacing.md,
    },
    foodImagePlaceholder: {
        width: 64,
        height: 64,
        borderRadius: borderRadius.md,
        backgroundColor: colors.surfaceLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    foodDetails: {
        flex: 1,
    },
    foodBrand: {
        fontSize: fontSize.xs,
        color: colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    foodName: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.semibold,
        color: colors.text,
        marginVertical: 2,
    },
    foodTypeBadge: {
        alignSelf: 'flex-start',
        backgroundColor: colors.surfaceLight,
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
        marginTop: spacing.xs,
    },
    foodType: {
        fontSize: fontSize.xs,
        color: colors.textSecondary,
        textTransform: 'capitalize',
    },
    emptyFood: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.xl,
        paddingTop: spacing.md,
    },
    emptyFoodText: {
        fontSize: fontSize.md,
        color: colors.textMuted,
        marginLeft: spacing.sm,
    },
    selectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xxl + spacing.lg,
        paddingBottom: spacing.lg,
    },
    selectionSubtitle: {
        fontSize: fontSize.xs,
        color: colors.textMuted,
        letterSpacing: 1,
    },
    selectionTitle: {
        fontSize: fontSize.xxl,
        fontWeight: fontWeight.bold,
        color: colors.text,
    },
    headerIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginLeft: 'auto',
    },
    selectPrompt: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.semibold,
        color: colors.text,
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.md,
    },
    foodItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    foodItemImage: {
        marginRight: spacing.md,
    },
    foodThumb: {
        width: 56,
        height: 56,
        borderRadius: borderRadius.md,
    },
    foodThumbPlaceholder: {
        width: 56,
        height: 56,
        borderRadius: borderRadius.md,
        backgroundColor: colors.surfaceLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    foodItemInfo: {
        flex: 1,
    },
    foodItemBrand: {
        fontSize: fontSize.xs,
        color: colors.textMuted,
        textTransform: 'uppercase',
    },
    foodItemName: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        color: colors.text,
    },
    checkCircle: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
