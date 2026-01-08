import React, { useEffect, useRef } from 'react';
import {
    Animated,
    TouchableWithoutFeedback,
    ViewStyle,
    StyleSheet,
    StyleProp,
} from 'react-native';
import { colors } from '../../styles/colors';
import { borderRadius, spacing, shadows } from '../../styles/theme';
import { fadeIn, scaleDown, scaleUp } from '../../utils/animations';

interface AnimatedCardProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    onPress?: () => void;
    delay?: number;
    variant?: 'default' | 'gradient' | 'glass';
}

export function AnimatedCard({
    children,
    style,
    onPress,
    delay = 0,
    variant = 'default',
}: AnimatedCardProps) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const timer = setTimeout(() => {
            fadeIn(fadeAnim).start();
        }, delay);
        return () => clearTimeout(timer);
    }, [delay, fadeAnim]);

    const handlePressIn = () => {
        scaleDown(scaleAnim, 0.97).start();
    };

    const handlePressOut = () => {
        scaleUp(scaleAnim).start();
    };

    const cardStyle = [
        styles.card,
        variant === 'gradient' && styles.cardGradient,
        variant === 'glass' && styles.cardGlass,
        style,
    ];

    const animatedStyle = {
        opacity: fadeAnim,
        transform: [
            { scale: scaleAnim },
            {
                translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                }),
            },
        ],
    };

    const content = (
        <Animated.View style={[cardStyle, animatedStyle]}>
            {children}
        </Animated.View>
    );

    if (onPress) {
        return (
            <TouchableWithoutFeedback
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
            >
                {content}
            </TouchableWithoutFeedback>
        );
    }

    return content;
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        ...shadows.md,
    },
    cardGradient: {
        backgroundColor: colors.surface,
        borderColor: colors.primary + '30',
    },
    cardGlass: {
        backgroundColor: colors.glass,
        borderColor: colors.glassBorder,
    },
});
