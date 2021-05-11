bot.on('messageDelete', async message => {
    if (react[message.id]) { // Delete any react listeners on this message
        delete react[message.id];
    }

    try {
        //return message.channel.msg(`\`\`\`json\n${JSON.stringify(message, null, 2)}\`\`\``);

        // Below is message deletion logging, but we don't want to log bot messages
        if (message.author.bot) return;

        // message deletion logging
        if (message.guild) {
            let config = storage.guilds.get(message.guild.id);
            if (config) {
                let logging = config.plugins.logging;
                if (logging.enabled) {
                    let channel = message.guild.channels.resolve(logging.messages);
                    if (channel) {
                        let embed = new Discord.MessageEmbed()
                            .setColor(0xff3e3e)
                            .setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL())
                            .setTitle('Message Deleted')
                            .setDescription((message.content != "") ? removeFormatting(message.content).substring(0, 768) : 'Empty message, however it contained attachments.')
                            .setFooter(`#${message.channel.name}`)
                            .setTimestamp();
                        channel.msg({embed});
                    }
                }
            }
        }
    } catch (err) {
        message.channel.msg(`\`\`\`\n${err.stack}\`\`\``);
    }
});