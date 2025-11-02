// 1️⃣ Importuri
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');
const express = require('express');

// 2️⃣ Server pentru Railway (ping keep-alive)
const app = express();
const PORT = process.env.PORT || 3000;
app.get("/", (req, res) => res.send("✅ Bot is running fine!"));
app.listen(PORT, () => console.log(`🌐 Web server started on port ${PORT}`));

// 3️⃣ Creează clientul Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const TOKEN = process.env.DISCORD_BOT_TOKEN;

// 4️⃣ Când botul e online
client.once("ready", () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

// 5️⃣ Funcție pentru format numerelor
function formatNumber(num) {
  try {
    return num.toLocaleString();
  } catch {
    return "0";
  }
}

// 6️⃣ Comenzi: !stats și !daily
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const args = message.content.split(" ");
  const command = args.shift().toLowerCase();

  if (command === "!stats" || command === "!daily") {
    const targetUser = message.mentions.users.first() || message.author;
    const userId = targetUser.id;

    try {
      const res = await fetch(`https://api.injuries.lu/v1/public/user?userId=${userId}`);
      const data = await res.json();

      if (!data.success) {
        message.reply("❌ No stats found for this user.");
        return;
      }

      const info = command === "!daily" ? (data.Daily || data.Normal) : data.Normal;
      const profile = data.Profile || {};

      const hits = info.Totals?.Visits || 0;
      const clicks = info.Totals?.Clicks || 0;
      const summary = info.Totals?.Summary || 0;
      const rap = info.Totals?.Rap || 0;
      const robux = info.Totals?.Balance || 0;

      const userName = profile.userName || targetUser.username;

      const embed = new EmbedBuilder()
        .setColor(0x000000)
        .setTitle(command === "!daily" ? "─── ᴅᴀɪʟʏ ɪɴꜰᴏ ───" : "─── ɴᴏʀᴍᴀʟ ɪɴꜰᴏ ───")
        .setAuthor({ name: `${command === "!daily" ? "Daily Stats" : "Stats"} for ${userName}`, iconURL: targetUser.displayAvatarURL() })
        .setDescription(
          `<:emoji:1433659663160971414> **User:** ${userName}

<:emoji:1433659663160971414> **ᴛᴏᴛᴀʟ ꜱᴛᴀᴛꜱ:**
  ʜɪᴛꜱ:     ${formatNumber(hits)}
  ᴄʟɪᴄᴋꜱ:   ${formatNumber(clicks)}

<:emoji:1433659663160971414> **ꜱᴜᴍᴍᴀʀʏ:**
  ꜱᴜᴍᴍᴀʀʏ:  ${formatNumber(summary)}
  ʀᴀᴘ:      ${formatNumber(rap)}
  ʀᴏʙᴜx:    ${formatNumber(robux)}

<a:anim:1433659816466714624> **Corrupt**`
        )
        .setImage("https://images.steamusercontent.com/ugc/870748399458647939/4E5B352B8FB2C9E9EF63248B8D591288B48F72AB/?imw=5000&imh=5000&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false")
        .setFooter({ text: "Corrupt Bot" });

      await message.channel.send({ embeds: [embed] });

    } catch (error) {
      console.error(error);
      message.reply("❌ Error fetching data from API.");
    }
  }
});

// 7️⃣ Login bot
if (!TOKEN) {
  console.error("❌ DISCORD_BOT_TOKEN is missing in environment variables!");
  process.exit(1);
}

client.login(TOKEN);
