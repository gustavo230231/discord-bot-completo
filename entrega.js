const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../config.js');

class EntregaSystem {
    constructor() {
        this.name = 'entrega';
        this.deliveries = new Map();
    }
    
    init(client) {
        this.client = client;
    }
    
    // Processar entrega
    async processDelivery(paymentData) {
        const deliveryData = {
            ...paymentData,
            deliveryStatus: 'preparando',
            deliveryStarted: new Date()
        };
        
        this.deliveries.set(paymentData.orderId, deliveryData);
        
        // Determinar tipo de entrega baseado no produto
        switch (paymentData.produto.id) {
            case 'premium':
                await this.deliverPremiumAccess(deliveryData);
                break;
            case 'bot_discord':
            case 'website':
            case 'logo':
            case 'video':
                await this.deliverCustomProduct(deliveryData);
                break;
            default:
                await this.deliverGeneric(deliveryData);
        }
    }
    
    // Entregar acesso premium
    async deliverPremiumAccess(deliveryData) {
        const guild = this.client.guilds.cache.first();
        const member = await guild.members.fetch(deliveryData.user.id);
        
        try {
            // Dar cargo premium
            const premiumRole = guild.roles.cache.get(config.roles.premium);
            if (premiumRole) {
                await member.roles.add(premiumRole);
            }
            
            // Notificar cliente
            const embed = new EmbedBuilder()
                .setTitle('📦 Produto Entregue!')
                .setDescription('O teu acesso premium foi ativado!')
                .addFields(
                    { name: '⭐ Benefícios Premium', value: '• Acesso a canais exclusivos\n• Prioridade no suporte\n• Funcionalidades especiais', inline: false },
                    { name: '🎉 Status', value: 'Ativo imediatamente', inline: true }
                )
                .setColor(config.cores.sucesso)
                .setTimestamp();
            
            await deliveryData.user.send({ embeds: [embed] });
            
            // Atualizar status
            deliveryData.deliveryStatus = 'entregue';
            deliveryData.deliveredAt = new Date();
            
            // Log da entrega
            await this.logDelivery(deliveryData, 'Acesso premium ativado automaticamente');
            
        } catch (error) {
            console.error('❌ Erro ao entregar premium:', error);
            await this.deliverCustomProduct(deliveryData);
        }
    }
    
    // Entregar produto personalizado
    async deliverCustomProduct(deliveryData) {
        // Criar ticket de entrega para produtos personalizados
        const guild = this.client.guilds.cache.first();
        
        try {
            // Criar canal de entrega
            const deliveryChannel = await guild.channels.create({
                name: `entrega-${deliveryData.user.username.toLowerCase()}`,
                type: 0, // Text channel
                parent: guild.channels.cache.find(ch => ch.name.toLowerCase().includes('entrega'))?.parent,
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone,
                        deny: ['ViewChannel']
                    },
                    {
                        id: deliveryData.user.id,
                        allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory']
                    },
                    {
                        id: config.roles.staff,
                        allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory', 'ManageMessages']
                    }
                ]
            });
            
            const embed = new EmbedBuilder()
                .setTitle('📦 Entrega do Produto')
                .setDescription('O teu produto está a ser preparado!')
                .addFields(
                    { name: 'Produto', value: `${deliveryData.produto.emoji} ${deliveryData.produto.nome}`, inline: true },
                    { name: 'Cliente', value: deliveryData.user.toString(), inline: true },
                    { name: 'ID do Pedido', value: `#${deliveryData.orderId}`, inline: true },
                    { name: '📋 Próximos Passos', value: '1. A nossa equipa irá preparar o teu produto\n2. Receberás atualizações neste canal\n3. O produto será entregue aqui quando pronto', inline: false }
                )
                .setColor(config.cores.info)
                .setTimestamp();
            
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`entrega_concluida_${deliveryData.orderId}`)
                        .setLabel('Marcar como Entregue')
                        .setEmoji('✅')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId(`entrega_problema_${deliveryData.orderId}`)
                        .setLabel('Reportar Problema')
                        .setEmoji('⚠️')
                        .setStyle(ButtonStyle.Danger)
                );
            
            await deliveryChannel.send({ embeds: [embed], components: [row] });
            
            // Notificar cliente
            const clientEmbed = new EmbedBuilder()
                .setTitle('📦 Preparação Iniciada')
                .setDescription(`O teu produto está a ser preparado!\nAcompanha o progresso em ${deliveryChannel}`)
                .setColor(config.cores.info)
                .setTimestamp();
            
            await deliveryData.user.send({ embeds: [clientEmbed] });
            
            // Atualizar status
            deliveryData.deliveryStatus = 'em_preparacao';
            deliveryData.deliveryChannel = deliveryChannel.id;
            
            // Log da entrega
            await this.logDelivery(deliveryData, `Canal de entrega criado: ${deliveryChannel.name}`);
            
        } catch (error) {
            console.error('❌ Erro ao criar canal de entrega:', error);
            await this.deliverGeneric(deliveryData);
        }
    }
    
    // Entrega genérica (ticket)
    async deliverGeneric(deliveryData) {
        const ticketSystem = this.client.systems.get('tickets');
        if (ticketSystem) {
            // Simular criação de ticket de entrega
            console.log(`📦 Criar ticket de entrega para ${deliveryData.produto.nome}`);
            
            // Notificar cliente
            const embed = new EmbedBuilder()
                .setTitle('📦 Produto em Preparação')
                .setDescription('O teu produto está a ser preparado!\nA nossa equipa entrará em contacto contigo em breve.')
                .addFields(
                    { name: 'Produto', value: `${deliveryData.produto.emoji} ${deliveryData.produto.nome}`, inline: true },
                    { name: 'Tempo Estimado', value: '24-48 horas', inline: true }
                )
                .setColor(config.cores.info)
                .setTimestamp();
            
            await deliveryData.user.send({ embeds: [embed] });
            
            deliveryData.deliveryStatus = 'ticket_criado';
        }
    }
    
    // Marcar entrega como concluída
    async markDeliveryComplete(interaction, orderId) {
        const deliveryData = this.deliveries.get(orderId);
        if (!deliveryData) {
            return await interaction.reply({
                content: '❌ Entrega não encontrada.',
                ephemeral: true
            });
        }
        
        // Atualizar status
        deliveryData.deliveryStatus = 'entregue';
        deliveryData.deliveredAt = new Date();
        deliveryData.deliveredBy = interaction.user;
        
        // Notificar cliente
        const embed = new EmbedBuilder()
            .setTitle('🎉 Produto Entregue!')
            .setDescription('O teu produto foi entregue com sucesso!')
            .addFields(
                { name: 'Produto', value: `${deliveryData.produto.emoji} ${deliveryData.produto.nome}`, inline: true },
                { name: 'Entregue por', value: interaction.user.toString(), inline: true },
                { name: 'Data de Entrega', value: new Date().toLocaleDateString('pt-PT'), inline: true }
            )
            .setColor(config.cores.sucesso)
            .setFooter({ text: 'Obrigado pela tua compra! ❤️' })
            .setTimestamp();
        
        try {
            await deliveryData.user.send({ embeds: [embed] });
        } catch (error) {
            console.error('❌ Erro ao notificar cliente:', error);
        }
        
        // Atualizar mensagem
        const updatedEmbed = new EmbedBuilder()
            .setTitle('✅ Entrega Concluída')
            .setDescription(`Produto entregue por ${interaction.user}`)
            .setColor(config.cores.sucesso)
            .setTimestamp();
        
        await interaction.update({ embeds: [updatedEmbed], components: [] });
        
        // Log da entrega
        await this.logDelivery(deliveryData, `Entrega marcada como concluída por ${interaction.user.tag}`);
        
        // Fechar canal após 24 horas (opcional)
        if (deliveryData.deliveryChannel) {
            setTimeout(async () => {
                try {
                    const channel = interaction.guild.channels.cache.get(deliveryData.deliveryChannel);
                    if (channel) {
                        await channel.send('🔒 Este canal será fechado em 1 minuto...');
                        setTimeout(() => channel.delete(), 60000);
                    }
                } catch (error) {
                    console.error('❌ Erro ao fechar canal:', error);
                }
            }, 24 * 60 * 60 * 1000); // 24 horas
        }
    }
    
    // Log da entrega
    async logDelivery(deliveryData, details) {
        const logsSystem = this.client.systems.get('logs');
        if (!logsSystem) return;
        
        const guild = this.client.guilds.cache.first();
        const logChannel = guild.channels.cache.get(config.channels.logs);
        if (!logChannel) return;
        
        const embed = new EmbedBuilder()
            .setTitle('📦 Log de Entrega')
            .setDescription(details)
            .addFields(
                { name: 'Cliente', value: deliveryData.user.toString(), inline: true },
                { name: 'Produto', value: `${deliveryData.produto.emoji} ${deliveryData.produto.nome}`, inline: true },
                { name: 'Status', value: deliveryData.deliveryStatus, inline: true },
                { name: 'ID do Pedido', value: `#${deliveryData.orderId}`, inline: true }
            )
            .setColor(config.cores.info)
            .setTimestamp();
        
        try {
            await logChannel.send({ embeds: [embed] });
        } catch (error) {
            console.error('❌ Erro ao enviar log de entrega:', error);
        }
    }
    
    // Lidar com interações
    async handleInteraction(interaction, client) {
        const customId = interaction.customId;
        
        if (customId.startsWith('entrega_concluida_')) {
            const orderId = customId.replace('entrega_concluida_', '');
            await this.markDeliveryComplete(interaction, orderId);
        } else if (customId.startsWith('entrega_problema_')) {
            const orderId = customId.replace('entrega_problema_', '');
            await interaction.reply({
                content: '⚠️ Problema reportado. A equipa irá investigar.',
                ephemeral: true
            });
        }
    }
}

module.exports = new EntregaSystem();