import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../contexts/AppContext';
import { colors } from '../styles/colors';

// Setup screens
import {
    WelcomeScreen,
    WiFiConnectScreen,
    NetworkSelectScreen,
    RefillSetupScreen,
    ScheduleSetupScreen,
} from '../screens/setup';

// Main screens
import { HomeScreen } from '../screens/HomeScreen';

// Settings screens
import {
    SettingsScreen,
    ScheduleManagementScreen,
    HistoryScreen,
    RefillManagementScreen,
    DeviceSettingsScreen,
} from '../screens/settings';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function SetupNavigator() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="WiFiConnect" component={WiFiConnectScreen} />
            <Stack.Screen name="NetworkSelect" component={NetworkSelectScreen} />
            <Stack.Screen name="RefillSetup" component={RefillSetupScreen} />
            <Stack.Screen name="ScheduleSetup" component={ScheduleSetupScreen} />
        </Stack.Navigator>
    );
}

function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: colors.surface,
                    borderTopColor: colors.glassBorder,
                    borderTopWidth: 1,
                    height: 85,
                    paddingBottom: 25,
                    paddingTop: 10,
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textMuted,
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                },
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: keyof typeof Ionicons.glyphMap = 'home';

                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Settings') {
                        iconName = focused ? 'settings' : 'settings-outline';
                    }

                    return <Ionicons name={iconName} size={24} color={color} />;
                },
            })}
        >
            <Tab.Screen
                name="Home"
                component={HomeScreen}
                options={{ tabBarLabel: 'Início' }}
            />
            <Tab.Screen
                name="Settings"
                component={SettingsNavigator}
                options={{ tabBarLabel: 'Configurações' }}
            />
        </Tab.Navigator>
    );
}

function SettingsNavigator() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen name="SettingsMain" component={SettingsScreen} />
            <Stack.Screen name="ScheduleManagement" component={ScheduleManagementScreen} />
            <Stack.Screen name="History" component={HistoryScreen} />
            <Stack.Screen name="RefillManagement" component={RefillManagementScreen} />
            <Stack.Screen name="DeviceSettings" component={DeviceSettingsScreen} />
        </Stack.Navigator>
    );
}

export function AppNavigator() {
    const { isConfigured, isLoading } = useAppContext();

    if (isLoading) {
        return null; // Could add a splash screen here
    }

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    animation: 'fade',
                }}
            >
                {!isConfigured ? (
                    <Stack.Screen name="Setup" component={SetupNavigator} />
                ) : (
                    <Stack.Screen name="MainTabs" component={MainTabs} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
