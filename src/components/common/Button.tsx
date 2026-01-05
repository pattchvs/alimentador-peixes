import React from 'react';
import {
    TouchableOpacity,
    Text,
    StyleSheet,
    ViewStyle,
    TextStyle,
    ActivityIndicator,
    View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors } from '../../styles/colors';
import { borderRadius, fontSize, fontWeight, spacing, shadows } from '../../styles/theme';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'small' | 'medium' | 'large';
    disabled?: boolean;
    loading?: boolean;
    icon?: React.ReactNode;
    style?: ViewStyle;
    textStyle?: TextStyle;
    fullWidth?: boolean;
}

export function Button({
    title,
    onPress,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    loading = false,
    icon,
    style,
    textStyle,
    fullWidth = false,
}: ButtonProps) {
    const handlePress = () => {
        if (!disabled && !loading) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onPress();
        }
    };

    const sizeStyles = {
        small: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
        medium: { paddingVertical: spacing.md, paddingHorizontal: spacing.lg },
        large: { paddingVertical: spacing.lg, paddingHorizontal: spacing.xl },
    };

    const textSizes = {
        small: fontSize.sm,
        medium: fontSize.md,
        large: fontSize.lg,
    };

    const getButtonStyle = () => {
        switch (variant) {
            case 'primary':
                return styles.primaryButton;
            case 'secondary':
                return styles.secondaryButton;
            case 'outline':
                return styles.outlineButton;
            case 'ghost':
                return styles.ghostButton;
            case 'danger':
                return styles.dangerButton;
            default:
                return styles.primaryButton;
        }
    };

    const getTextStyle = () => {
        switch (variant) {
            case 'outline':
                return styles.outlineText;
            case 'ghost':
                return styles.ghostText;
            default:
                return styles.text;
        }
    };

    return (
        <TouchableOpacity
            onPress={handlePress}
            disabled={disabled || loading}
            activeOpacity={0.7}
            style={[
                styles.button,
                sizeStyles[size],
                getButtonStyle(),
                disabled && styles.disabled,
                fullWidth && styles.fullWidth,
                style,
            ]}
        >
            {loading ? (
                <ActivityIndicator color={colors.text} size="small" />
            ) : (
                <View style={styles.content}>
                    {icon}
                    <Text
                        style={[
                            getTextStyle(),
                            { fontSize: textSizes[size] },
                            disabled && styles.disabledText,
                            icon ? { marginLeft: spacing.sm } : undefined,
                            textStyle,
                        ]}
                    >
                        {title}
                    </Text>
                </View>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: borderRadius.lg,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    primaryButton: {
        backgroundColor: colors.primary,
        ...shadows.md,
    },
    secondaryButton: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.glassBorder,
    },
    outlineButton: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: colors.primary,
    },
    ghostButton: {
        backgroundColor: 'transparent',
    },
    dangerButton: {
        backgroundColor: colors.danger,
    },
    text: {
        color: colors.text,
        fontWeight: fontWeight.semibold,
    },
    outlineText: {
        color: colors.primary,
        fontWeight: fontWeight.semibold,
    },
    ghostText: {
        color: colors.primary,
        fontWeight: fontWeight.semibold,
    },
    disabled: {
        opacity: 0.5,
    },
    disabledText: {
        color: colors.textMuted,
    },
    fullWidth: {
        width: '100%',
    },
});
