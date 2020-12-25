new Command({
    title: "Pardon",
    desc: "Set a strike/warning inactive.",
    category: "Moderation",
    call: ['pardon'],
    usage: "<user> (strike #) {reason}",
    onCall: function(parsedArgs, args, message) {
        if (!message.guild) {
            return message.channel.msg(`${botInfo.emotes.fail}|You must be on a guild to use this command.`);
        }

        if (!message.member.verifyMod() && !message.member.permissions.has('ADMINISTRATOR')) {
            return message.channel.msg(`${botInfo.emotes.fail}|You must be a moderator to use this command.`);
        }

        let target = findUser(args.shift(), message.guild);
        if (target.length == 1) {
            target = target[0].member;
        } else if (target.length > 1) {
            return message.channel.msg(`${botInfo.emotes.fail}|Too many targets were found.`);
        } else {
            return message.channel.msg(`${botInfo.emotes.fail}|No targets were found.`);
        }

        let cfg = storage.guilds.get(message.guild.id);
        let strikes = cfg.strikes[target.id];

        let active = 0;
        if (strikes) {
            for (let strike of strikes) {
                if (strike.active) active++;
            }
        }

        if (!strikes || active == 0) {
            return message.channel.msg(`${botInfo.emotes.fail}|This user has no strikes to pardon.`);
        }
        
        let caseN = Number(args[0]);
        if (Number.isNaN(caseN)) {
            // Default to the most recent active strike
            if (strikes) {
                for (let i = strikes.length; i >= 0; i--) {
                    if (strikes[i]) {
                        if (strikes[i].active) {
                            caseN = i;
                            break;
                        }
                    }
                }
            }
        } else {
            caseN--;
            args.shift();
        }
        
        if (!Number.isFinite(caseN)) {
            return message.channel.msg(`${botInfo.emotes.fail}|You must give a finite number 👀.`);
        }

        if (!strikes[caseN].active) {
            return message.channel.msg(`${botInfo.emotes.fail}|The strike you specified is no longer active.`);
        }

        strikes[caseN].active = false;
        strikes[caseN].expired = message.createdTimestamp;

        let cas    = copyObject({}, botInfo.def.case);
        cas.type   = "Pardon",
        cas.info   = message.author.tag + " pardoned " + target.user.tag + ".";
        cas.by     = message.member.id;
        cas.target = target.id;
        cas.reason = args.length > 0 ? args.join(' ') : "No reason given.";
        cas.on     = message.createdTimestamp;

        cfg.cases.push(cas);

        let embed = new Discord.MessageEmbed()
            .setColor(0x3eff3e)
            .setAuthor(`${target.user.tag} (${target.id})`, target.user.displayAvatarURL())
            .setTitle(cas.type)
            .setDescription(cas.info)
            .addField("Reason:", cas.reason)
            .addField("Administered By:", `<@${cas.by}>`)
            .setFooter(`Case #${cfg.cases.length}`)
            .setTimestamp(cas.on);

        message.channel.msg(`${botInfo.emotes.success}|**${target.user.tag}** has been pardoned from **${strikes[caseN].reason}**`, {embed});
        target.user.msg(`${botInfo.emotes.info}|You've received a pardon on **${message.guild.name}**!\nYour offense that was pardoned: **${strikes[caseN].reason}**`, {embed});

        message.guild.saveStorage();
    }
});