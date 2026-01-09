import React, { useEffect, useRef } from 'react';
import {
    Animated,
    TouchableOpacity,
    View,
    Text,
    StyleSheet,
    ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors } from '../../styles/colors';
import { fontSize, fontWeight, spacing, borderRadius, shadows } from '../../styles/theme';
import { createPulseAnimation, createGlowAnimation, scaleDown, scaleUp } from '../../utils/animations';

interface PulseButtonProps {
    onPress: () => void;
    loading?: boolean;
    disabled?: boolean;
    title: string;
    subtitle?: string;
    icon?: keyof typeof Ionicons.glyphMap;
    style?: ViewStyle;
}

export function PulseButton({
    onPress,
    loading = false,
    disabled = false,
    title,
    subtitle,
    icon = 'fish',
    style,
}: PulseButtonProps) {
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const glowAnim = useRef(new Animated.Value(0.3)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (!loading && !disabled) {
            const pulseAnimation = createPulseAnimation(pulseAnim);
            const glowAnimation = createGlowAnimation(glowAnim);
            pulseAnimation.start();
            glowAnimation.start();
            return () => {
                pulseAnimation.stop();
                glowAnimation.stop();
            };
        }
    }, [loading, disabled, pulseAnim, glowAnim]);

    useEffect(() => {
        if (loading) {
            const spinAnimation = Animated.loop(
                Animated.timing(rotateAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                })
            );
            spinAnimation.start();
            return () => spinAnimation.stop();
        } else {
            rotateAnim.setValue(0);
        }
    }, [loading, rotateAnim]);

    const handlePressIn = () => {
        if (!disabled && !loading) {
            scaleDown(scaleAnim, 0.95).start();
        }
    };

    const handlePressOut = () => {
        scaleUp(scaleAnim).start();
    };

    const handlePress = () => {
        if (!disabled && !loading) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            onPress();
        }
    };

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <TouchableOpacity
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            onPress={handlePress}
            activeOpacity={1}
            disabled={disabled || loading}
        >
            {/* Glow layer behind button */}
            <Animated.View
                style={[
                    styles.glowLayer,
                    {
                        opacity: glowAnim,
                        transform: [{ scale: pulseAnim }],
                    },
                ]}
            />

            <Animated.View
                style={[
                    styles.button,
                    disabled && styles.buttonDisabled,
                    style,
                    {
                        transform: [{ scale: scaleAnim }],
                    },
                ]}
            >
                {/* Inner glow gradient effect */}
                <View style={styles.innerGlow} />

                {loading ? (
                    <View style={styles.loadingContent}>
                        <Animated.View style={{ transform: [{ rotate: spin }] }}>
                            <Ionicons name="sync" size={48} color={colors.text} />
                        </Animated.View>
                        <Text style={styles.loadingText}>Alimentando...</Text>
                    </View>
                ) : (
                    <View style={styles.content}>
                        <View style={styles.iconContainer}>
                            <Ionicons name={icon} size={48} color={colors.text} />
                        </View>
                        <Text style={styles.title}>{title}</Text>
                        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                    </View>
                )}

                {/* Ripple circles decoration */}
                <View style={styles.rippleContainer}>
                    <View style={[styles.ripple, styles.ripple1]} />
                    <View style={[styles.ripple, styles.ripple2]} />
                    <View style={[styles.ripple, styles.ripple3]} />
                </View>
            </Animated.View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    glowLayer: {
        position: 'absolute',
        top: -10,
        left: -10,
        right: -10,
        bottom: -10,
        borderRadius: borderRadius.xl + 10,
        backgroundColor: colors.primary,
        opacity: 0.3,
    },
    button: {
        height: 180,
        borderRadius: borderRadius.xl,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        ...shadows.lg,
    },
    buttonDisabled: {
        backgroundColor: colors.surfaceLight,
        opacity: 0.6,
    },
    innerGlow: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '50%',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
    },
    content: {
        alignItems: 'center',
        zIndex: 2,
    },
    loadingContent: {
        alignItems: 'center',
        zIndex: 2,
    },
    iconContainer: {
        marginBottom: spacing.sm,
    },
    title: {
        fontSize: fontSize.xxl,
        fontWeight: fontWeight.bold,
        color: colors.text,
    },
    subtitle: {
        fontSize: fontSize.md,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: spacing.xs,
    },
    loadingText: {
        fontSize: fontSize.lg,
        color: colors.text,
        marginTop: spacing.md,
    },
    rippleContainer: {
        position: 'absolute',
        bottom: -40,
        left: '50%',
        marginLeft: -100,
        width: 200,
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
    },
    ripple: {
        position: 'absolute',
        borderRadius: 100,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    ripple1: {
        width: 80,
        height: 80,
    },
    ripple2: {
        width: 120,
        height: 120,
    },
    ripple3: {
        width: 160,
        height: 160,
    },
});
