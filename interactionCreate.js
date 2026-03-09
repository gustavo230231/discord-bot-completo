module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        // Comandos slash
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            
            if (!command) return;
            
            try {
                await command.execute(interaction, client);
            } catch (error) {
                console.error('❌ Erro ao executar comando:', error);
                
                const errorEmbed = {
                    color: 0xff0000,
                    title: '❌ Erro',
                    description: 'Ocorreu um erro ao executar este comando.',
                    timestamp: new Date()
                };
                
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
                } else {
                    await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                }
            }
        }
        
        // Botões e menus
        if (interaction.isButton() || interaction.isStringSelectMenu()) {
            const customId = interaction.customId;
            
            // Sistema de tickets
            if (customId.startsWith('ticket_')) {
                const ticketSystem = client.systems.get('tickets');
                if (ticketSystem) await ticketSystem.handleInteraction(interaction, client);
            }
            
            // Sistema de loja
            if (customId.startsWith('loja_') || customId.startsWith('comprar_')) {
                const lojaSystem = client.systems.get('loja');
                if (lojaSystem) await lojaSystem.handleInteraction(interaction, client);
            }
            
            // Sistema de pagamentos
            if (customId.startsWith('pagamento_')) {
                const pagamentoSystem = client.systems.get('pagamentos');
                if (pagamentoSystem) await pagamentoSystem.handleInteraction(interaction, client);
            }
            
            // Sistema de moderação
            if (customId.startsWith('mod_')) {
                const modSystem = client.systems.get('moderacao');
                if (modSystem) await modSystem.handleInteraction(interaction, client);
            }
        }
    }
};