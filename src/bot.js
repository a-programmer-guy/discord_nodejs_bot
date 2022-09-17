const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();

const token = process.env.VANGOGH_BOT_TOKEN;

const { Client, Collection, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

// Create a new collection for commands
client.commands = new Collection();
// Build the path to the commands directory
const commandsPath = path.join(__dirname, 'commands');

// Read contents of the commands directory, filter to get files that end in .js
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((filer) => filer.endsWith('.js'));

// Loop through files in the commands folder
// Add each file to the collection by with the set() function
// Use the command name as the key and the value will be the exported module
for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  client.commands.set(command.data.name, command);
}

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: 'Uh oh! Something when wrong executing this command!',
      ephemeral: true,
    });
  }
});

client.once('ready', () => {
  console.log('VanGogh Bot Has Awaken!');
});

client.login(token);
