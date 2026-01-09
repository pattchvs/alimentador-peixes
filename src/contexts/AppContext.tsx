import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FishFood, DeviceStatus, Schedule } from '../types';

// Storage keys
const STORAGE_KEYS = {
    IS_CONFIGURED: '@fishfeeder:isConfigured',
    DEVICE_IP: '@fishfeeder:deviceIp',
    REFILL1_FOOD: '@fishfeeder:refill1Food',
    REFILL2_FOOD: '@fishfeeder:refill2Food',
};

interface AppContextType {
    // Configuration state
    isConfigured: boolean;
    setIsConfigured: (value: boolean) => void;

    // Device state
    deviceIp: string | null;
    setDeviceIp: (ip: string | null) => void;
    deviceStatus: DeviceStatus | null;
    setDeviceStatus: (status: DeviceStatus | null) => void;

    // Refill foods
    refill1Food: FishFood | null;
    setRefill1Food: (food: FishFood | null) => void;
    refill2Food: FishFood | null;
    setRefill2Food: (food: FishFood | null) => void;

    // Loading state
    isLoading: boolean;

    // Actions
    resetApp: () => Promise<void>;
    completeSetup: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
    const [isConfigured, setIsConfiguredState] = useState(false);
    const [deviceIp, setDeviceIpState] = useState<string | null>(null);
    const [deviceStatus, setDeviceStatus] = useState<DeviceStatus | null>(null);
    const [refill1Food, setRefill1FoodState] = useState<FishFood | null>(null);
    const [refill2Food, setRefill2FoodState] = useState<FishFood | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load saved state on mount
    useEffect(() => {
        loadSavedState();
    }, []);

    const loadSavedState = async () => {
        try {
            const [configured, ip, food1, food2] = await Promise.all([
                AsyncStorage.getItem(STORAGE_KEYS.IS_CONFIGURED),
                AsyncStorage.getItem(STORAGE_KEYS.DEVICE_IP),
                AsyncStorage.getItem(STORAGE_KEYS.REFILL1_FOOD),
                AsyncStorage.getItem(STORAGE_KEYS.REFILL2_FOOD),
            ]);

            setIsConfiguredState(configured === 'true');
            setDeviceIpState(ip);
            setRefill1FoodState(food1 ? JSON.parse(food1) : null);
            setRefill2FoodState(food2 ? JSON.parse(food2) : null);
        } catch (error) {
            console.error('Error loading saved state:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const setIsConfigured = async (value: boolean) => {
        setIsConfiguredState(value);
        await AsyncStorage.setItem(STORAGE_KEYS.IS_CONFIGURED, value.toString());
    };

    const setDeviceIp = async (ip: string | null) => {
        setDeviceIpState(ip);
        if (ip) {
            await AsyncStorage.setItem(STORAGE_KEYS.DEVICE_IP, ip);
        } else {
            await AsyncStorage.removeItem(STORAGE_KEYS.DEVICE_IP);
        }
    };

    const setRefill1Food = async (food: FishFood | null) => {
        setRefill1FoodState(food);
        if (food) {
            await AsyncStorage.setItem(STORAGE_KEYS.REFILL1_FOOD, JSON.stringify(food));
        } else {
            await AsyncStorage.removeItem(STORAGE_KEYS.REFILL1_FOOD);
        }
    };

    const setRefill2Food = async (food: FishFood | null) => {
        setRefill2FoodState(food);
        if (food) {
            await AsyncStorage.setItem(STORAGE_KEYS.REFILL2_FOOD, JSON.stringify(food));
        } else {
            await AsyncStorage.removeItem(STORAGE_KEYS.REFILL2_FOOD);
        }
    };

    const resetApp = async () => {
        await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
        setIsConfiguredState(false);
        setDeviceIpState(null);
        setDeviceStatus(null);
        setRefill1FoodState(null);
        setRefill2FoodState(null);
    };

    const completeSetup = async () => {
        await setIsConfigured(true);
    };

    return (
        <AppContext.Provider
            value={{
                isConfigured,
                setIsConfigured,
                deviceIp,
                setDeviceIp,
                deviceStatus,
                setDeviceStatus,
                refill1Food,
                setRefill1Food,
                refill2Food,
                setRefill2Food,
                isLoading,
                resetApp,
                completeSetup,
            }}
        >
            {children}
        </AppContext.Provider>
    );
}

export function useAppContext() {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
}
