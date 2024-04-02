require('dotenv').config();
const { Client, Intents } = require('discord.js');
const axios = require('axios');

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
});

client.on('ready', () => {
  console.log(`Bot is ready as: ${client.user.tag}`);
  client.user.setActivity('Baki vs Doumbé', {
    type: 'STREAMING',
    url: 'https://www.twitch.tv/'
  });
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  try {
    if (message.content.startsWith('!ban')) {
      if (message.member.permissions.has('BAN_MEMBERS')) {
        const userToBan = message.mentions.users.first();

        if (userToBan) {
          const guildMember = message.guild.members.resolve(userToBan);

          if (guildMember) {
            guildMember.ban().then((member) => {
              message.channel.send(`${member.displayName} a été banni.`);
            }).catch((error) => {
              message.channel.send('Je n\'ai pas pu bannir cet utilisateur.');
            });
          } else {
            message.channel.send('Cet utilisateur n\'est pas un membre de ce serveur.');
          }
        } else {
          message.channel.send('Veuillez mentionner l\'utilisateur que vous voulez bannir.');
        }
      } else {
        message.channel.send('Vous n\'avez pas la permission de bannir des membres.');
      }
    } else if (message.content.startsWith('!pp')) {
      const user = message.mentions.users.first() || message.author;
      message.channel.send(user.displayAvatarURL());
    } else if (message.content === '!servers') {
      let serverList = '';
      client.guilds.cache.forEach((guild) => {
        serverList = serverList.concat(guild.name + "\n");
      });
      message.channel.send('Je suis dans les serveurs suivants :\n' + serverList);
    } else {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            "role": "system",
            "content": "You are a helpful assistant."
          },
          {
            "role": "user",
            "content": message.content
          }
        ]
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      message.reply(response.data.choices[0].message.content.trim());
    }
  } catch (error) {
    if (error.response && error.response.status === 429) {
      console.log('Trop de requêtes vers l\'API OpenAI');
    } else {
      console.error('Erreur :', error);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
