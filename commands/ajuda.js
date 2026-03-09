const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ajuda')
        .setDescription('Mostrar comandos disponíveis'),
    
    async execute(interaction, client) {
        const embed = new EmbedBuilder()
            .setTitle('🤖 Comandos do Bot')
            .setDescription('Lista de comandos disponíveis:')
            .addFields(
                { name: '🎫 Tickets', value: '`/setup tickets` - Configurar sistema de tickets\n`/ticket fechar` - Fechar ticket atual', inline: false },
                { name: '🛒 Loja', value: '`/setup loja` - Configurar mensagem da loja\n`/loja` - Ver produtos disponíveis', inline: false },
                { name: '🛡️ Moderação', value: '`/ban` - Banir utilizador\n`/kick` - Expulsar utilizador\n`/mute` - Silenciar utilizador\n`/clear` - Limpar mensagens', inline: false },
                { name: '📊 Estatísticas', value: '`/stats` - Ver estatísticas do servidor', inline: false },
                { name: '⚙️ Configuração', value: '`/config` - Configurar o bot (apenas admins)', inline: false }
            )
            .setColor(config.cores.info)
            .setFooter({ text: 'Bot criado por Kiro' })
            .setTimestamp();
        
        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};