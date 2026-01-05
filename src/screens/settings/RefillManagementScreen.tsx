import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    Alert,
} from 'react-native';
import { GradientView } from '../../components/common';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { Button, Card, Header } from '../../components/common';
import { useAppContext } from '../../contexts/AppContext';
import { colors, gradients } from '../../styles/colors';
import { fontSize, fontWeight, spacing, borderRadius } from '../../styles/theme';
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
            Alert.alert('Sucesso', 'Ração atualizada com sucesso!');
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível atualizar a ração.');
        } finally {
            setSaving(false);
        }
    };

    const renderRefillCard = (refillNumber: 1 | 2, food: FishFood | null) => (
        <Card style={styles.refillCard}>
            <View style={styles.refillHeader}>
                <View style={styles.refillBadge}>
                    <Ionicons
                        name={refillNumber === 1 ? 'arrow-back' : 'arrow-forward'}
                        size={20}
                        color={refillNumber === 1 ? colors.primary : colors.secondary}
                    />
                </View>
                <Text style={styles.refillTitle}>
                    Refil {refillNumber} ({refillNumber === 1 ? 'Esquerdo' : 'Direito'})
                </Text>
            </View>

            {food ? (
                <View style={styles.foodInfo}>
                    {food.image && (
                        <Image source={{ uri: food.image }} style={styles.foodImage} />
                    )}
                    <View style={styles.foodDetails}>
                        <Text style={styles.foodBrand}>{food.brand}</Text>
                        <Text style={styles.foodName}>{food.name}</Text>
                        <Text style={styles.foodType}>{food.type}</Text>
                    </View>
                </View>
            ) : (
                <Text style={styles.noFoodText}>Nenhuma ração selecionada</Text>
            )}

            <Button
                title="Alterar Ração"
                onPress={() => setEditingRefill(refillNumber)}
                variant="outline"
                size="small"
                fullWidth
                style={styles.changeButton}
            />
        </Card>
    );

    const renderFoodItem = ({ item }: { item: FishFood }) => {
        const isSelected =
            (editingRefill === 1 && refill1Food?.id === item.id) ||
            (editingRefill === 2 && refill2Food?.id === item.id);

        return (
            <TouchableOpacity
                onPress={() => handleSelectFood(item)}
                disabled={saving}
                activeOpacity={0.7}
            >
                <Card
                    style={{
                        ...styles.foodItem,
                        ...(isSelected ? styles.foodItemSelected : {}),
                    }}
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
                        <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                    )}
                </Card>
            </TouchableOpacity>
        );
    };

    if (editingRefill !== null) {
        return (
            <View style={styles.container}>
                <Header
                    title={`Selecionar Ração`}
                    subtitle={`Refil ${editingRefill} (${editingRefill === 1 ? 'Esquerdo' : 'Direito'})`}
                    showBack
                    onBack={() => setEditingRefill(null)}
                />

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
            <Header
                title="Gerenciar Refis"
                showBack
                onBack={() => navigation.goBack()}
            />

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
    },
    content: {
        padding: spacing.lg,
        gap: spacing.lg,
    },
    listContent: {
        padding: spacing.lg,
        gap: spacing.sm,
    },
    refillCard: {
        padding: spacing.lg,
    },
    refillHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    refillBadge: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.surfaceLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    refillTitle: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.semibold,
        color: colors.text,
    },
    foodInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    foodImage: {
        width: 60,
        height: 60,
        borderRadius: borderRadius.md,
        marginRight: spacing.md,
    },
    foodDetails: {
        flex: 1,
    },
    foodBrand: {
        fontSize: fontSize.xs,
        color: colors.textMuted,
        textTransform: 'uppercase',
    },
    foodName: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        color: colors.text,
    },
    foodType: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
        textTransform: 'capitalize',
        marginTop: 2,
    },
    noFoodText: {
        fontSize: fontSize.md,
        color: colors.textMuted,
        marginBottom: spacing.md,
    },
    changeButton: {
        marginTop: spacing.sm,
    },
    foodItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    foodItemSelected: {
        borderWidth: 2,
        borderColor: colors.primary,
    },
    foodItemImage: {
        marginRight: spacing.md,
    },
    foodThumb: {
        width: 50,
        height: 50,
        borderRadius: borderRadius.sm,
    },
    foodThumbPlaceholder: {
        width: 50,
        height: 50,
        borderRadius: borderRadius.sm,
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
    },
    foodItemName: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        color: colors.text,
    },
});
