const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const config = require('../config.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('loja')
        .setDescription('Ver produtos disponíveis na loja'),
    
    async execute(interaction, client) {
        const embed = new EmbedBuilder()
            .setTitle('🛒 Produtos Disponíveis')
            .setDescription('Aqui estão todos os nossos produtos:')
            .setColor(config.cores.loja)
            .setTimestamp();
        
        // Adicionar cada produto como field
        config.produtos.forEach(produto => {
            embed.addFields({
                name: `${produto.emoji} ${produto.nome}`,
                value: `**Preço:** ${produto.preco}€\n**Descrição:** ${produto.descricao}`,
                inline: false
            });
        });
        
        embed.addFields({
            name: '💳 Como Comprar',
            value: `Vai ao canal <#${config.channels.loja}> e clica no produto que queres comprar!`,
            inline: false
        });
        
        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};