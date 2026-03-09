const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config.js');

// Criar cliente do bot
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildModeration
    ]
});

// Collections para comandos e sistemas
client.commands = new Collection();
client.systems = new Collection();

// Carregar comandos
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        client.commands.set(command.data.name, command);
    }
}

// Carregar sistemas
const systemsPath = path.join(__dirname, 'systems');
if (fs.existsSync(systemsPath)) {
    const systemFiles = fs.readdirSync(systemsPath).filter(file => file.endsWith('.js'));
    
    for (const file of systemFiles) {
        const filePath = path.join(systemsPath, file);
        const system = require(filePath);
        client.systems.set(system.name, system);
        if (system.init) system.init(client);
    }
}

// Carregar eventos
const eventsPath = path.join(__dirname, 'events');
if (fs.existsSync(eventsPath)) {
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
    
    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);
        
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client));
        } else {
            client.on(event.name, (...args) => event.execute(...args, client));
        }
    }
}

// Evento quando o bot fica online
client.once('ready', () => {
    console.log(`✅ Bot ${client.user.tag} está online!`);
    console.log(`📊 Conectado a ${client.guilds.cache.size} servidor(es)`);
    console.log(`👥 Servindo ${client.users.cache.size} utilizadores`);
    
    // Definir status do bot
    client.user.setActivity('🛒 Loja Online | /ajuda', { type: 'WATCHING' });
});

// Login do bot
client.login(config.token).catch(console.error);

module.exports = client;