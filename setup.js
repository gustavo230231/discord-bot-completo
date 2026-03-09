const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('Configurar o bot no servidor')
        .addSubcommand(subcommand =>
            subcommand
                .setName('tickets')
                .setDescription('Criar mensagem de tickets')
                .addChannelOption(option =>
                    option.setName('canal')
                        .setDescription('Canal onde criar a mensagem de tickets')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('loja')
                .setDescription('Criar mensagem da loja')
                .addChannelOption(option =>
                    option.setName('canal')
                        .setDescription('Canal onde criar a mensagem da loja')
                        .setRequired(true)))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    async execute(interaction, client) {
        const subcommand = interaction.options.getSubcommand();
        const canal = interaction.options.getChannel('canal');
        
        if (subcommand === 'tickets') {
            const ticketSystem = client.systems.get('tickets');
            if (ticketSystem) {
                await ticketSystem.createTicketMessage(canal);
                await interaction.reply({
                    content: `✅ Mensagem de tickets criada em ${canal}`,
                    ephemeral: true
                });
            }
        } else if (subcommand === 'loja') {
            const lojaSystem = client.systems.get('loja');
            if (lojaSystem) {
                await lojaSystem.createLojaMessage(canal);
                await interaction.reply({
                    content: `✅ Mensagem da loja criada em ${canal}`,
                    ephemeral: true
                });
            }
        }
    }
};