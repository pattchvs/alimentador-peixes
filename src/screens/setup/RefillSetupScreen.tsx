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

type RefillSetupScreenProps = {
    navigation: NativeStackNavigationProp<any>;
};

export function RefillSetupScreen({ navigation }: RefillSetupScreenProps) {
    const { setRefill1Food, setRefill2Food } = useAppContext();
    const [currentRefill, setCurrentRefill] = useState<1 | 2>(1);
    const [selectedFood1, setSelectedFood1] = useState<FishFood | null>(null);
    const [selectedFood2, setSelectedFood2] = useState<FishFood | null>(null);
    const [saving, setSaving] = useState(false);

    const selectedFood = currentRefill === 1 ? selectedFood1 : selectedFood2;
    const setSelectedFood = currentRefill === 1 ? setSelectedFood1 : setSelectedFood2;

    const handleFoodSelect = (food: FishFood) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedFood(food);
    };

    const handleNext = () => {
        if (!selectedFood) {
            Alert.alert('Atenção', 'Por favor, selecione uma ração para este refil.');
            return;
        }

        if (currentRefill === 1) {
            setCurrentRefill(2);
        } else {
            handleSave();
        }
    };

    const handleSave = async () => {
        if (!selectedFood1 || !selectedFood2) {
            Alert.alert('Atenção', 'Por favor, selecione rações para ambos os refis.');
            return;
        }

        setSaving(true);
        try {
            // Save to context
            await setRefill1Food(selectedFood1);
            await setRefill2Food(selectedFood2);

            // Try to update the device (may fail if not connected yet)
            try {
                await updateConfiguration({
                    refill1Nome: `${selectedFood1.brand} ${selectedFood1.name}`,
                    refill2Nome: `${selectedFood2.brand} ${selectedFood2.name}`,
                });
            } catch {
                // Silently fail - device might not be connected yet
            }

            navigation.navigate('ScheduleSetup');
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível salvar as configurações.');
        } finally {
            setSaving(false);
        }
    };

    const renderFoodItem = ({ item }: { item: FishFood }) => {
        const isSelected = selectedFood?.id === item.id;

        return (
            <TouchableOpacity
                onPress={() => handleFoodSelect(item)}
                activeOpacity={0.7}
            >
                <Card
                    style={{
                        ...styles.foodItem,
                        ...(isSelected ? styles.foodItemSelected : {}),
                    }}
                >
                    <View style={styles.foodImageContainer}>
                        {item.image ? (
                            <Image
                                source={{ uri: item.image }}
                                style={styles.foodImage}
                                resizeMode="cover"
                            />
                        ) : (
                            <View style={styles.foodImagePlaceholder}>
                                <Ionicons name="fish" size={32} color={colors.textMuted} />
                            </View>
                        )}
                    </View>
                    <View style={styles.foodInfo}>
                        <Text style={styles.foodBrand}>{item.brand}</Text>
                        <Text style={styles.foodName} numberOfLines={1}>
                            {item.name}
                        </Text>
                        <View style={styles.foodMeta}>
                            <View style={styles.foodType}>
                                <Text style={styles.foodTypeText}>{item.type}</Text>
                            </View>
                        </View>
                    </View>
                    {isSelected && (
                        <View style={styles.checkContainer}>
                            <Ionicons name="checkmark-circle" size={28} color={colors.primary} />
                        </View>
                    )}
                </Card>
            </TouchableOpacity>
        );
    };

    const categories = [
        { key: 'tropical', label: 'Tropicais' },
        { key: 'betta', label: 'Bettas' },
        { key: 'cichlid', label: 'Ciclídeos' },
        { key: 'goldfish', label: 'Kinguios' },
        { key: 'other', label: 'Outros' },
    ];

    return (
        <View style={styles.container}>
            <Header
                title={`Configurar Refil ${currentRefill}`}
                subtitle={currentRefill === 1 ? 'Refil Esquerdo' : 'Refil Direito'}
                showBack
                onBack={() => {
                    if (currentRefill === 2) {
                        setCurrentRefill(1);
                    } else {
                        navigation.goBack();
                    }
                }}
            />

            {/* Progress indicator */}
            <View style={styles.progressContainer}>
                <View style={[styles.progressDot, styles.progressDotActive]} />
                <View style={styles.progressLine} />
                <View
                    style={[
                        styles.progressDot,
                        currentRefill === 2 && styles.progressDotActive,
                    ]}
                />
            </View>

            {/* Selection summary */}
            {currentRefill === 2 && selectedFood1 && (
                <View style={styles.summaryContainer}>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Refil 1 (Esquerdo):</Text>
                        <Text style={styles.summaryValue}>
                            {selectedFood1.brand} {selectedFood1.name}
                        </Text>
                    </View>
                </View>
            )}

            <Text style={styles.instructionText}>
                Selecione a ração que será usada neste refil:
            </Text>

            <FlatList
                data={fishFoods}
                renderItem={renderFoodItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />

            <View style={styles.bottomSection}>
                <Button
                    title={currentRefill === 1 ? 'Próximo Refil' : 'Configurar Horários'}
                    onPress={handleNext}
                    loading={saving}
                    disabled={!selectedFood}
                    fullWidth
                    icon={
                        <Ionicons
                            name={currentRefill === 1 ? 'arrow-forward' : 'time'}
                            size={20}
                            color={colors.text}
                        />
                    }
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.xl,
        marginBottom: spacing.md,
    },
    progressDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: colors.surfaceLight,
    },
    progressDotActive: {
        backgroundColor: colors.primary,
    },
    progressLine: {
        flex: 1,
        height: 2,
        backgroundColor: colors.surfaceLight,
        marginHorizontal: spacing.sm,
        maxWidth: 100,
    },
    summaryContainer: {
        marginHorizontal: spacing.lg,
        marginBottom: spacing.md,
        padding: spacing.md,
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.primary,
    },
    summaryItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    summaryLabel: {
        fontSize: fontSize.sm,
        color: colors.textSecondary,
    },
    summaryValue: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.semibold,
        color: colors.primary,
        marginLeft: spacing.xs,
    },
    instructionText: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.md,
    },
    listContent: {
        padding: spacing.lg,
        paddingTop: 0,
        gap: spacing.sm,
    },
    foodItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    foodItemSelected: {
        borderColor: colors.primary,
        backgroundColor: colors.glass,
    },
    foodImageContainer: {
        width: 60,
        height: 60,
        borderRadius: borderRadius.md,
        overflow: 'hidden',
        marginRight: spacing.md,
    },
    foodImage: {
        width: '100%',
        height: '100%',
    },
    foodImagePlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: colors.surfaceLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    foodInfo: {
        flex: 1,
    },
    foodBrand: {
        fontSize: fontSize.xs,
        color: colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    foodName: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        color: colors.text,
        marginTop: 2,
    },
    foodMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.xs,
    },
    foodType: {
        backgroundColor: colors.surfaceLight,
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
    },
    foodTypeText: {
        fontSize: fontSize.xs,
        color: colors.textSecondary,
        textTransform: 'capitalize',
    },
    checkContainer: {
        marginLeft: spacing.sm,
    },
    bottomSection: {
        padding: spacing.lg,
        paddingBottom: spacing.xxl,
    },
});
