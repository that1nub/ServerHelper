new Command({
    title: "Member Role Count",
    desc: "Counts the number of people that have a specific role.",
    category: "Server Information",
    usage: "<@role>",
    call: ['members', 'mrc'],
    onCall: function(parsedArgs, args, message) {
        if (!message.guild) {
            message.channel.msg(`${botInfo.emotes.fail}|You must be on a guild to use this.`);
        }

        let roles;
        if (args[0]) {
            roles = message.guild.findRoles(args.join(' '));
            
        } else {
            roles = [message.guild.roles.everyone];
        }

        if (roles.length == 1) {
            let role = roles[0];
            message.guild.members.fetch().then(members => {
                let bots = memberC = 0;
                members.forEach((member, id, map) => {
                    if (member.roles.cache.has(role.id)) {
                        if (member.user.bot) {
                            bots++;
                        } else {
                            memberC++;
                        }
                    }
                });

                let embed = new Discord.MessageEmbed()
                    .setColor(role.color || 0x7289da)
                    .setTitle("Member Count")
                    .setDescription(`Counting users with role ${role}.\n👤 users: ${memberC}\n🤖 bots: ${bots}`);

                message.channel.msg({embed});
                // message.channel.msg(`${botInfo.emotes.info}|There ${memberCount != 1 ? "are" : "is"} **${memberCount}** member${memberCount != 1 ? "s" : ""} with the role **${roles[0].name}**.`);
            }).catch(err => {
                if (err) {
                    console.log(err.stack);
                }
                message.channel.msg(`${botInfo.emotes.fail}|Unable to fetch members.`);
            });
        } else if (roles.length > 1) message.channel.msg(`${botInfo.emotes.fail}|More than one role found for **${args.join(' ')}**.`);
        else message.channel.msg(`${botInfo.emotes.fail}|No roles found for **${args.join(' ')}**.`);
    }
});
