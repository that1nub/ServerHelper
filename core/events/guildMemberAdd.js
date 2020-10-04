bot.on('guildMemberAdd', member => {
    let guild = member.guild;

    guild.setupStorage();

    let guildInfo = storage.guilds.get(guild.id);
    let join = guildInfo.plugins.join;
    let logging = guildInfo.plugins.logging;

    if (join.enabled) {
        if (join.send_message) {
            let channel = guild.channels.resolve(join.channel);
            if (channel) {
                let g = guild;
                let a = member.user;
                let m = member;

                channel.msg(join.message.replace(/\$user_count/g, g.memberCount).replace(/\$user_id/g, a.id).replace(/\$user_name/g, m.displayName).replace(/\$user_tag/g, a.tag).replace(/\$user/g, a));
            }
        }

        for (let i = 0; i < join.roles.length; i++) {
            let role = guild.roles.resolve(join.roles[i]);
            if (role) {
                member.roles.add(role).catch(console.log);
            }
        }
    }

    if (logging.enabled) {
        let channel = guild.channels.resolve(logging.join_leave);
        if (channel) {
            let a = member.user;

            let embed = new Discord.MessageEmbed()
                .setColor(0x3eff3e)
                .setAuthor(a.tag, a.displayAvatarURL())
                .setTitle("Member Joined")
                .addField('User:', `${a.tag} (${a.id})`)
                .addField('Joined Discord:', `${a.createdAt} (${formatTime(Date.now() - a.createdTimestamp)} ago).`)
                .setTimestamp();

            channel.msg({embed});
        }
    }
});
