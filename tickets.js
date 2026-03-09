const { ChannelType, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const config = require('../config.js');

class TicketSystem {
    constructor() {
        this.name = 'tickets';
        this.activeTickets = new Map();
    }
    
    init(client) {
        this.client = client;
    }
    
    // Criar mensagem inicial de tickets
    async createTicketMessage(channel) {
        const embed = new EmbedBuilder()
            .setTitle('🎫 Suporte')
            .setDescription('Precisas de ajuda?\nAbre um ticket para falar diretamente com a nossa equipa de suporte.\n\n📌 Usa os botões abaixo para escolher o tipo de ticket.')
            .setColor(config.cores.info)
            .setTimestamp();
        
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('ticket_compra')
                    .setLabel('Compra')
                    .setEmoji('🛒')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('ticket_suporte')
                    .setLabel('Suporte')
                    .setEmoji('❓')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('ticket_pagamento')
                    .setLabel('Pagamento')
                    .setEmoji('💰')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('ticket_problema')
                    .setLabel('Problema')
                    .setEmoji('⚠️')
                    .setStyle(ButtonStyle.Danger)
            );
        
        return await channel.send({ embeds: [embed], components: [row] });
    }
    
    // Criar ticket
    async createTicket(interaction, tipo) {
        const guild = interaction.guild;
        const user = interaction.user;
        
        // Verificar se já tem ticket aberto
        const existingTicket = guild.channels.cache.find(ch => 
            ch.name === `ticket-${user.username.toLowerCase()}` && ch.type === ChannelType.GuildText
        );
        
        if (existingTicket) {
            return await interaction.reply({
                content: `❌ Já tens um ticket aberto: ${existingTicket}`,
                ephemeral: true
            });
        }
        
        try {
            // Criar canal do ticket
            const ticketChannel = await guild.channels.create({
                name: `ticket-${user.username.toLowerCase()}`,
                type: ChannelType.GuildText,
                parent: guild.channels.cache.find(ch => ch.name.toLowerCase().includes('ticket'))?.parent,
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone,
                        deny: [PermissionFlagsBits.ViewChannel]
                    },
                    {
                        id: user.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory
                        ]
                    },
                    {
                        id: config.roles.staff,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory,
                            PermissionFlagsBits.ManageMessages
                        ]
                    }
                ]
            });
            
            // Embed do ticket
            const ticketEmbed = new EmbedBuilder()
                .setTitle('🎫 Ticket criado com sucesso!')
                .setDescription(`Olá ${user}, obrigado por entrar em contacto com o suporte.\nUm membro da equipa irá responder o mais rápido possível.\n\n📌 Explica o teu problema com detalhes.`)
                .addFields(
                    { name: 'Tipo de Ticket', value: tipo, inline: true },
                    { name: 'Utilizador', value: user.toString(), inline: true },
                    { name: 'Criado em', value: new Date().toLocaleString('pt-PT'), inline: true }
                )
                .setColor(config.cores.info)
                .setThumbnail(user.displayAvatarURL())
                .setTimestamp();
            
            const ticketRow = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('ticket_fechar')
                        .setLabel('Fechar Ticket')
                        .setEmoji('🔒')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId('ticket_apagar')
                        .setLabel('Apagar Ticket')
                        .setEmoji('🗑️')
                        .setStyle(ButtonStyle.Secondary)
                );
            
            await ticketChannel.send({ embeds: [ticketEmbed], components: [ticketRow] });
            
            // Guardar ticket ativo
            this.activeTickets.set(ticketChannel.id, {
                userId: user.id,
                tipo: tipo,
                criadoEm: new Date(),
                mensagens: []
            });
            
            // Log do ticket criado
            const logsSystem = this.client.systems.get('logs');
            if (logsSystem) {
                await logsSystem.logTicketCreated(user, ticketChannel, tipo);
            }
            
            await interaction.reply({
                content: `✅ Ticket criado com sucesso! ${ticketChannel}`,
                ephemeral: true
            });
            
        } catch (error) {
            console.error('❌ Erro ao criar ticket:', error);
            await interaction.reply({
                content: '❌ Erro ao criar ticket. Tenta novamente.',
                ephemeral: true
            });
        }
    }
    
    // Fechar ticket
    async closeTicket(interaction) {
        const channel = interaction.channel;
        
        if (!channel.name.startsWith('ticket-')) {
            return await interaction.reply({
                content: '❌ Este comando só pode ser usado em tickets.',
                ephemeral: true
            });
        }
        
        const ticketData = this.activeTickets.get(channel.id);
        
        try {
            // Criar transcript (opcional)
            const messages = await channel.messages.fetch({ limit: 100 });
            const transcript = messages.reverse().map(msg => 
                `[${msg.createdAt.toLocaleString('pt-PT')}] ${msg.author.tag}: ${msg.content}`
            ).join('\n');
            
            // Log do ticket fechado
            const logsSystem = this.client.systems.get('logs');
            if (logsSystem) {
                await logsSystem.logTicketClosed(interaction.user, channel, ticketData?.tipo || 'Desconhecido');
            }
            
            // Remover da lista de tickets ativos
            this.activeTickets.delete(channel.id);
            
            await interaction.reply('🔒 Ticket será fechado em 5 segundos...');
            
            setTimeout(async () => {
                try {
                    await channel.delete();
                } catch (error) {
                    console.error('❌ Erro ao apagar canal:', error);
                }
            }, 5000);
            
        } catch (error) {
            console.error('❌ Erro ao fechar ticket:', error);
            await interaction.reply({
                content: '❌ Erro ao fechar ticket.',
                ephemeral: true
            });
        }
    }
    
    // Lidar com interações
    async handleInteraction(interaction, client) {
        const customId = interaction.customId;
        
        if (customId === 'ticket_compra') {
            await this.createTicket(interaction, '🛒 Compra');
        } else if (customId === 'ticket_suporte') {
            await this.createTicket(interaction, '❓ Suporte');
        } else if (customId === 'ticket_pagamento') {
            await this.createTicket(interaction, '💰 Pagamento');
        } else if (customId === 'ticket_problema') {
            await this.createTicket(interaction, '⚠️ Problema');
        } else if (customId === 'ticket_fechar' || customId === 'ticket_apagar') {
            await this.closeTicket(interaction);
        }
    }
}

module.exports = new TicketSystem();