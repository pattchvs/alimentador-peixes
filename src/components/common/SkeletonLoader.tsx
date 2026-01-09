import React, { useEffect, useRef } from 'react';
import {
    Animated,
    View,
    StyleSheet,
    ViewStyle,
    Dimensions,
    DimensionValue,
} from 'react-native';
import { colors } from '../../styles/colors';
import { borderRadius } from '../../styles/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SkeletonLoaderProps {
    width?: DimensionValue;
    height?: number;
    borderRadius?: number;
    style?: ViewStyle;
}

export function SkeletonLoader({
    width = '100%',
    height = 20,
    borderRadius: radius = borderRadius.md,
    style,
}: SkeletonLoaderProps) {
    const shimmerAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.timing(shimmerAnim, {
                toValue: 1,
                duration: 1500,
                useNativeDriver: true,
            })
        );
        animation.start();
        return () => animation.stop();
    }, [shimmerAnim]);

    const translateX = shimmerAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [-SCREEN_WIDTH, SCREEN_WIDTH],
    });

    return (
        <View
            style={[
                styles.container,
                {
                    width,
                    height,
                    borderRadius: radius,
                },
                style,
            ]}
        >
            <Animated.View
                style={[
                    styles.shimmer,
                    {
                        transform: [{ translateX }],
                    },
                ]}
            />
        </View>
    );
}

// Skeleton card preset
export function SkeletonCard({ style }: { style?: ViewStyle }) {
    return (
        <View style={[styles.card, style]}>
            <SkeletonLoader width={60} height={60} borderRadius={30} />
            <View style={styles.cardContent}>
                <SkeletonLoader width="70%" height={18} style={{ marginBottom: 8 }} />
                <SkeletonLoader width="50%" height={14} />
            </View>
        </View>
    );
}

// Skeleton stat card preset
export function SkeletonStatCard({ style }: { style?: ViewStyle }) {
    return (
        <View style={[styles.statCard, style]}>
            <SkeletonLoader width={48} height={32} style={{ marginBottom: 8 }} />
            <SkeletonLoader width="80%" height={12} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.surfaceLight,
        overflow: 'hidden',
    },
    shimmer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: colors.surface,
        opacity: 0.5,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.glassBorder,
    },
    cardContent: {
        flex: 1,
        marginLeft: 16,
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: borderRadius.lg,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.glassBorder,
    },
});
