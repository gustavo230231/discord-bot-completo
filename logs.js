const { EmbedBuilder } = require('discord.js');
const config = require('../config.js');

class LogSystem {
    constructor() {
        this.name = 'logs';
    }
    
    init(client) {
        this.client = client;
    }
    
    // Obter canal de logs
    getLogChannel(guild) {
        return guild.channels.cache.get(config.channels.logs);
    }
    
    // Log de membro que entrou
    async logMemberJoin(member) {
        const logChannel = this.getLogChannel(member.guild);
        if (!logChannel) return;
        
        const embed = new EmbedBuilder()
            .setTitle('👋 Membro Entrou')
            .setDescription(`**${member.user.tag}** entrou no servidor`)
            .addFields(
                { name: 'Utilizador', value: member.toString(), inline: true },
                { name: 'ID', value: member.id, inline: true },
                { name: 'Conta criada', value: member.user.createdAt.toLocaleDateString('pt-PT'), inline: true }
            )
            .setColor(config.cores.sucesso)
            .setThumbnail(member.user.displayAvatarURL())
            .setTimestamp();
        
        try {
            await logChannel.send({ embeds: [embed] });
        } catch (error) {
            console.error('❌ Erro ao enviar log:', error);
        }
    }
    
    // Log de membro que saiu
    async logMemberLeave(member) {
        const logChannel = this.getLogChannel(member.guild);
        if (!logChannel) return;
        
        const embed = new EmbedBuilder()
            .setTitle('👋 Membro Saiu')
            .setDescription(`**${member.user.tag}** saiu do servidor`)
            .addFields(
                { name: 'Utilizador', value: member.toString(), inline: true },
                { name: 'ID', value: member.id, inline: true },
                { name: 'Entrou em', value: member.joinedAt?.toLocaleDateString('pt-PT') || 'Desconhecido', inline: true }
            )
            .setColor(config.cores.erro)
            .setThumbnail(member.user.displayAvatarURL())
            .setTimestamp();
        
        try {
            await logChannel.send({ embeds: [embed] });
        } catch (error) {
            console.error('❌ Erro ao enviar log:', error);
        }
    }
    
    // Log de ticket criado
    async logTicketCreated(user, channel, tipo) {
        const logChannel = this.getLogChannel(channel.guild);
        if (!logChannel) return;
        
        const embed = new EmbedBuilder()
            .setTitle('🎫 Ticket Criado')
            .setDescription('Um novo ticket foi aberto')
            .addFields(
                { name: 'Utilizador', value: user.toString(), inline: true },
                { name: 'Categoria', value: tipo, inline: true },
                { name: 'Canal', value: channel.toString(), inline: true },
                { name: 'Hora', value: new Date().toLocaleTimeString('pt-PT'), inline: true }
            )
            .setColor(config.cores.info)
            .setThumbnail(user.displayAvatarURL())
            .setTimestamp();
        
        try {
            await logChannel.send({ embeds: [embed] });
        } catch (error) {
            console.error('❌ Erro ao enviar log:', error);
        }
    }
    
    // Log de ticket fechado
    async logTicketClosed(user, channel, tipo) {
        const logChannel = this.getLogChannel(channel.guild);
        if (!logChannel) return;
        
        const embed = new EmbedBuilder()
            .setTitle('🔒 Ticket Fechado')
            .setDescription('Um ticket foi fechado')
            .addFields(
                { name: 'Fechado por', value: user.toString(), inline: true },
                { name: 'Categoria', value: tipo, inline: true },
                { name: 'Canal', value: channel.name, inline: true },
                { name: 'Hora', value: new Date().toLocaleTimeString('pt-PT'), inline: true }
            )
            .setColor(config.cores.aviso)
            .setThumbnail(user.displayAvatarURL())
            .setTimestamp();
        
        try {
            await logChannel.send({ embeds: [embed] });
        } catch (error) {
            console.error('❌ Erro ao enviar log:', error);
        }
    }
    
    // Log de compra
    async logPurchase(user, produto, preco, metodo, orderId) {
        const logChannel = this.getLogChannel(user.guild || this.client.guilds.cache.first());
        if (!logChannel) return;
        
        const embed = new EmbedBuilder()
            .setTitle('🛒 Nova Compra')
            .setDescription('Uma nova compra foi realizada')
            .addFields(
                { name: 'Cliente', value: user.toString(), inline: true },
                { name: 'Produto', value: produto, inline: true },
                { name: 'Preço', value: `${preco}€`, inline: true },
                { name: 'Método', value: metodo, inline: true },
                { name: 'ID do Pedido', value: orderId, inline: true },
                { name: 'Data', value: new Date().toLocaleDateString('pt-PT'), inline: true }
            )
            .setColor(config.cores.sucesso)
            .setThumbnail(user.displayAvatarURL())
            .setTimestamp();
        
        try {
            await logChannel.send({ embeds: [embed] });
        } catch (error) {
            console.error('❌ Erro ao enviar log:', error);
        }
    }
    
    // Log de moderação
    async logModeration(moderator, target, action, reason, duration = null) {
        const logChannel = this.getLogChannel(moderator.guild);
        if (!logChannel) return;
        
        const embed = new EmbedBuilder()
            .setTitle('🛡️ Ação de Moderação')
            .setDescription(`**${action}** aplicado`)
            .addFields(
                { name: 'Moderador', value: moderator.toString(), inline: true },
                { name: 'Utilizador', value: target.toString(), inline: true },
                { name: 'Ação', value: action, inline: true },
                { name: 'Motivo', value: reason || 'Não especificado', inline: false }
            )
            .setColor(config.cores.aviso)
            .setTimestamp();
        
        if (duration) {
            embed.addFields({ name: 'Duração', value: duration, inline: true });
        }
        
        try {
            await logChannel.send({ embeds: [embed] });
        } catch (error) {
            console.error('❌ Erro ao enviar log:', error);
        }
    }
    
    // Log de mensagem apagada
    async logMessageDelete(message) {
        const logChannel = this.getLogChannel(message.guild);
        if (!logChannel || message.author.bot) return;
        
        const embed = new EmbedBuilder()
            .setTitle('🗑️ Mensagem Apagada')
            .setDescription(`Mensagem de **${message.author.tag}** foi apagada`)
            .addFields(
                { name: 'Autor', value: message.author.toString(), inline: true },
                { name: 'Canal', value: message.channel.toString(), inline: true },
                { name: 'Conteúdo', value: message.content || '*Sem conteúdo de texto*', inline: false }
            )
            .setColor(config.cores.erro)
            .setTimestamp();
        
        try {
            await logChannel.send({ embeds: [embed] });
        } catch (error) {
            console.error('❌ Erro ao enviar log:', error);
        }
    }
}

module.exports = new LogSystem();