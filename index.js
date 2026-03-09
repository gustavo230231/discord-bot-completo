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

console.log('🔄 Carregando comandos...');

// Carregar comandos
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        try {
            const command = require(filePath);
            if (command.data && command.execute) {
                client.commands.set(command.data.name, command);
                console.log(`✅ Comando carregado: ${command.data.name}`);
            } else {
                console.log(`⚠️ Comando ${file} não tem data ou execute`);
            }
        } catch (error) {
            console.error(`❌ Erro ao carregar comando ${file}:`, error);
        }
    }
} else {
    console.log('⚠️ Pasta commands não encontrada');
}

console.log('🔄 Carregando sistemas...');

// Carregar sistemas
const systemsPath = path.join(__dirname, 'systems');
if (fs.existsSync(systemsPath)) {
    const systemFiles = fs.readdirSync(systemsPath).filter(file => file.endsWith('.js'));
    
    for (const file of systemFiles) {
        const filePath = path.join(systemsPath, file);
        try {
            const system = require(filePath);
            if (system.name) {
                client.systems.set(system.name, system);
                if (system.init) system.init(client);
                console.log(`✅ Sistema carregado: ${system.name}`);
            } else {
                console.log(`⚠️ Sistema ${file} não tem nome`);
            }
        } catch (error) {
            console.error(`❌ Erro ao carregar sistema ${file}:`, error);
        }
    }
} else {
    console.log('⚠️ Pasta systems não encontrada');
}

console.log('� Carregando eventos...');

// Carregar eventos
const eventsPath = path.join(__dirname, 'events');
if (fs.existsSync(eventsPath)) {
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
    
    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        try {
            const event = require(filePath);
            if (event.name && event.execute) {
                if (event.once) {
                    client.once(event.name, (...args) => event.execute(...args, client));
                } else {
                    client.on(event.name, (...args) => event.execute(...args, client));
                }
                console.log(`✅ Evento carregado: ${event.name}`);
            } else {
                console.log(`⚠️ Evento ${file} não tem name ou execute`);
            }
        } catch (error) {
            console.error(`❌ Erro ao carregar evento ${file}:`, error);
        }
    }
} else {
    console.log('⚠️ Pasta events não encontrada');
}

// Evento quando o bot fica online
client.once('ready', () => {
    console.log(`✅ Bot ${client.user.tag} está online!`);
    console.log(`📊 Conectado a ${client.guilds.cache.size} servidor(es)`);
    console.log(`👥 Servindo ${client.users.cache.size} utilizadores`);
    console.log(`🎮 Comandos carregados: ${client.commands.size}`);
});

// Login do bot
console.log('🔄 Fazendo login...');
client.login(config.token).catch(error => {
    console.error('❌ Erro no login:', error);
    process.exit(1);
});

module.exports = client;
