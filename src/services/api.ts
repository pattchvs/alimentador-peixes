import {
    WiFiNetwork,
    DeviceStatus,
    Schedule,
    HistoryEntry,
    Statistics,
    NetworkInfo,
    RefillType,
} from '../types';

// API Base URLs
const AP_MODE_URL = 'http://192.168.4.1';
const NORMAL_MODE_URL = 'http://alimentador.local';

// Timeout for API calls (ms)
const API_TIMEOUT = 10000;

// Helper function to make API calls with timeout
async function fetchWithTimeout(
    url: string,
    options: RequestInit = {},
    timeout: number = API_TIMEOUT
): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });
        return response;
    } finally {
        clearTimeout(timeoutId);
    }
}

// ============= AP MODE (Setup) =============

/**
 * Scan for available WiFi networks (AP Mode)
 */
export async function scanWiFiNetworks(): Promise<WiFiNetwork[]> {
    try {
        const response = await fetchWithTimeout(`${AP_MODE_URL}/scan-wifi`);
        const data = await response.json();
        const networks = data.redes || [];
        return networks.map((n: any) => ({
            ...n,
            secure: n.auth === 'secure',
        }));
    } catch (error) {
        console.error('Error scanning WiFi networks:', error);
        throw new Error('Não foi possível escanear as redes WiFi');
    }
}

// Alias for backwards compatibility
export async function scanWiFi(): Promise<{ networks: WiFiNetwork[] }> {
    const networks = await scanWiFiNetworks();
    return { networks };
}

/**
 * Configure WiFi credentials (AP Mode)
 */
export async function configureWiFi(
    ssid: string,
    password: string
): Promise<{ status: string; success?: boolean; ip?: string; message?: string }> {
    try {
        const response = await fetchWithTimeout(`${AP_MODE_URL}/config-wifi`, {
            method: 'POST',
            body: JSON.stringify({ ssid, password }),
        });
        const data = await response.json();
        return {
            ...data,
            success: data.status === 'success' || data.status === 'ok',
        };
    } catch (error) {
        console.error('Error configuring WiFi:', error);
        throw new Error('Não foi possível configurar o WiFi');
    }
}

/**
 * Get network information (works in both modes)
 */
export async function getNetworkInfo(apMode: boolean = false): Promise<NetworkInfo> {
    const baseUrl = apMode ? AP_MODE_URL : NORMAL_MODE_URL;
    try {
        const response = await fetchWithTimeout(`${baseUrl}/ip`);
        return await response.json();
    } catch (error) {
        console.error('Error getting network info:', error);
        throw new Error('Não foi possível obter informações de rede');
    }
}

// ============= NORMAL MODE (Daily Use) =============

/**
 * Get complete device status
 */
export async function getDeviceStatus(): Promise<DeviceStatus> {
    try {
        const response = await fetchWithTimeout(`${NORMAL_MODE_URL}/status`);
        return await response.json();
    } catch (error) {
        console.error('Error getting device status:', error);
        throw new Error('Não foi possível obter o status do dispositivo');
    }
}

/**
 * Trigger manual feeding
 */
export async function feed(refill: RefillType = 'refill1'): Promise<{ status: string; refill: string }> {
    try {
        const response = await fetchWithTimeout(`${NORMAL_MODE_URL}/alimentar`, {
            method: 'POST',
            body: JSON.stringify({ refill }),
        });
        return await response.json();
    } catch (error) {
        console.error('Error feeding:', error);
        throw new Error('Não foi possível alimentar');
    }
}

/**
 * Update device configuration
 */
export async function updateConfiguration(config: {
    deviceName?: string;
    refill1Nome?: string;
    refill1Quantidade?: number;
    refill2Nome?: string;
    refill2Quantidade?: number;
}): Promise<{ status: string }> {
    try {
        const response = await fetchWithTimeout(`${NORMAL_MODE_URL}/configuracoes`, {
            method: 'PUT',
            body: JSON.stringify(config),
        });
        return await response.json();
    } catch (error) {
        console.error('Error updating configuration:', error);
        throw new Error('Não foi possível atualizar as configurações');
    }
}

/**
 * Create a new feeding schedule
 */
export async function createSchedule(schedule: {
    hora?: number;
    minuto?: number;
    refill?: RefillType;
    ativo?: boolean;
    usarIntervalo?: boolean;
    intervaloHoras?: number;
}): Promise<{ status: string; id: number }> {
    try {
        const response = await fetchWithTimeout(`${NORMAL_MODE_URL}/agendamento`, {
            method: 'POST',
            body: JSON.stringify(schedule),
        });
        return await response.json();
    } catch (error) {
        console.error('Error creating schedule:', error);
        throw new Error('Não foi possível criar o agendamento');
    }
}

// Alias for addSchedule
export const addSchedule = createSchedule;

/**
 * Get all schedules
 */
export async function getSchedules(): Promise<{ agendamentos: Schedule[] }> {
    try {
        const status = await getDeviceStatus();
        return { agendamentos: status.agendamentos || [] };
    } catch (error) {
        console.error('Error getting schedules:', error);
        throw new Error('Não foi possível obter os agendamentos');
    }
}

/**
 * Get a specific schedule by ID
 */
export async function getSchedule(id: number): Promise<Schedule> {
    try {
        const response = await fetchWithTimeout(`${NORMAL_MODE_URL}/agendamento?id=${id}`);
        return await response.json();
    } catch (error) {
        console.error('Error getting schedule:', error);
        throw new Error('Não foi possível obter o agendamento');
    }
}

/**
 * Update an existing schedule
 */
export async function updateSchedule(
    id: number,
    updates: Partial<Schedule>
): Promise<{ status: string }> {
    try {
        const response = await fetchWithTimeout(`${NORMAL_MODE_URL}/agendamento?id=${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates),
        });
        return await response.json();
    } catch (error) {
        console.error('Error updating schedule:', error);
        throw new Error('Não foi possível atualizar o agendamento');
    }
}

/**
 * Delete a schedule
 */
export async function deleteSchedule(id: number): Promise<{ status: string; total: number }> {
    try {
        const response = await fetchWithTimeout(`${NORMAL_MODE_URL}/agendamento?id=${id}`, {
            method: 'DELETE',
        });
        return await response.json();
    } catch (error) {
        console.error('Error deleting schedule:', error);
        throw new Error('Não foi possível remover o agendamento');
    }
}

/**
 * Get feeding history
 */
export async function getHistory(): Promise<{ total: number; historico: HistoryEntry[] }> {
    try {
        const response = await fetchWithTimeout(`${NORMAL_MODE_URL}/historico`);
        return await response.json();
    } catch (error) {
        console.error('Error getting history:', error);
        throw new Error('Não foi possível obter o histórico');
    }
}

/**
 * Get feeding statistics
 */
export async function getStatistics(): Promise<Statistics> {
    try {
        const response = await fetchWithTimeout(`${NORMAL_MODE_URL}/estatisticas`);
        return await response.json();
    } catch (error) {
        console.error('Error getting statistics:', error);
        throw new Error('Não foi possível obter as estatísticas');
    }
}

// ============= Utility Functions =============

/**
 * Check if device is reachable
 */
export async function checkDeviceConnection(apMode: boolean = false): Promise<boolean> {
    try {
        await getNetworkInfo(apMode);
        return true;
    } catch {
        return false;
    }
}

/**
 * Get signal strength description
 */
export function getSignalStrength(rssi: number): {
    label: string;
    color: string;
    bars: number;
} {
    if (rssi >= -50) {
        return { label: 'Excelente', color: '#22C55E', bars: 4 };
    } else if (rssi >= -60) {
        return { label: 'Bom', color: '#10B981', bars: 3 };
    } else if (rssi >= -70) {
        return { label: 'Regular', color: '#F59E0B', bars: 2 };
    } else {
        return { label: 'Fraco', color: '#EF4444', bars: 1 };
    }
}

/**
 * Format timestamp to readable date/time
 */
export function formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Format time (hour:minute) for display
 */
export function formatTime(hora: number, minuto: number): string {
    return `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}`;
}
