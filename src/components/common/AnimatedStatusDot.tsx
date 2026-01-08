import React, { useEffect, useRef } from 'react';
import {
    Animated,
    View,
    StyleSheet,
} from 'react-native';
import { colors } from '../../styles/colors';

interface AnimatedStatusDotProps {
    isOnline: boolean;
    size?: number;
}

export function AnimatedStatusDot({ isOnline, size = 8 }: AnimatedStatusDotProps) {
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const opacityAnim = useRef(new Animated.Value(0.5)).current;

    useEffect(() => {
        if (isOnline) {
            const pulseAnimation = Animated.loop(
                Animated.sequence([
                    Animated.parallel([
                        Animated.timing(pulseAnim, {
                            toValue: 2,
                            duration: 1500,
                            useNativeDriver: true,
                        }),
                        Animated.timing(opacityAnim, {
                            toValue: 0,
                            duration: 1500,
                            useNativeDriver: true,
                        }),
                    ]),
                    Animated.parallel([
                        Animated.timing(pulseAnim, {
                            toValue: 1,
                            duration: 0,
                            useNativeDriver: true,
                        }),
                        Animated.timing(opacityAnim, {
                            toValue: 0.5,
                            duration: 0,
                            useNativeDriver: true,
                        }),
                    ]),
                ])
            );
            pulseAnimation.start();
            return () => pulseAnimation.stop();
        }
    }, [isOnline, pulseAnim, opacityAnim]);

    const dotColor = isOnline ? colors.success : colors.danger;

    return (
        <View style={[styles.container, { width: size * 3, height: size * 3 }]}>
            {/* Pulsing ring */}
            {isOnline && (
                <Animated.View
                    style={[
                        styles.pulseRing,
                        {
                            width: size * 2,
                            height: size * 2,
                            borderRadius: size,
                            borderColor: dotColor,
                            opacity: opacityAnim,
                            transform: [{ scale: pulseAnim }],
                        },
                    ]}
                />
            )}
            {/* Main dot */}
            <View
                style={[
                    styles.dot,
                    {
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                        backgroundColor: dotColor,
                    },
                ]}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    pulseRing: {
        position: 'absolute',
        borderWidth: 2,
    },
    dot: {
        shadowColor: colors.success,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
    },
});
