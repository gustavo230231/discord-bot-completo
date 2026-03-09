const { ActivityType } = require('discord.js');

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
            });
            
            await client.application.commands.set(commands);
            console.log(`✅ ${commands.length} comandos registados com sucesso!`);
        } catch (error) {
            console.error('❌ Erro ao registar comandos:', error);
        }
    }
};