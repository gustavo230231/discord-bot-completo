const config = require('../config.js');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member, client) {
        // Log do membro que entrou
        const logsSystem = client.systems.get('logs');
        if (logsSystem) {
            await logsSystem.logMemberJoin(member, client);
        }
        
        // Dar cargo de cliente automaticamente (opcional)
        try {
            if (config.roles.cliente && !member.user.bot) {
                const role = member.guild.roles.cache.get(config.roles.cliente);
                if (role) {
                    await member.roles.add(role);
                }
            }
        } catch (error) {
            console.error('❌ Erro ao dar cargo de cliente:', error);
        }
        
        // Mensagem de boas-vindas (opcional)
        const welcomeChannel = member.guild.channels.cache.find(ch => ch.name === 'boas-vindas');
        if (welcomeChannel) {
            const welcomeEmbed = {
                color: config.cores.sucesso,
                title: '👋 Bem-vindo!',
                description: `Olá ${member}, bem-vindo ao servidor!\n\n🛒 Visita a nossa loja em <#${config.channels.loja}>\n🎫 Se precisares de ajuda, abre um ticket em <#${config.channels.tickets}>`,
                thumbnail: {
                    url: member.user.displayAvatarURL()
                },
                timestamp: new Date()
            };
            
            try {
                await welcomeChannel.send({ embeds: [welcomeEmbed] });
            } catch (error) {
                console.error('❌ Erro ao enviar mensagem de boas-vindas:', error);
            }
        }
    }
};