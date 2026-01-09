import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../styles/colors';

interface GradientViewProps {
    children: ReactNode;
    style?: ViewStyle;
}

// Simplified gradient view - uses solid color for compatibility
// Can be replaced with LinearGradient when new architecture issues are resolved
export function GradientView({ children, style }: GradientViewProps) {
    return (
        <View style={[styles.container, style]}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
});
