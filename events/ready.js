const { ActivityType, REST, Routes } = require('discord.js');
const config = require('../config.js');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(`🚀 ${client.user.tag} está pronto!`);
        
        // Definir atividade do bot
        client.user.setPresence({
            activities: [{
                name: '🛒 Loja Online | /ajuda',
                type: ActivityType.Watching
            }],
            status: 'online'
        });
        
        // Registar comandos slash
        try {
            console.log('🔄 A registar comandos slash...');
            
            const commands = [];
            client.commands.forEach(command => {
                commands.push(command.data.toJSON());
                console.log(`📝 Comando registado: ${command.data.name}`);
            });
            
            const rest = new REST().setToken(config.token);
            
            // Registar comandos globalmente E no servidor específico
            await rest.put(
                Routes.applicationGuildCommands(client.application.id, config.guildId),
                { body: commands }
            );
            
            console.log(`✅ ${commands.length} comandos registados com sucesso no servidor!`);
        } catch (error) {
            console.error('❌ Erro ao registar comandos:', error);
        }
    }
};