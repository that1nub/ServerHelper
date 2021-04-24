new Command({
    title: "Who Is",
    desc: "Displays information regarding a user, if they are found.",
    category: "User Information",
    usage: "<@member>",
    call: ['whois', 'member'],
    onCall: async function(parsedArgs, args, message) {
        let member;
        if (args.length > 0) {
            let members = await message.guild.findMembers(args[0]);
            if (members.length === 1) member = members[0];
            else if (members.length > 1) return message.channel.msg(`${botInfo.emotes.fail}|Too many members found, please be more specific.`);
            else return message.channel.msg(`${botInfo.emotes.fail}|No members found on this guild, please be less specific.`);
        } else {
            member = message.member;
        }

        let roles = [];
        member.roles.cache.forEach((role, id, map) => {
            if (role.position !== 0) {
                roles.push(role);
            }
        });
        roles.sort(function(a, b) {return b.position - a.position});

        let permissions = [];
        let perms = member.permissions;
        if (perms.has('ADMINISTRATOR')) permissions.push("Administrator; has all permissions");
        else {
            if (perms.has('KICK_MEMBERS'))        permissions.push('Kick Members');
            if (perms.has('BAN_MEMBERS'))         permissions.push('Ban Members');
            if (perms.has('MUTE_MEMBERS'))        permissions.push('Mute Members (Voice)');
            if (perms.has('DEAFEN_MEMBERS'))      permissions.push('Deafen Members (Voice)');
            if (perms.has('MOVE_MEMBERS'))        permissions.push('Move Members (Voice)');
            if (perms.has('MANAGE_GUILD'))        permissions.push('Manage Guild');
            if (perms.has('MANAGE_CHANNELS'))     permissions.push('Manage Channels');
            if (perms.has('MANAGE_MESSAGES'))     permissions.push('Manage Messages');
            if (perms.has('MANAGE_ROLES'))        permissions.push('Manage Roles');
            if (perms.has('MANAGE_NICKNAMES'))    permissions.push('Manage Nicknames');
            if (perms.has('MANAGE_WEBHOOKS'))     permissions.push('Manage Webhooks');
            if (perms.has('MANAGE_EMOJIS'))       permissions.push('Manage Emojis');
            if (perms.has('VIEW_AUDIT_LOG'))      permissions.push('View Audit Log');
            if (perms.has('VIEW_GUILD_INSIGHTS')) permissions.push('View Guild Insights');
            if (perms.has('MENTION_EVERYONE'))    permissions.push('Mention @everyone and all roles');
        }

        // let joined  = formatTime(message.createdTimestamp - member.joinedTimestamp, true);
        // let created = formatTime(message.createdTimestamp - member.user.createdTimestamp, true);

        // let joinStr = [];
        // if (joined.months > 0) joinStr.push(`**${joined.months}** month${joined.months !== 1 ? 's' : ''}`);
        // if (joined.days > 0) {
        //     let d = Math.floor(joined.days - joined.months * 30.436875);
        //     joinStr.push(`**${d}** day${d !== 1 ? 's' : ''}`);
        // }

        // let messageCreated = message.createdAt;
        // let joined = member.joinedAt;
        
        // let difYear = messageCreated.getFullYear() - joined.getFullYear();
        // let difMon  = messageCreated.getMonth()    - joined.getMonth();
        // let difDate = messageCreated.getDate()     - joined.getDate();

        // if (difMon < 0 && difYear > 0) {
        //     difYear--;
        //     difMon += 12;
        // }

        // if (difDate < 0 && difMon > 0) {
        //     difMon--;
        //     difDate += joined.setMonth(joined.getMonth() + 1).setDate(-1).getDate();
            
        //     if (difMon < 0 && difYear > 0) {
        //         difYear--;
        //         difMon += 12;
        //     }
        // }

        // let joinStr = [];
        // if (difYear > 0) joinStr.push(`**${difYear}** year${difYear !== 1 ? 's' : ''}`);
        // if (difMon > 0) joinStr.push(`**${difMon}** month${difMon !== 1 ? 's' : ''}`);
        // if (difDate > 0) joinStr.push(`**${difDate}** day${difDate !== 1 ? 's' : ''}`);
        
        let embed = new Discord.MessageEmbed()
            .setColor(member.displayColor || 0x7289da)
            .setDescription(`**${member.user.tag}** (${member})`)
            .setThumbnail(member.user.displayAvatarURL({dynamic: true}))
            .addField('Joined Guild:', `${member.joinedAt}\n${formatTime(message.createdTimestamp - member.joinedTimestamp)} ago.`)
            .addField('Profile Created:', `${member.user.createdAt}\n${formatTime(message.createdTimestamp - member.user.createdTimestamp)} ago.`)
            .addField(`Roles [${member.roles.cache.size - 1}]`, `${roles.join('')}`)
            .setFooter(`User ID: ${member.user.id}`);
        if (permissions.length > 0) {
            embed.addField("Moderator Permissions:", permissions.join(', '));
        }
        message.channel.msg({embed});
    }
});