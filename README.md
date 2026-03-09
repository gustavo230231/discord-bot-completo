# 🤖 Bot de Discord - Loja Completa

Bot completo de Discord com sistema de loja, tickets, pagamentos, moderação e muito mais!

## 🚀 Funcionalidades

### 🎫 Sistema de Tickets
- Botões para diferentes tipos de suporte
- Canais privados automáticos
- Permissões configuradas automaticamente
- Logs de tickets criados/fechados

### 🛒 Sistema de Loja
- Produtos configuráveis
- Interface com botões interativos
- Carrinho de compras
- Integração com pagamentos

### 💳 Sistema de Pagamentos
- PayPal, MBWay e Crypto
- Geração automática de IDs de pedido
- Confirmação de pagamentos
- Recibos automáticos

### 📦 Sistema de Entrega
- Entrega automática (premium)
- Canais de entrega personalizados
- Tickets de entrega para produtos customizados
- Logs de entrega

### 🛡️ Sistema de Moderação
- Comandos de ban, kick, mute
- Limpeza de mensagens
- Logs de todas as ações
- Permissões configuráveis

### 📊 Sistema de Logs
- Logs de membros (entrada/saída)
- Logs de moderação
- Logs de compras
- Logs de tickets

### 📈 Estatísticas
- Membros online/total
- Canais e cargos
- Tickets ativos
- Informações do servidor

## 📋 Instalação

### 1. Pré-requisitos
- Node.js 16.9.0 ou superior
- NPM ou Yarn
- Bot criado no Discord Developer Portal

### 2. Configuração do Bot no Discord

1. Vai ao [Discord Developer Portal](https://discord.com/developers/applications)
2. Cria uma nova aplicação
3. Vai à secção "Bot" e cria um bot
4. Copia o token do bot
5. Ativa as seguintes intents:
   - Server Members Intent
   - Message Content Intent

### 3. Permissões do Bot

O bot precisa das seguintes permissões:
- Manage Channels
- Manage Roles
- Kick Members
- Ban Members
- Moderate Members
- Send Messages
- Manage Messages
- Read Message History
- Use Slash Commands

### 4. Instalação

```bash
# Clonar ou descarregar os ficheiros
cd discord-loja-bot

# Instalar dependências
npm install

# Configurar o bot
# Edita o ficheiro config.js com as tuas informações
```

### 5. Configuração

Edita o ficheiro `config.js`:

```javascript
module.exports = {
    // Token do bot
    token: 'SEU_TOKEN_AQUI',
    
    // ID do servidor
    guildId: 'SEU_GUILD_ID_AQUI',
    
    // IDs dos canais
    channels: {
        tickets: 'ID_CANAL_TICKETS',
        logs: 'ID_CANAL_LOGS',
        loja: 'ID_CANAL_LOJA',
        recibos: 'ID_CANAL_RECIBOS',
        pagamentos: 'ID_CANAL_PAGAMENTOS'
    },
    
    // IDs dos cargos
    roles: {
        staff: 'ID_CARGO_STAFF',
        cliente: 'ID_CARGO_CLIENTE',
        premium: 'ID_CARGO_PREMIUM'
    },
    
    // Informações de pagamento
    pagamentos: {
        paypal: 'teu_email@paypal.com',
        mbway: '+351 9XX XXX XXX',
        crypto: 'ENDEREÇO_CRYPTO_AQUI'
    }
};
```

### 6. Estrutura de Canais Recomendada

```
📦 LOJA
├── 🛒・loja
└── 💳・pagamentos

🎫 SUPORTE  
└── 🎫・tickets

📊 SISTEMA
├── 📜・logs
└── 🧾・recibos

📦 ENTREGAS (categoria)
└── (canais criados automaticamente)
```

### 7. Executar o Bot

```bash
# Modo normal
npm start

# Modo desenvolvimento (com nodemon)
npm run dev
```

## 🎮 Como Usar

### Configuração Inicial

1. **Configurar Tickets:**
   ```
   /setup tickets #canal-tickets
   ```

2. **Configurar Loja:**
   ```
   /setup loja #canal-loja
   ```

### Comandos Disponíveis

- `/ajuda` - Lista todos os comandos
- `/setup` - Configurar sistemas do bot
- `/loja` - Ver produtos disponíveis
- `/stats` - Estatísticas do servidor
- `/mod ban/kick/mute/clear` - Comandos de moderação

### Fluxo de Compra

1. Cliente clica no produto na loja
2. Escolhe método de pagamento
3. Recebe informações de pagamento
4. Envia pagamento e confirma
5. Staff verifica e confirma
6. Produto é entregue automaticamente

## 🔧 Personalização

### Adicionar Produtos

Edita o array `produtos` no `config.js`:

```javascript
produtos: [
    {
        id: 'meu_produto',
        nome: '🎮 Meu Produto',
        preco: 20,
        descricao: 'Descrição do produto',
        emoji: '🎮'
    }
]
```

### Modificar Cores

Edita as cores no `config.js`:

```javascript
cores: {
    sucesso: '#00ff00',
    erro: '#ff0000',
    info: '#0099ff',
    aviso: '#ffaa00',
    loja: '#9932cc'
}
```

## 🐛 Resolução de Problemas

### Bot não responde
- Verifica se o token está correto
- Confirma que as intents estão ativadas
- Verifica se o bot tem permissões no servidor

### Comandos não aparecem
- Aguarda alguns minutos (pode demorar)
- Reinicia o bot
- Verifica se o bot tem permissão "Use Slash Commands"

### Tickets não funcionam
- Verifica se os IDs dos canais estão corretos
- Confirma que o bot tem permissão "Manage Channels"
- Verifica se o cargo staff está configurado

## 📞 Suporte

Se precisares de ajuda:
1. Verifica este README
2. Confirma a configuração no `config.js`
3. Verifica os logs do console
4. Contacta o suporte

## 📄 Licença

Este projeto está sob a licença MIT.

---

**Criado por Kiro** 🤖