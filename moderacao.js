const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const config = require('../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mod')
        .setDescription('Comandos de moderação')
        .addSubcommand(subcommand =>
            subcommand
                .setName('ban')
                .setDescription('Banir um utilizador')
                .addUserOption(option =>
                    option.setName('utilizador')
                        .setDescription('Utilizador a banir')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('motivo')
                        .setDescription('Motivo do ban')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('kick')
                .setDescription('Expulsar um utilizador')
                .addUserOption(option =>
                    option.setName('utilizador')
                        .setDescription('Utilizador a expulsar')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('motivo')
                        .setDescription('Motivo da expulsão')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('mute')
                .setDescription('Silenciar um utilizador')
                .addUserOption(option =>
                    option.setName('utilizador')
                        .setDescription('Utilizador a silenciar')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('tempo')
                        .setDescription('Tempo em minutos')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('motivo')
                        .setDescription('Motivo do mute')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('clear')
                .setDescription('Limpar mensagens')
                .addIntegerOption(option =>
                    option.setName('quantidade')
                        .setDescription('Número de mensagens a apagar (1-100)')
                        .setRequired(true)
                        .setMinValue(1)
                        .setMaxValue(100)))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    
    async execute(interaction, client) {
        const subcommand = interaction.options.getSubcommand();
        
        if (subcommand === 'ban') {
            const user = interaction.options.getUser('utilizador');
            const motivo = interaction.options.getString('motivo') || 'Não especificado';
            
            try {
                const member = await interaction.guild.members.fetch(user.id);
                await member.ban({ reason: motivo });
                
                const embed = new EmbedBuilder()
                    .setTitle('🔨 Utilizador Banido')
                    .addFields(
                        { name: 'Utilizador', value: user.toString(), inline: true },
                        { name: 'Moderador', value: interaction.user.toString(), inline: true },
                        { name: 'Motivo', value: motivo, inline: false }
                    )
                    .setColor(config.cores.erro)
                    .setTimestamp();
                
                await interaction.reply({ embeds: [embed] });
                
                // Log da ação
                const logsSystem = client.systems.get('logs');
                if (logsSystem) {
                    await logsSystem.logModeration(interaction.user, user, 'Ban', motivo);
                }
                
            } catch (error) {
                await interaction.reply({
                    content: '❌ Erro ao banir utilizador.',
                    ephemeral: true
                });
            }
        }
        
        else if (subcommand === 'kick') {
            const user = interaction.options.getUser('utilizador');
            const motivo = interaction.options.getString('motivo') || 'Não especificado';
            
            try {
                const member = await interaction.guild.members.fetch(user.id);
                await member.kick(motivo);
                
                const embed = new EmbedBuilder()
                    .setTitle('👢 Utilizador Expulso')
                    .addFields(
                        { name: 'Utilizador', value: user.toString(), inline: true },
                        { name: 'Moderador', value: interaction.user.toString(), inline: true },
                        { name: 'Motivo', value: motivo, inline: false }
                    )
                    .setColor(config.cores.aviso)
                    .setTimestamp();
                
                await interaction.reply({ embeds: [embed] });
                
                // Log da ação
                const logsSystem = client.systems.get('logs');
                if (logsSystem) {
                    await logsSystem.logModeration(interaction.user, user, 'Kick', motivo);
                }
                
            } catch (error) {
                await interaction.reply({
                    content: '❌ Erro ao expulsar utilizador.',
                    ephemeral: true
                });
            }
        }
        
        else if (subcommand === 'mute') {
            const user = interaction.options.getUser('utilizador');
            const tempo = interaction.options.getInteger('tempo');
            const motivo = interaction.options.getString('motivo') || 'Não especificado';
            
            try {
                const member = await interaction.guild.members.fetch(user.id);
                await member.timeout(tempo * 60 * 1000, motivo);
                
                const embed = new EmbedBuilder()
                    .setTitle('🔇 Utilizador Silenciado')
                    .addFields(
                        { name: 'Utilizador', value: user.toString(), inline: true },
                        { name: 'Moderador', value: interaction.user.toString(), inline: true },
                        { name: 'Duração', value: `${tempo} minutos`, inline: true },
                        { name: 'Motivo', value: motivo, inline: false }
                    )
                    .setColor(config.cores.aviso)
                    .setTimestamp();
                
                await interaction.reply({ embeds: [embed] });
                
                // Log da ação
                const logsSystem = client.systems.get('logs');
                if (logsSystem) {
                    await logsSystem.logModeration(interaction.user, user, 'Mute', motivo, `${tempo} minutos`);
                }
                
            } catch (error) {
                await interaction.reply({
                    content: '❌ Erro ao silenciar utilizador.',
                    ephemeral: true
                });
            }
        }
        
        else if (subcommand === 'clear') {
            const quantidade = interaction.options.getInteger('quantidade');
            
            try {
                const messages = await interaction.channel.bulkDelete(quantidade, true);
                
                const embed = new EmbedBuilder()
                    .setTitle('🧹 Mensagens Limpas')
                    .setDescription(`${messages.size} mensagens foram apagadas por ${interaction.user}`)
                    .setColor(config.cores.sucesso)
                    .setTimestamp();
                
                await interaction.reply({ embeds: [embed] });
                
                // Apagar a resposta após 5 segundos
                setTimeout(async () => {
                    try {
                        await interaction.deleteReply();
                    } catch (error) {
                        console.error('❌ Erro ao apagar mensagem:', error);
                    }
                }, 5000);
                
            } catch (error) {
                await interaction.reply({
                    content: '❌ Erro ao limpar mensagens.',
                    ephemeral: true
                });
            }
        }
    }
};