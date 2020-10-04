new Command({
    title: "Member Role Count",
    desc: "Counts the number of people that have a specific role.",
    call: ['mrc', 'members'],
    onCall: function(parsedArgs, args, message) {
        if (!message.guild) {
            message.channel.msg(`${botInfo.emotes.fail}|You must be on a guild to use this.`);
        }

        if (args[0]) {
            let roles = message.guild.findRoles(args.join(' '));
            if (roles.length == 1) {
                message.channel.msg(`${botInfo.emotes.info}|There ${roles[0].members.size != 1 ? "are" : "is"} **${roles[0].members.size}** member${roles[0].members.size != 1 ? "s" : ""} with the role **${roles[0].name}**.`);
            } else if (roles.length > 1) message.channel.msg(`${botInfo.emotes.fail}|More than one role found for **${args.join(' ')}**.`);
            else message.channel.msg(`${botInfo.emotes.fail}|No roles found for **${args.join(' ')}**.`);
        } else message.channel.msg(`${botInfo.emotes.fail}|You must specify a role.`);
    }
});
