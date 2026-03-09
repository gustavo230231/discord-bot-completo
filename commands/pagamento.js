const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const config = require('../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pagamento')
        .setDescription('Comandos de gestão de pagamentos (apenas staff)')
        .addSubcommand(subcommand =>
            subcommand
                .setName('confirmar')
                .setDescription('Confirmar pagamento de um cliente')
                .addUserOption(option =>
                    option.setName('cliente')
                        .setDescription('Cliente que fez o pagamento')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('produto')
                        .setDescription('Produto comprado')
                        .setRequired(true)
                        .addChoices(
                            { name: '🤖 Bot Discord Personalizado', value: 'bot_discord' },
                            { name: '🌐 Website Profissional', value: 'website' },
                            { name: '🎨 Design de Logo', value: 'logo' },
                            { name: '🎬 Edição de Vídeo', value: 'video' },
                            { name: '⭐ Acesso Premium', value: 'premium' }
                        ))
                .addStringOption(option =>
                    option.setName('metodo')
                        .setDescription('Método de pagamento usado')
                        .setRequired(true)
                        .addChoices(
                            { name: 'PayPal', value: 'paypal' },
                            { name: 'MBWay', value: 'mbway' },
                            { name: 'Crypto', value: 'crypto' },
                            { name: 'Transferência', value: 'transferencia' }
                        ))
                .addStringOption(option =>
                    option.setName('valor')
                        .setDescription('Valor pago (ex: 25€)')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('rejeitar')
                .setDescription('Rejeitar pagamento de um cliente')
                .addUserOption(option =>
                    option.setName('cliente')
                        .setDescription('Cliente cujo pagamento foi rejeitado')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('motivo')
                        .setDescription('Motivo da rejeição')
                        .setRequired(true)))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    
    async execute(interaction, client) {
        const subcommand = interaction.options.getSubcommand();
        
        if (subcommand === 'confirmar') {
            const cliente = interaction.options.getUser('cliente');
            const produtoId = interaction.options.getString('produto');
            const metodo = interaction.options.getString('metodo');
            const valor = interaction.options.getString('valor');
            
            // Encontrar produto
            const produto = config.produtos.find(p => p.id === produtoId);
            if (!produto) {
                return await interaction.reply({
                    content: '❌ Produto não encontrado.',
                    ephemeral: true
                });
            }
            
            try {
                // Se for premium, dar cargo automaticamente
                if (produtoId === 'premium') {
                    const member = await interaction.guild.members.fetch(cliente.id);
                    const premiumRole = interaction.guild.roles.cache.get(config.roles.premium);
                    
                    if (premiumRole) {
                        await member.roles.add(premiumRole);
                    }
                }
                
                // Notificar cliente
                const clienteEmbed = new EmbedBuilder()
                    .setTitle('🎉 Pagamento Confirmado!')
                    .setDescription('O teu pagamento foi confirmado com sucesso!')
                    .addFields(
                        { name: 'Produto', value: `${produto.emoji} ${produto.nome}`, inline: true },
                        { name: 'Valor', value: valor, inline: true },
                        { name: 'Método', value: metodo.toUpperCase(), inline: true }
                    )
                    .setColor(config.cores.sucesso)
                    .setFooter({ text: 'Obrigado pela tua compra! ❤️' })
                    .setTimestamp();
                
                try {
                    await cliente.send({ embeds: [clienteEmbed] });
                } catch (error) {
                    console.log('Não foi possível enviar DM ao cliente');
                }
                
                // Recibo no canal de recibos
                const reciboChannel = interaction.guild.channels.cache.get(config.channels.recibos);
                if (reciboChannel) {
                    const reciboEmbed = new EmbedBuilder()
                        .setTitle('🧾 Pagamento Confirmado')
                        .addFields(
                            { name: 'Cliente', value: cliente.toString(), inline: true },
                            { name: 'Produto', value: `${produto.emoji} ${produto.nome}`, inline: true },
                            { name: 'Valor', value: valor, inline: true },
                            { name: 'Método', value: metodo.toUpperCase(), inline: true },
                            { name: 'Confirmado por', value: interaction.user.toString(), inline: true },
                            { name: 'Data', value: new Date().toLocaleDateString('pt-PT'), inline: true }
                        )
                        .setColor(config.cores.sucesso)
                        .setThumbnail(cliente.displayAvatarURL())
                        .setTimestamp();
                    
                    await reciboChannel.send({ embeds: [reciboEmbed] });
                }
                
                // Log da confirmação
                const logsSystem = client.systems.get('logs');
                if (logsSystem) {
                    await logsSystem.logPurchase(cliente, produto.nome, valor, metodo, 'CONFIRMADO');
                }
                
                // Resposta ao staff
                const staffEmbed = new EmbedBuilder()
                    .setTitle('✅ Pagamento Confirmado')
                    .setDescription(`Pagamento de ${cliente} foi confirmado com sucesso!`)
                    .addFields(
                        { name: 'Produto', value: `${produto.emoji} ${produto.nome}`, inline: true },
                        { name: 'Valor', value: valor, inline: true },
                        { name: 'Método', value: metodo.toUpperCase(), inline: true }
                    )
                    .setColor(config.cores.sucesso)
                    .setTimestamp();
                
                await interaction.reply({ embeds: [staffEmbed] });
                
            } catch (error) {
                console.error('Erro ao confirmar pagamento:', error);
                await interaction.reply({
                    content: '❌ Erro ao confirmar pagamento.',
                    ephemeral: true
                });
            }
        }
        
        else if (subcommand === 'rejeitar') {
            const cliente = interaction.options.getUser('cliente');
            const motivo = interaction.options.getString('motivo');
            
            try {
                // Notificar cliente
                const clienteEmbed = new EmbedBuilder()
                    .setTitle('❌ Pagamento Rejeitado')
                    .setDescription('O teu pagamento foi rejeitado.')
                    .addFields(
                        { name: 'Motivo', value: motivo, inline: false },
                        { name: 'Próximos Passos', value: 'Contacta a equipa para esclarecimentos ou tenta novamente.', inline: false }
                    )
                    .setColor(config.cores.erro)
                    .setTimestamp();
                
                try {
                    await cliente.send({ embeds: [clienteEmbed] });
                } catch (error) {
                    console.log('Não foi possível enviar DM ao cliente');
                }
                
                // Resposta ao staff
                const staffEmbed = new EmbedBuilder()
                    .setTitle('❌ Pagamento Rejeitado')
                    .setDescription(`Pagamento de ${cliente} foi rejeitado.`)
                    .addFields(
                        { name: 'Motivo', value: motivo, inline: false },
                        { name: 'Rejeitado por', value: interaction.user.toString(), inline: true }
                    )
                    .setColor(config.cores.erro)
                    .setTimestamp();
                
                await interaction.reply({ embeds: [staffEmbed] });
                
            } catch (error) {
                console.error('Erro ao rejeitar pagamento:', error);
                await interaction.reply({
                    content: '❌ Erro ao rejeitar pagamento.',
                    ephemeral: true
                });
            }
        }
    }
};