// Carregar variáveis de ambiente
require('dotenv').config();

module.exports = {
    // Token do bot (obtém no Discord Developer Portal)
    token: process.env.DISCORD_TOKEN || 'SEU_TOKEN_AQUI',
    
    // ID do servidor
    guildId: process.env.GUILD_ID || '1470873664819036162',
    
    // Canais do sistema
    channels: {
        tickets: process.env.TICKETS_CHANNEL || '1470879675877298317',
        logs: process.env.LOGS_CHANNEL || '1480310204699513075', 
        loja: process.env.LOJA_CHANNEL || '1470879892399980644',
        recibos: process.env.RECIBOS_CHANNEL || '1470879916206588024',
        pagamentos: null // Não usado - instruções aparecem diretamente
    },
    
    // Cargos do sistema
    roles: {
        staff: process.env.STAFF_ROLE || '1470877985220464857',
        cliente: process.env.CLIENTE_ROLE || '1470878126493012154',
        premium: process.env.PREMIUM_ROLE || '1470878111737446441'
    },
    
    // Configurações da loja
    produtos: [
        {
            id: 'bot_discord',
            nome: '🤖 Bot Discord Personalizado',
            preco: 25,
            descricao: 'Bot Discord completamente personalizado às tuas necessidades',
            emoji: '🤖'
        },
        {
            id: 'website',
            nome: '🌐 Website Profissional', 
            preco: 50,
            descricao: 'Website profissional responsivo e moderno',
            emoji: '🌐'
        },
        {
            id: 'logo',
            nome: '🎨 Design de Logo',
            preco: 15,
            descricao: 'Logo profissional para a tua marca',
            emoji: '🎨'
        },
        {
            id: 'video',
            nome: '🎬 Edição de Vídeo',
            preco: 30,
            descricao: 'Edição profissional de vídeos',
            emoji: '🎬'
        },
        {
            id: 'premium',
            nome: '⭐ Acesso Premium',
            preco: 10,
            descricao: 'Acesso a funcionalidades premium do servidor',
            emoji: '⭐'
        }
    ],
    
    // Métodos de pagamento
    pagamentos: {
        paypal: process.env.PAYPAL_EMAIL || 'motagustavo2012@gmail.com',
        mbway: process.env.MBWAY_NUMBER || '+351 919184357',
        crypto: process.env.CRYPTO_ADDRESS || null // Opcional
    },
    
    // Cores para embeds
    cores: {
        sucesso: '#00ff00',
        erro: '#ff0000',
        info: '#0099ff',
        aviso: '#ffaa00',
        loja: '#9932cc'
    }
};