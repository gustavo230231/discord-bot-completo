const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const config = require('../config.js');

class PagamentoSystem {
    constructor() {
        this.name = 'pagamentos';
        this.pendingPayments = new Map();
    }
    
    init(client) {
        this.client = client;
    }
    
    // Criar pedido de pagamento
    async createPaymentRequest(user, produto, metodo, orderId) {
        const paymentData = {
            user: user,
            produto: produto,
            metodo: metodo,
            orderId: orderId,
            status: 'pendente',
            createdAt: new Date()
        };
        
        this.pendingPayments.set(orderId, paymentData);
        
        // Enviar informações de pagamento
        await this.sendPaymentInfo(user, produto, metodo, orderId);
        
        return paymentData;
    }
    
    // Enviar informações de pagamento
    async sendPaymentInfo(user, produto, metodo, orderId) {
        let paymentDetails = '';
        let instructions = '';
        
        switch (metodo) {
            case 'paypal':
                paymentDetails = `💳 **PayPal**\n📧 Email: \`${config.pagamentos.paypal}\`\n💰 Valor: \`${produto.preco}€\`\n🔖 Referência: \`#${orderId}\``;
                instructions = '1. Acede ao PayPal\n2. Envia o dinheiro para o email indicado\n3. Inclui a referência na descrição\n4. Envia o comprovativo aqui';
                break;
            case 'mbway':
                paymentDetails = `📱 **MBWay**\n📞 Número: \`${config.pagamentos.mbway}\`\n💰 Valor: \`${produto.preco}€\`\n🔖 Referência: \`#${orderId}\``;
                instructions = '1. Abre a app MBWay\n2. Escolhe "Enviar Dinheiro"\n3. Usa o número indicado\n4. Inclui a referência\n5. Envia o comprovativo aqui';
                break;
            case 'crypto':
                paymentDetails = `💰 **Cryptocurrency**\n🏦 Endereço: \`${config.pagamentos.crypto}\`\n💰 Valor: \`${produto.preco}€ (equivalente)\`\n🔖 Referência: \`#${orderId}\``;
                instructions = '1. Calcula o valor equivalente em crypto\n2. Envia para o endereço indicado\n3. Inclui a referência se possível\n4. Envia o hash da transação aqui';
                break;
        }
        
        const embed = new EmbedBuilder()
            .setTitle('💳 Informações de Pagamento')
            .setDescription(paymentDetails)
            .addFields(
                { name: '📋 Instruções', value: instructions, inline: false },
                { name: '⚠️ Importante', value: '• Inclui sempre a referência\n• Guarda o comprovativo\n• O produto será entregue após confirmação', inline: false }
            )
            .setColor(config.cores.info)
            .setFooter({ text: `ID do Pedido: #${orderId}` })
            .setTimestamp();
        
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`pagamento_enviado_${orderId}`)
                    .setLabel('Pagamento Enviado')
                    .setEmoji('✅')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`pagamento_ajuda_${orderId}`)
                    .setLabel('Preciso de Ajuda')
                    .setEmoji('❓')
                    .setStyle(ButtonStyle.Secondary)
            );
        
        try {
            await user.send({ embeds: [embed], components: [row] });
        } catch (error) {
            console.error('❌ Erro ao enviar DM:', error);
            // Se não conseguir enviar DM, envia no canal de recibos
            const guild = this.client.guilds.cache.first();
            const channel = guild.channels.cache.get(config.channels.recibos);
            if (channel) {
                await channel.send({ content: `${user} - Não foi possível enviar DM, aqui estão as informações:`, embeds: [embed], components: [row] });
            }
        }
    }
    
    // Confirmar pagamento enviado
    async confirmPaymentSent(interaction, orderId) {
        const paymentData = this.pendingPayments.get(orderId);
        if (!paymentData) {
            return await interaction.reply({
                content: '❌ Pedido não encontrado.',
                ephemeral: true
            });
        }
        
        // Atualizar status
        paymentData.status = 'comprovativo_enviado';
        paymentData.confirmedAt = new Date();
        
        const embed = new EmbedBuilder()
            .setTitle('✅ Pagamento Registado')
            .setDescription('O teu pagamento foi registado!\nA nossa equipa irá verificar e confirmar o mais rápido possível.')
            .addFields(
                { name: 'Próximos Passos', value: '1. A equipa verifica o pagamento\n2. Recebes confirmação\n3. O produto é entregue', inline: false },
                { name: 'Tempo Estimado', value: 'Até 24 horas (normalmente muito mais rápido)', inline: false }
            )
            .setColor(config.cores.sucesso)
            .setTimestamp();
        
        await interaction.update({ embeds: [embed], components: [] });
        
        // Notificar staff
        await this.notifyStaff(paymentData);
    }
    
    // Notificar staff sobre pagamento
    async notifyStaff(paymentData) {
        const guild = this.client.guilds.cache.first();
        const staffChannel = guild.channels.cache.get(config.channels.logs);
        
        if (!staffChannel) return;
        
        const embed = new EmbedBuilder()
            .setTitle('💰 Novo Pagamento para Verificar')
            .setDescription('Um cliente enviou comprovativo de pagamento')
            .addFields(
                { name: 'Cliente', value: paymentData.user.toString(), inline: true },
                { name: 'Produto', value: `${paymentData.produto.emoji} ${paymentData.produto.nome}`, inline: true },
                { name: 'Valor', value: `${paymentData.produto.preco}€`, inline: true },
                { name: 'Método', value: paymentData.metodo.toUpperCase(), inline: true },
                { name: 'ID do Pedido', value: `#${paymentData.orderId}`, inline: true },
                { name: 'Status', value: paymentData.status, inline: true }
            )
            .setColor(config.cores.aviso)
            .setTimestamp();
        
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`staff_confirmar_${paymentData.orderId}`)
                    .setLabel('Confirmar Pagamento')
                    .setEmoji('✅')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`staff_rejeitar_${paymentData.orderId}`)
                    .setLabel('Rejeitar')
                    .setEmoji('❌')
                    .setStyle(ButtonStyle.Danger)
            );
        
        try {
            await staffChannel.send({ embeds: [embed], components: [row] });
        } catch (error) {
            console.error('❌ Erro ao notificar staff:', error);
        }
    }
    
    // Staff confirmar pagamento
    async staffConfirmPayment(interaction, orderId) {
        const paymentData = this.pendingPayments.get(orderId);
        if (!paymentData) {
            return await interaction.reply({
                content: '❌ Pedido não encontrado.',
                ephemeral: true
            });
        }
        
        // Atualizar status
        paymentData.status = 'confirmado';
        paymentData.confirmedBy = interaction.user;
        paymentData.finalizedAt = new Date();
        
        // Notificar cliente
        const embed = new EmbedBuilder()
            .setTitle('🎉 Pagamento Confirmado!')
            .setDescription('O teu pagamento foi confirmado com sucesso!')
            .addFields(
                { name: 'Produto', value: `${paymentData.produto.emoji} ${paymentData.produto.nome}`, inline: true },
                { name: 'Valor', value: `${paymentData.produto.preco}€`, inline: true },
                { name: 'ID do Pedido', value: `#${paymentData.orderId}`, inline: true }
            )
            .setColor(config.cores.sucesso)
            .setFooter({ text: 'Obrigado pela tua compra! ❤️' })
            .setTimestamp();
        
        try {
            await paymentData.user.send({ embeds: [embed] });
        } catch (error) {
            console.error('❌ Erro ao enviar confirmação:', error);
        }
        
        // Processar entrega
        await this.processDelivery(paymentData);
        
        // Atualizar mensagem do staff
        const staffEmbed = new EmbedBuilder()
            .setTitle('✅ Pagamento Confirmado')
            .setDescription(`Pagamento #${orderId} foi confirmado por ${interaction.user}`)
            .setColor(config.cores.sucesso)
            .setTimestamp();
        
        await interaction.update({ embeds: [staffEmbed], components: [] });
        
        // Log da confirmação
        const logsSystem = this.client.systems.get('logs');
        if (logsSystem) {
            await logsSystem.logPurchase(
                paymentData.user,
                paymentData.produto.nome,
                paymentData.produto.preco,
                paymentData.metodo,
                paymentData.orderId
            );
        }
    }
    
    // Processar entrega
    async processDelivery(paymentData) {
        const deliverySystem = this.client.systems.get('entrega');
        if (deliverySystem) {
            await deliverySystem.processDelivery(paymentData);
        } else {
            // Criar ticket de entrega se não houver sistema de entrega
            const ticketSystem = this.client.systems.get('tickets');
            if (ticketSystem) {
                // Lógica para criar ticket de entrega
                console.log(`📦 Criar ticket de entrega para pedido #${paymentData.orderId}`);
            }
        }
    }
    
    // Lidar com interações
    async handleInteraction(interaction, client) {
        const customId = interaction.customId;
        
        if (customId.startsWith('pagamento_enviado_')) {
            const orderId = customId.replace('pagamento_enviado_', '');
            await this.confirmPaymentSent(interaction, orderId);
        } else if (customId.startsWith('pagamento_ajuda_')) {
            const orderId = customId.replace('pagamento_ajuda_', '');
            // Abrir ticket de ajuda
            const ticketSystem = client.systems.get('tickets');
            if (ticketSystem) {
                await ticketSystem.createTicket(interaction, '💰 Ajuda com Pagamento');
            }
        } else if (customId.startsWith('staff_confirmar_')) {
            const orderId = customId.replace('staff_confirmar_', '');
            await this.staffConfirmPayment(interaction, orderId);
        } else if (customId.startsWith('staff_rejeitar_')) {
            const orderId = customId.replace('staff_rejeitar_', '');
            // Lógica para rejeitar pagamento
            await interaction.reply({
                content: `❌ Pagamento #${orderId} rejeitado.`,
                ephemeral: true
            });
        }
    }
}

module.exports = new PagamentoSystem();