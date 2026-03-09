const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('Ver estatísticas do servidor'),
    
    async execute(interaction, client) {
        const guild = interaction.guild;
        
        // Contar membros
        const totalMembers = guild.memberCount;
        const onlineMembers = guild.members.cache.filter(member => 
            member.presence?.status === 'online' || 
            member.presence?.status === 'idle' || 
            member.presence?.status === 'dnd'
        ).size;
        
        // Contar canais
        const textChannels = guild.channels.cache.filter(ch => ch.type === 0).size;
        const voiceChannels = guild.channels.cache.filter(ch => ch.type === 2).size;
        
        // Contar cargos
        const roles = guild.roles.cache.size - 1; // -1 para excluir @everyone
        
        // Tickets ativos (se o sistema existir)
        const ticketSystem = client.systems.get('tickets');
        const activeTickets = ticketSystem ? ticketSystem.activeTickets.size : 0;
        
        // Data de criação do servidor
        const createdAt = guild.createdAt.toLocaleDateString('pt-PT');
        
        const embed = new EmbedBuilder()
            .setTitle(`📊 Estatísticas - ${guild.name}`)
            .setThumbnail(guild.iconURL())
            .addFields(
                { name: '👥 Membros', value: `**Total:** ${totalMembers}\n**Online:** ${onlineMembers}`, inline: true },
                { name: '📝 Canais', value: `**Texto:** ${textChannels}\n**Voz:** ${voiceChannels}`, inline: true },
                { name: '🎭 Cargos', value: `${roles}`, inline: true },
                { name: '🎫 Tickets Ativos', value: `${activeTickets}`, inline: true },
                { name: '📅 Criado em', value: createdAt, inline: true },
                { name: '🤖 Bot Online há', value: client.uptime ? `${Math.floor(client.uptime / 1000 / 60)} minutos` : 'Desconhecido', inline: true }
            )
            .setColor(config.cores.info)
            .setFooter({ text: `ID do Servidor: ${guild.id}` })
            .setTimestamp();
        
        await interaction.reply({ embeds: [embed] });
    }
};