import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Button } from '../../components/common';
import { colors } from '../../styles/colors';
import { fontSize, fontWeight, spacing, borderRadius } from '../../styles/theme';

const { height } = Dimensions.get('window');

type WelcomeScreenProps = {
    navigation: NativeStackNavigationProp<any>;
};

export function WelcomeScreen({ navigation }: WelcomeScreenProps) {
    return (
        <View style={styles.container}>
            {/* Decorative bubbles */}
            <View style={styles.bubblesContainer}>
                <View style={[styles.bubble, styles.bubble1]} />
                <View style={[styles.bubble, styles.bubble2]} />
                <View style={[styles.bubble, styles.bubble3]} />
                <View style={[styles.bubble, styles.bubble4]} />
            </View>

            <View style={styles.content}>
                {/* Logo/Icon */}
                <View style={styles.iconContainer}>
                    <View style={styles.iconGradient}>
                        <Ionicons name="fish" size={64} color={colors.text} />
                    </View>
                </View>

                {/* Title */}
                <Text style={styles.title}>AquaFeeder</Text>
                <Text style={styles.subtitle}>
                    Seu alimentador automático{'\n'}inteligente de peixes
                </Text>

                {/* Features */}
                <View style={styles.featuresContainer}>
                    <FeatureItem
                        icon="wifi"
                        title="Conectividade WiFi"
                        description="Controle de qualquer lugar"
                    />
                    <FeatureItem
                        icon="time"
                        title="Agendamentos"
                        description="Alimentação programada"
                    />
                    <FeatureItem
                        icon="analytics"
                        title="Estatísticas"
                        description="Acompanhe o histórico"
                    />
                </View>
            </View>

            {/* Bottom section */}
            <View style={styles.bottomSection}>
                <Button
                    title="Começar Configuração"
                    onPress={() => navigation.navigate('WiFiConnect')}
                    size="large"
                    fullWidth
                />
                <Text style={styles.footerText}>
                    Certifique-se de que o alimentador está ligado
                </Text>
            </View>
        </View>
    );
}

function FeatureItem({
    icon,
    title,
    description,
}: {
    icon: string;
    title: string;
    description: string;
}) {
    return (
        <View style={styles.featureItem}>
            <View style={styles.featureIcon}>
                <Ionicons name={icon as any} size={24} color={colors.primary} />
            </View>
            <View style={styles.featureText}>
                <Text style={styles.featureTitle}>{title}</Text>
                <Text style={styles.featureDescription}>{description}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    bubblesContainer: {
        ...StyleSheet.absoluteFillObject,
        overflow: 'hidden',
    },
    bubble: {
        position: 'absolute',
        borderRadius: 999,
        opacity: 0.1,
    },
    bubble1: {
        width: 200,
        height: 200,
        backgroundColor: colors.primary,
        top: -50,
        right: -50,
    },
    bubble2: {
        width: 150,
        height: 150,
        backgroundColor: colors.secondary,
        top: height * 0.3,
        left: -75,
    },
    bubble3: {
        width: 100,
        height: 100,
        backgroundColor: colors.primary,
        bottom: height * 0.25,
        right: -25,
    },
    bubble4: {
        width: 80,
        height: 80,
        backgroundColor: colors.secondary,
        bottom: 100,
        left: 30,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
    },
    iconContainer: {
        marginBottom: spacing.lg,
    },
    iconGradient: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    title: {
        fontSize: fontSize.xxxl,
        fontWeight: fontWeight.bold,
        color: colors.text,
        marginBottom: spacing.sm,
    },
    subtitle: {
        fontSize: fontSize.lg,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 26,
        marginBottom: spacing.xl,
    },
    featuresContainer: {
        width: '100%',
        marginTop: spacing.lg,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
        backgroundColor: colors.glass,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.glassBorder,
    },
    featureIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    featureText: {
        flex: 1,
    },
    featureTitle: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        color: colors.text,
    },
    featureDescription: {
        fontSize: fontSize.sm,
        color: colors.textMuted,
    },
    bottomSection: {
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.xxl,
        paddingTop: spacing.lg,
    },
    footerText: {
        fontSize: fontSize.sm,
        color: colors.textMuted,
        textAlign: 'center',
        marginTop: spacing.md,
    },
});
