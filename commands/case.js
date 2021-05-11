new Command({
    title: "Cases",
    desc: "View a case.",
    category: "Moderation",
    call: ['case'],
    usage: "(case #)",
    onCall: function(parsedArgs, args, message) {
        if (!message.guild) {
            return message.channel.msg(`${botInfo.emotes.fail}|You must be on a guild to use this command.`);
        }

        if (!message.member.verifyMod() && !message.member.permissions.has('ADMINISTRATOR')) {
            return message.channel.msg(`${botInfo.emotes.fail}|You must be a moderator to use this command.`);
        }

        let caseN = Number(args[0]);
        if (Number.isNaN(caseN)) {
            return message.channel.msg(`${botInfo.emotes.fail}|You must specify a case number.`);
        }

        if (!Number.isFinite(caseN)) {
            return message.channel.msg(`${botInfo.emotes.fail}|You must give a finite number 👀.`);
        }

        let cases = storage.guilds.get(message.guild.id).cases;
        let cas = cases[caseN - 1];
        if (!cas) {
            return message.channel.msg(`${botInfo.emotes.fail}|No case exists with this number.`);
        }

        let embed = new Discord.MessageEmbed()
            .setTitle(cas.type)
            .setDescription(cas.info)
            .addField("Reason:", cas.reason)
            .addField("Administered By:", `<@${cas.by}>`)
            .setFooter(`Case #${caseN}`)
            .setTimestamp(cas.on);
        
        switch (cas.type) {
            case "Strike": case "Ban": case "Kick":
                embed.setColor(0xff3e3e);
            break;
            
            case "Pardon": 
                embed.setColor(0x3eff3e);
            break;
            
            case "Purge":
                embed.setColor(0xffff3e);
            break;
        }
                
        let targ = bot.users.resolve(cas.target);
        if (targ) {
            embed.setAuthor(`${targ.tag} (${targ.id})`, targ.displayAvatarURL());
        } else {
            let channel = message.guild.channels.resolve(cas.target);
            if (channel) {
                embed.setAuthor(channel.name);
            } else {
                embed.setAuthor(cas.target);
            }
        }

        message.channel.msg({embed});
    }
});