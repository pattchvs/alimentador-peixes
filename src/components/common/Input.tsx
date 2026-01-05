import React from 'react';
import {
    TextInput,
    View,
    Text,
    StyleSheet,
    TextInputProps,
    ViewStyle,
} from 'react-native';
import { colors } from '../../styles/colors';
import { borderRadius, fontSize, fontWeight, spacing } from '../../styles/theme';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    containerStyle?: ViewStyle;
    icon?: React.ReactNode;
}

export function Input({
    label,
    error,
    containerStyle,
    icon,
    style,
    ...props
}: InputProps) {
    return (
        <View style={[styles.container, containerStyle]}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View style={[styles.inputContainer, error && styles.inputError]}>
                {icon && <View style={styles.iconContainer}>{icon}</View>}
                <TextInput
                    style={[styles.input, icon ? styles.inputWithIcon : null, style]}
                    placeholderTextColor={colors.textMuted}
                    selectionColor={colors.primary}
                    {...props}
                />
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.md,
    },
    label: {
        fontSize: fontSize.sm,
        fontWeight: fontWeight.medium,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.glassBorder,
    },
    inputError: {
        borderColor: colors.danger,
    },
    iconContainer: {
        paddingLeft: spacing.md,
    },
    input: {
        flex: 1,
        color: colors.text,
        fontSize: fontSize.md,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.md,
    },
    inputWithIcon: {
        paddingLeft: spacing.sm,
    },
    errorText: {
        fontSize: fontSize.xs,
        color: colors.danger,
        marginTop: spacing.xs,
    },
});
