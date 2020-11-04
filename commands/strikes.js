let pageCount = 5;

new Command({
    title: "Strikes",
    desc: "View the strikes of a user.",
    call: ['strikes', 'warns'],
    usage: "<user> (page #)",
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

        let page = Number(args.shift());
        if (Number.isNaN(page)) page = 1;
        else if (!Number.isFinite(page)) {
            return message.channel.msg(`${botInfo.emotes.fail}|You must give a finite number 👀.`);
        }

        page--;
        if (page < 0) page = 0;

        let cfg = storage.guilds.get(message.guild.id);

        if (!cfg.strikes[target.id]) {
            let embed = new Discord.MessageEmbed()
                .setColor(0x3eff3e)
                .setAuthor(target.user.tag, target.user.displayAvatarURL())
                .setTitle("Strikes")
                .setDescription("🧽 This user is clean, no strikes found 🧽");
            return message.channel.msg({embed});
        } else {
            let strikes = cfg.strikes[target.id];
            let pages = Math.ceil(strikes.length/pageCount);
            if (page > pages - 1) page = pages - 1;

            let active = total = 0;
            for (let strike of strikes) {
                total++;
                if (strike.active) {
                    active++;
                }
            }

            let embed = new Discord.MessageEmbed()
                .setColor(active > 0 ? 0xff3e3e : 0x3eff3e)
                .setAuthor(target.user.tag, target.user.displayAvatarURL())
                .setTitle(`Strikes page ${page + 1} of ${pages}`)
                .setDescription(`**${active}** of **${total}** strikes are active.`);

            let added = 0;
            let start = page * pageCount;
            for (let i = start; i < start + pageCount; i++) {
                if (added >= pageCount) break;
                added++;

                let strike = strikes[i];
                if (strike) {
                    let desc = `${strike.reason}\nGiven by: <@${strike.by}>\n` + 
                    `Active: ${strike.active ? botInfo.emotes.success : botInfo.emotes.fail}` + 
                    `${strike.active ? `\nExpires in: ${formatTime(strike.on + cfg.plugins.auto_moderation.pardon.time - message.createdTimestamp)}` : ""}`;

                    embed.addField(`Strike #${i + 1}`, desc);
                } else {
                    break;
                }
            }

            return message.channel.msg({embed});
        }
    }
});