const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const config = require('../config.js');

class LojaSystem {
    constructor() {
        this.name = 'loja';
        this.carrinho = new Map();
    }
    
    init(client) {
        this.client = client;
    }
    
    // Criar mensagem da loja
    async createLojaMessage(channel) {
        const embed = new EmbedBuilder()
            .setTitle('🛒 Loja Oficial')
            .setDescription('Bem-vindo à nossa loja!\nEscolhe um produto abaixo para comprar.')
            .setColor(config.cores.loja)
            .setTimestamp();
        
        // Adicionar produtos ao embed
        let produtosText = '';
        config.produtos.forEach(produto => {
            produtosText += `${produto.emoji} **${produto.nome}** — ${produto.preco}€\n${produto.descricao}\n\n`;
        });
        
        embed.addFields({ name: 'Produtos Disponíveis', value: produtosText });
        
        // Criar botões para cada produto
        const rows = [];
        let currentRow = new ActionRowBuilder();
        
        config.produtos.forEach((produto, index) => {
            if (index > 0 && index % 5 === 0) {
                rows.push(currentRow);
                currentRow = new ActionRowBuilder();
            }
            
            currentRow.addComponents(
                new ButtonBuilder()
                    .setCustomId(`comprar_${produto.id}`)
                    .setLabel(`${produto.nome.split(' ').slice(1).join(' ')}`)
                    .setEmoji(produto.emoji)
                    .setStyle(ButtonStyle.Primary)
            );
        });
        
        if (currentRow.components.length > 0) {
            rows.push(currentRow);
        }
        
        return await channel.send({ embeds: [embed], components: rows });
    }
    
    // Mostrar detalhes do produto
    async showProductDetails(interaction, produtoId) {
        const produto = config.produtos.find(p => p.id === produtoId);
        if (!produto) {
            return await interaction.reply({
                content: '❌ Produto não encontrado.',
                ephemeral: true
            });
        }
        
        const embed = new EmbedBuilder()
            .setTitle(`${produto.emoji} ${produto.nome}`)
            .setDescription(produto.descricao)
            .addFields(
                { name: '💰 Preço', value: `${produto.preco}€`, inline: true },
                { name: '📦 Disponibilidade', value: 'Em stock', inline: true }
            )
            .setColor(config.cores.loja)
            .setTimestamp();
        
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`confirmar_compra_${produtoId}`)
                    .setLabel('Confirmar Compra')
                    .setEmoji('✅')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('loja_voltar')
                    .setLabel('Voltar à Loja')
                    .setEmoji('🔙')
                    .setStyle(ButtonStyle.Secondary)
            );
        
        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    }
    
    // Confirmar compra
    async confirmPurchase(interaction, produtoId) {
        const produto = config.produtos.find(p => p.id === produtoId);
        if (!produto) {
            return await interaction.reply({
                content: '❌ Produto não encontrado.',
                ephemeral: true
            });
        }
        
        // Gerar ID único para o pedido
        const orderId = Math.floor(Math.random() * 100000);
        
        // Guardar no carrinho
        this.carrinho.set(interaction.user.id, {
            produto: produto,
            orderId: orderId,
            timestamp: new Date()
        });
        
        const embed = new EmbedBuilder()
            .setTitle('💳 Pagamento')
            .setDescription('Estás prestes a comprar:')
            .addFields(
                { name: 'Produto', value: `${produto.emoji} ${produto.nome}`, inline: true },
                { name: 'Preço', value: `${produto.preco}€`, inline: true },
                { name: 'ID do Pedido', value: `#${orderId}`, inline: true }
            )
            .setColor(config.cores.info)
            .setFooter({ text: 'Escolhe um método de pagamento:' })
            .setTimestamp();
        
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`pagamento_paypal_${orderId}`)
                    .setLabel('PayPal')
                    .setEmoji('💳')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId(`pagamento_mbway_${orderId}`)
                    .setLabel('MBWay')
                    .setEmoji('📱')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`pagamento_crypto_${orderId}`)
                    .setLabel('Crypto')
                    .setEmoji('💰')
                    .setStyle(ButtonStyle.Secondary)
            );
        
        await interaction.update({ embeds: [embed], components: [row] });
    }
    
    // Processar pagamento
    async processPayment(interaction, metodo, orderId) {
        const carrinhoItem = this.carrinho.get(interaction.user.id);
        if (!carrinhoItem || carrinhoItem.orderId != orderId) {
            return await interaction.reply({
                content: '❌ Pedido não encontrado ou expirado.',
                ephemeral: true
            });
        }
        
        const produto = carrinhoItem.produto;
        let paymentInfo = '';
        
        switch (metodo) {
            case 'paypal':
                paymentInfo = `💳 **PayPal**\nEmail: ${config.pagamentos.paypal}\nValor: ${produto.preco}€\nReferência: #${orderId}`;
                break;
            case 'mbway':
                paymentInfo = `📱 **MBWay**\nNúmero: ${config.pagamentos.mbway}\nValor: ${produto.preco}€\nReferência: #${orderId}`;
                break;
            case 'crypto':
                paymentInfo = `💰 **Cryptocurrency**\nEndereço: ${config.pagamentos.crypto}\nValor: ${produto.preco}€ (equivalente)\nReferência: #${orderId}`;
                break;
        }
        
        const embed = new EmbedBuilder()
            .setTitle('💳 Informações de Pagamento')
            .setDescription(`${paymentInfo}\n\n⚠️ **Importante:**\n• Inclui sempre a referência #${orderId}\n• Após o pagamento, envia comprovativo para a equipa\n• O produto será entregue após confirmação`)
            .addFields(
                { name: 'Produto', value: `${produto.emoji} ${produto.nome}`, inline: true },
                { name: 'Preço', value: `${produto.preco}€`, inline: true },
                { name: 'Método', value: metodo.toUpperCase(), inline: true }
            )
            .setColor(config.cores.sucesso)
            .setTimestamp();
        
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`pagamento_confirmado_${orderId}`)
                    .setLabel('Pagamento Efetuado')
                    .setEmoji('✅')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`abrir_ticket_pagamento_${orderId}`)
                    .setLabel('Abrir Ticket')
                    .setEmoji('🎫')
                    .setStyle(ButtonStyle.Primary)
            );
        
        await interaction.update({ embeds: [embed], components: [row] });
        
        // Enviar recibo para canal de recibos
        await this.sendReceipt(interaction.user, produto, metodo, orderId);
    }
    
    // Enviar recibo
    async sendReceipt(user, produto, metodo, orderId) {
        const guild = this.client.guilds.cache.first();
        const reciboChannel = guild.channels.cache.get(config.channels.recibos);
        
        if (!reciboChannel) return;
        
        const embed = new EmbedBuilder()
            .setTitle('🧾 Recibo de Compra')
            .setDescription('**Pagamento Pendente de Confirmação**')
            .addFields(
                { name: 'Cliente', value: user.toString(), inline: true },
                { name: 'Produto', value: `${produto.emoji} ${produto.nome}`, inline: true },
                { name: 'Preço', value: `${produto.preco}€`, inline: true },
                { name: 'Método', value: metodo.toUpperCase(), inline: true },
                { name: 'ID do Pedido', value: `#${orderId}`, inline: true },
                { name: 'Data', value: new Date().toLocaleDateString('pt-PT'), inline: true }
            )
            .setColor(config.cores.aviso)
            .setThumbnail(user.displayAvatarURL())
            .setTimestamp();
        
        try {
            await reciboChannel.send({ embeds: [embed] });
        } catch (error) {
            console.error('❌ Erro ao enviar recibo:', error);
        }
    }
    
    // Confirmar pagamento (para staff)
    async confirmPayment(interaction, orderId) {
        const carrinhoItem = Array.from(this.carrinho.values()).find(item => item.orderId == orderId);
        if (!carrinhoItem) {
            return await interaction.reply({
                content: '❌ Pedido não encontrado.',
                ephemeral: true
            });
        }
        
        // Log da compra
        const logsSystem = this.client.systems.get('logs');
        if (logsSystem) {
            await logsSystem.logPurchase(
                interaction.user,
                carrinhoItem.produto.nome,
                carrinhoItem.produto.preco,
                'Confirmado',
                orderId
            );
        }
        
        await interaction.reply({
            content: `✅ Pagamento #${orderId} confirmado com sucesso!`,
            ephemeral: true
        });
    }
    
    // Lidar com interações
    async handleInteraction(interaction, client) {
        const customId = interaction.customId;
        
        if (customId.startsWith('comprar_')) {
            const produtoId = customId.replace('comprar_', '');
            await this.showProductDetails(interaction, produtoId);
        } else if (customId.startsWith('confirmar_compra_')) {
            const produtoId = customId.replace('confirmar_compra_', '');
            await this.confirmPurchase(interaction, produtoId);
        } else if (customId.startsWith('pagamento_')) {
            const parts = customId.split('_');
            const metodo = parts[1];
            const orderId = parts[2];
            await this.processPayment(interaction, metodo, orderId);
        } else if (customId === 'loja_voltar') {
            await interaction.update({
                content: '🔙 Voltaste à loja principal.',
                embeds: [],
                components: []
            });
        }
    }
}

module.exports = new LojaSystem();