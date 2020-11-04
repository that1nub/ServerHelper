new Command({
    title: "Strike",
    desc: "Strike/Warn a user for innapropriate behavior.",
    call: ['strike', 'warn'],
    usage: "<user> {reason}",
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

        if (!target.kickable) {
            return message.channel.msg(`${botInfo.emotes.fail}|I am unable to punish this person.`); 
        }

        if (message.member.roles.highest.position < target.roles.highest.position) {
            return message.channel.msg(`${botInfo.emotes.fail}|This member is higher than or equal to you.`);
        }

        // The caller should now be authed ( ͡° ͜ʖ ͡°)
        let cfg = storage.guilds.get(message.guild.id);
        let [strikes, cases] = [cfg.strikes, cfg.cases];

        if (!strikes[target.id]) {strikes[target.id] = [];}

        if (parsedArgs.edit) {
            let strikeI = Number(args.shift());
            if (Number.isNaN(strikeI) || !Number.isFinite(strikeI)) {
                return message.channel.msg(`${botInfo.emotes.fail}|You must give a valid index number to edit.`);
            }
            strikeI--;

            let strike = strikes[target.id][strikeI];
            if (!strike) {
                return message.channel.msg(`${botInfo.emotes.fail}|There is no strike with this index.`);
            }
        } else {
            let strike    = copyObject({}, botInfo.def.strike);
            strike.target = target.id;
            strike.by     = message.member.id;
            strike.reason = args.length > 0 ? args.join(' ') : "No reason given.";
            strike.on     = message.createdTimestamp;
            strike.active = true;

            strikes[target.id].push(strike);

            let cas    = copyObject({}, botInfo.def.case);
            cas.type   = "Strike",
            cas.info   = message.author.tag + " gave a strike to " + target.user.tag + ".";
            cas.by     = message.member.id;
            cas.target = target.id;
            cas.reason = strike.reason;
            cas.on     = message.createdTimestamp;

            cases.push(cas);

            let embed = new Discord.MessageEmbed()
                .setColor(0xff3e3e)
                .setAuthor(`${target.user.tag} (${target.id})`, target.user.displayAvatarURL())
                .setTitle(cas.type)
                .setDescription(cas.info)
                .addField("Reason:", cas.reason)
                .addField("Administered By:", `<@${cas.by}>`)
                .setFooter(`Case #${cases.length}`)
                .setTimestamp(cas.on);
            
            message.channel.msg(`${botInfo.emotes.success}|Strike given to **${target.user.tag}**.`, {embed});
            target.user.msg(`${botInfo.emotes.info}|Oh no! You've received a strike on **${message.guild.name}**!`, {embed});
        }

        message.guild.saveStorage();
    }
});