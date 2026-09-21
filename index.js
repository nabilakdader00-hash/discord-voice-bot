const { Client, GatewayIntentBits } = require("discord.js");
const {
  joinVoiceChannel,
  VoiceConnectionStatus,
  entersState
} = require("@discordjs/voice");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates
  ]
});

async function connectToVoice() {
  try {
    const guild = await client.guilds.fetch(process.env.GUILD_ID);
    const channel = await guild.channels.fetch(process.env.VOICE_CHANNEL_ID);

    if (!channel || channel.type !== 2) {
      console.log("Voice channel not found.");
      return;
    }

    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: guild.id,
      adapterCreator: guild.voiceAdapterCreator,
      selfDeaf: true,
      selfMute: true
    });

    console.log(`Connected to: ${channel.name}`);

    connection.on(VoiceConnectionStatus.Disconnected, async () => {
      try {
        await entersState(connection, VoiceConnectionStatus.Ready, 5000);
      } catch {
        connection.destroy();
        setTimeout(connectToVoice, 3000);
      }
    });

  } catch (error) {
    console.error(error);
    setTimeout(connectToVoice, 10000);
  }
}

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
  connectToVoice();
});

client.login(process.env.DISCORD_TOKEN);
