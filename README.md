# 🐟 AquaFeeder

Aplicativo React Native para controlar um alimentador automático de peixes via ESP32.

<p align="center">
  <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native" />
  <img src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white" alt="Expo" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
</p>

## ✨ Features

- 🔧 **Setup WiFi** - Conecta o alimentador à sua rede doméstica
- 🐠 **Alimentação Manual** - Botões para alimentar ambos os refis ou individualmente
- ⏰ **Agendamentos** - Configure horários automáticos de alimentação
- 📊 **Estatísticas** - Acompanhe o histórico de alimentações
- 🎨 **Design Premium** - Interface escura elegante com tema aquático

## 📱 Screenshots

| Tela Inicial | Home | Agendamentos |
|:---:|:---:|:---:|
| Setup WiFi | Controle rápido | Configurar horários |

## 🚀 Começando

### Pré-requisitos

- Node.js 18+
- Expo CLI
- Expo Go app no celular

### Instalação

```bash
# Clone o repositório
git clone https://github.com/pattchvs/alimentador-peixes.git

# Entre na pasta
cd alimentador-peixes

# Instale as dependências
npm install

# Inicie o projeto
npx expo start
```

Escaneie o QR code com o Expo Go para testar no celular.

## 🏗️ Estrutura do Projeto

```
src/
├── components/     # Componentes reutilizáveis
│   └── common/     # Button, Card, Header, Input
├── contexts/       # Estado global (AppContext)
├── data/           # Base de rações (fishFoods.json)
├── navigation/     # Configuração de navegação
├── screens/        # Telas do app
│   ├── setup/      # Fluxo de configuração inicial
│   └── settings/   # Telas de configurações
├── services/       # API de comunicação com ESP32
├── styles/         # Cores e tema
└── types/          # Definições TypeScript
```

## 🔌 API do ESP32

O app se comunica com o ESP32 via HTTP:

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/status` | GET | Status do dispositivo |
| `/alimentar` | POST | Acionar alimentação |
| `/agendamento` | POST/PUT/DELETE | Gerenciar agendamentos |
| `/historico` | GET | Histórico de alimentações |
| `/scan-wifi` | GET | Escanear redes (modo AP) |
| `/config-wifi` | POST | Configurar WiFi |

## 🛠️ Tecnologias

- **React Native** + **Expo** - Framework mobile
- **TypeScript** - Tipagem estática
- **React Navigation** - Navegação entre telas
- **AsyncStorage** - Persistência local
- **Expo Haptics** - Feedback tátil

## 📄 Licença

MIT © Patrick Chaves

---

<p align="center">
  Feito com ❤️ para aquaristas
</p>
