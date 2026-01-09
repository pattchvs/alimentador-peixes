import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Linking,
    Alert,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Network from 'expo-network';
import { Button, Card, Header } from '../../components/common';
import { colors } from '../../styles/colors';
import { fontSize, fontWeight, spacing, borderRadius } from '../../styles/theme';

type WiFiConnectScreenProps = {
    navigation: NativeStackNavigationProp<any>;
};

const NETWORK_NAME = 'Alimentador-Setup';
const NETWORK_PASSWORD = '12345678';
const ESP32_IP = '192.168.4.1';

export function WiFiConnectScreen({ navigation }: WiFiConnectScreenProps) {
    const [checking, setChecking] = useState(false);

    const openWiFiSettings = () => {
        if (Platform.OS === 'ios') {
            Linking.openURL('App-Prefs:WIFI');
        } else {
            Linking.openURL('android.settings.WIFI_SETTINGS');
        }
    };

    const checkConnection = async () => {
        setChecking(true);

        try {
            // Passo 1: Verificar se está conectado via WiFi
            const networkState = await Network.getNetworkStateAsync();

            if (!networkState.isConnected) {
                Alert.alert(
                    'Sem conexão',
                    `Você não está conectado a nenhuma rede. Conecte-se à rede WiFi "${NETWORK_NAME}".`
                );
                setChecking(false);
                return;
            }

            if (networkState.type !== Network.NetworkStateType.WIFI) {
                Alert.alert(
                    'Dados Móveis Detectados',
                    'Você está usando dados móveis. Por favor:\n\n' +
                    '1. Desative os "Dados Móveis"\n' +
                    `2. Conecte-se à rede "${NETWORK_NAME}" via WiFi\n` +
                    '3. Tente novamente'
                );
                setChecking(false);
                return;
            }

            // Passo 2: Verificar se consegue acessar o ESP32
            const maxAttempts = Platform.OS === 'android' ? 3 : 2;
            const timeout = 5000;

            for (let attempt = 1; attempt <= maxAttempts; attempt++) {
                try {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), timeout);

                    const response = await fetch(`http://${ESP32_IP}/status`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Cache-Control': 'no-cache',
                        },
                        signal: controller.signal,
                    });

                    clearTimeout(timeoutId);

                    if (response.ok) {
                        const data = await response.json();

                        // Verificar se é realmente o ESP32 do alimentador
                        if (data.dispositivo || data.deviceId || data.apMode !== undefined) {
                            navigation.navigate('NetworkSelect');
                            return;
                        }
                    }
                } catch (error) {
                    console.log(`Tentativa ${attempt}/${maxAttempts} falhou:`, error);

                    if (attempt < maxAttempts) {
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                }
            }

            // Todas as tentativas falharam
            Alert.alert(
                'Não é a rede do Alimentador',
                `Você está conectado via WiFi, mas não à rede "${NETWORK_NAME}".\n\n` +
                `Verifique se está conectado à rede correta com senha: ${NETWORK_PASSWORD}`
            );

        } catch (error) {
            console.error('Erro ao verificar conexão:', error);
            Alert.alert(
                'Erro',
                'Ocorreu um erro ao verificar a conexão. Tente novamente.'
            );
        } finally {
            setChecking(false);
        }
    };

    return (
        <View style={styles.container}>
            <Header
                title="Conectar ao WiFi"
                showBack
                onBack={() => navigation.goBack()}
            />

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {/* Network Info Card */}
                <Card variant="gradient" style={styles.networkCard}>
                    <View style={styles.networkIconContainer}>
                        <Ionicons name="wifi" size={32} color={colors.primary} />
                    </View>
                    <View style={styles.networkInfo}>
                        <Text style={styles.networkName}>{NETWORK_NAME}</Text>
                        <Text style={styles.networkPassword}>Senha: {NETWORK_PASSWORD}</Text>
                    </View>
                </Card>

                {/* Instructions */}
                <Text style={styles.sectionTitle}>Instruções</Text>

                <View style={styles.stepsContainer}>
                    <StepItem
                        number={1}
                        title="Abra Configurações de WiFi"
                        description="Toque no botão abaixo para abrir as configurações"
                    />
                    <StepItem
                        number={2}
                        title="Conecte-se à rede"
                        description={`Selecione "${NETWORK_NAME}" e use a senha: ${NETWORK_PASSWORD}`}
                    />
                    <StepItem
                        number={3}
                        title="Volte para o app"
                        description="Após conectar, volte aqui e toque em 'Verificar Conexão'"
                    />
                </View>

                <View style={styles.buttonsContainer}>
                    <Button
                        title="Abrir Configurações WiFi"
                        onPress={openWiFiSettings}
                        variant="outline"
                        fullWidth
                        icon={<Ionicons name="settings-outline" size={20} color={colors.primary} />}
                    />
                    <View style={styles.buttonSpacer} />
                    <Button
                        title="Verificar Conexão"
                        onPress={checkConnection}
                        loading={checking}
                        fullWidth
                        icon={<Ionicons name="checkmark-circle-outline" size={20} color={colors.text} />}
                    />
                </View>
            </ScrollView>
        </View>
    );
}

function StepItem({
    number,
    title,
    description,
}: {
    number: number;
    title: string;
    description: string;
}) {
    return (
        <View style={styles.stepItem}>
            <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{number}</Text>
            </View>
            <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>{title}</Text>
                <Text style={styles.stepDescription}>{description}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: spacing.lg,
        paddingBottom: spacing.xxl,
    },
    networkCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    networkIconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: colors.surfaceLight,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.lg,
    },
    networkInfo: {
        flex: 1,
    },
    networkName: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    networkPassword: {
        fontSize: fontSize.md,
        color: colors.textSecondary,
    },
    sectionTitle: {
        fontSize: fontSize.lg,
        fontWeight: fontWeight.semibold,
        color: colors.text,
        marginBottom: spacing.md,
    },
    stepsContainer: {
        marginBottom: spacing.xl,
    },
    stepItem: {
        flexDirection: 'row',
        marginBottom: spacing.lg,
    },
    stepNumber: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    stepNumberText: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.bold,
        color: colors.text,
    },
    stepContent: {
        flex: 1,
    },
    stepTitle: {
        fontSize: fontSize.md,
        fontWeight: fontWeight.semibold,
        color: colors.text,
        marginBottom: spacing.xs,
    },
    stepDescription: {
        fontSize: fontSize.sm,
        color: colors.textMuted,
        lineHeight: 20,
    },
    buttonsContainer: {
        marginTop: spacing.md,
    },
    buttonSpacer: {
        height: spacing.md,
    },
});
