new Command({
    title: "Bot Support Server",
    desc: "Get an invitation to the bot's support Discord",
    category: "Bot Related",
    call: ['invite', 'botsupport', 'discord'],
    onCall: function(parsedArgs, args, message) {
        if (message.guild) {
            message.react('667547836719824931').catch(console.log);
            message.channel.msg(`${botInfo.emotes.info}|You have been DMed with an invitation.`);
        }
        message.author.msg(`${botInfo.emotes.info}|You have requested to join the official support Discord. Here is an invitation:\n${botInfo.information.links.invite}`);
    }
});