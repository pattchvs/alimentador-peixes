import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../styles/colors';
import { borderRadius, spacing, shadows } from '../../styles/theme';

interface CardProps {
    children: ReactNode;
    variant?: 'default' | 'glass' | 'gradient';
    style?: ViewStyle;
    padding?: 'none' | 'small' | 'medium' | 'large';
}

export function Card({
    children,
    variant = 'default',
    style,
    padding = 'medium',
}: CardProps) {
    const paddingValues = {
        none: 0,
        small: spacing.sm,
        medium: spacing.md,
        large: spacing.lg,
    };

    const variantStyle = variant === 'glass' ? styles.glassCard :
        variant === 'gradient' ? styles.gradientCard :
            styles.defaultCard;

    return (
        <View
            style={[
                styles.card,
                variantStyle,
                { padding: paddingValues[padding] },
                shadows.sm,
                style,
            ]}
        >
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        overflow: 'hidden',
    },
    defaultCard: {
        backgroundColor: colors.surface,
    },
    glassCard: {
        backgroundColor: colors.glass,
    },
    gradientCard: {
        backgroundColor: colors.surface,
    },
});
