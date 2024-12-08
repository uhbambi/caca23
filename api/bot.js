// api/bot.js

const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

// Código de tu bot
client.once('ready', () => {
  console.log('¡Bot listo!');
});

client.login(process.env.BOT_TOKEN);

// Vercel requiere una función handler
module.exports = (req, res) => {
  res.status(200).send('Bot is running');
};
