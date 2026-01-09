// Types for the Fish Feeder App

export interface FishFood {
    id: string;
    brand: string;
    name: string;
    type: 'flakes' | 'pellets' | 'granules' | 'freeze-dried' | 'other';
    description: string;
    image: string | null;
    category: 'tropical' | 'betta' | 'cichlid' | 'goldfish' | 'large' | 'other';
}

export interface WiFiNetwork {
    ssid: string;
    rssi: number;
    auth: 'secure' | 'open';
    secure: boolean;
}

export interface Refill {
    nome: string;
    quantidade: number;
    food?: FishFood;
}

export interface Schedule {
    id: number;
    hora: number;
    minuto: number;
    refill: 'refill1' | 'refill2' | 'ambos';
    ativo: boolean;
    usarIntervalo: boolean;
    intervaloHoras: number;
}

export interface DeviceStatus {
    deviceId: string;
    deviceName: string;
    ip: string;
    horaAtual: string;
    refills: {
        refill1: Refill;
        refill2: Refill;
    };
    estatisticas: {
        alimentacoesHoje: number;
        alimentacoesSemana: number;
        totalHistorico: number;
    };
    totalAgendamentos: number;
    maxAgendamentos: number;
    agendamentos: Schedule[];
}

export interface HistoryEntry {
    timestamp: number;
    refill: 'refill1' | 'refill2' | 'ambos';
    manual: boolean;
    quantidade: number;
}

export interface Statistics {
    alimentacoesHoje: number;
    alimentacoesSemana: number;
    totalHistorico: number;
    porRefill: {
        refill1: number;
        refill2: number;
        ambos: number;
    };
    porTipo: {
        manual: number;
        agendado: number;
    };
}

export interface NetworkInfo {
    ip: string;
    hostname: string;
    connected: boolean;
    apMode: boolean;
    ssid: string;
    rssi: number;
}

export interface AppConfig {
    isConfigured: boolean;
    deviceIp: string | null;
    refill1Food: FishFood | null;
    refill2Food: FishFood | null;
}

export type RefillType = 'refill1' | 'refill2' | 'ambos';
