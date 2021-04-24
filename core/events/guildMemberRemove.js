bot.on('guildMemberRemove', member => {
    let guild = member.guild;

    guild.setupStorage();

    let guildInfo = storage.guilds.get(guild.id);
    let leave = guildInfo.plugins.leave;
    let logging = guildInfo.plugins.logging;

    if (leave.enabled) {
        let channel = guild.channels.resolve(leave.channel);
        if (channel) {
            let g = guild;
            let a = member.user;
            let m = member;

            channel.msg(leave.message.replace(/\$user_count/g, g.memberCount).replace(/\$guild_count/g, g.memberCount).replace(/\$user_id/g, a.id).replace(/\$user_name/g, m.displayName).replace(/\$user_tag/g, a.tag).replace(/\$user/g, a).replace(/\$guild/g, g.name));
        }
    }

    if (logging.enabled) {
        let channel = guild.channels.resolve(logging.join_leave);
        if (channel) {
            let a = member.user;
            let m = member;

            let now = Date.now();

            let embed = new Discord.MessageEmbed()
                .setColor(0xff3e3e)
                .setAuthor(a.tag, a.displayAvatarURL())
                .setTitle("Member Left")
                .addField('User:', `${a.tag} (${a.id})`)
                .addField('Joined Discord:', `${a.createdAt} (${formatTime(now - a.createdTimestamp)} ago).`)
                .addField('Joined Guild:', `${m.joinedAt} (${formatTime(now - m.joinedTimestamp)} ago).`)
                .addField(`Highest Role [Had ${m.roles.cache.array().length}]:`, m.roles.highest)
                .setTimestamp();

            channel.msg({embed});
        }
    }
});
