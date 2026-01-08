import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Modal,
    View,
    Text,
    StyleSheet,
    TouchableWithoutFeedback,
    KeyboardAvoidingView,
    Platform,
    Dimensions,
    ViewStyle,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { colors } from '../../styles/colors';
import { fontSize, fontWeight, spacing, borderRadius, shadows } from '../../styles/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface AnimatedModalProps {
    visible: boolean;
    onClose: () => void;
    title?: string;
    subtitle?: string;
    children: React.ReactNode;
    contentStyle?: ViewStyle;
}

export function AnimatedModal({
    visible,
    onClose,
    title,
    subtitle,
    children,
    contentStyle,
}: AnimatedModalProps) {
    const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(slideAnim, {
                    toValue: 0,
                    useNativeDriver: true,
                    damping: 20,
                    stiffness: 150,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: SCREEN_HEIGHT,
                    duration: 250,
                    useNativeDriver: true,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible, slideAnim, fadeAnim]);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={onClose}
            statusBarTranslucent
        >
            <View style={styles.container}>
                {/* Blur background overlay */}
                <TouchableWithoutFeedback onPress={onClose}>
                    <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
                        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                        <View style={styles.backdropOverlay} />
                    </Animated.View>
                </TouchableWithoutFeedback>

                {/* Modal content */}
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                    pointerEvents="box-none"
                >
                    <Animated.View
                        style={[
                            styles.content,
                            contentStyle,
                            {
                                transform: [{ translateY: slideAnim }],
                            },
                        ]}
                    >
                        {/* Handle bar */}
                        <View style={styles.handleContainer}>
                            <View style={styles.handle} />
                        </View>

                        {/* Gradient decoration line */}
                        <View style={styles.gradientLine} />

                        {/* Title section */}
                        {title && (
                            <View style={styles.titleContainer}>
                                <Text style={styles.title}>{title}</Text>
                                {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                            </View>
                        )}

                        {/* Content */}
                        {children}
                    </Animated.View>
                </KeyboardAvoidingView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    backdropOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    keyboardView: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    content: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
        paddingTop: spacing.sm,
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.xl,
        maxHeight: SCREEN_HEIGHT * 0.9,
        ...shadows.lg,
    },
    handleContainer: {
        alignItems: 'center',
        paddingVertical: spacing.sm,
    },
    handle: {
        width: 40,
        height: 4,
        backgroundColor: colors.textMuted,
        borderRadius: 2,
    },
    gradientLine: {
        height: 2,
        marginHorizontal: -spacing.xl,
        marginBottom: spacing.md,
        backgroundColor: colors.primary,
        opacity: 0.3,
    },
    titleContainer: {
        marginBottom: spacing.lg,
    },
    title: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
        color: colors.text,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
        textAlign: 'center',
        marginTop: spacing.xs,
    },
});
