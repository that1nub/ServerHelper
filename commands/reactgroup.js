new Command({
    title: "React Group",
    desc: "Starts the setup of a react for role system.",
    call: ['rg', 'reactgroup'],
    onCall: function(parsedArgs, args, message) {
        if (!message.guild) {
            message.channel.msg(`${botInfo.emotes.fail}|You must be on a guild to use this.`);
            return;
        }

        if (!message.member.permissions.has('ADMINISTRATOR') && !botInfo.developers.includes(message.author.id)) {
            message.channel.msg(`${botInfo.emotes.fail}|You must be an administrator to use this.`);
            return;
        }

        let rg = storage.guilds.get(message.guild.id).plugins.reactGroups;
        let keys = Object.keys(rg);

        let found = [];
        for (let i = 0; i < keys.length; i++) {
            if (keys[i].toLowerCase().includes(args.join(' '))) {
                found.push(keys[i]);
            }
        }

        if (found.length == 1) {
            found = found[0];
            let r = rg[found];

            if (r.length == 0) {
                message.channel.msg(`${botInfo.emotes.fail}|No roles exist in this react group.`);
                return;
            }

            for (let i = r.length; i >= 0; i--) {
                if (!r[i]) continue;
                if (!message.guild.roles.resolve(r[i])) {
                    r.splice(i, 1);
                }
            }

            if (r.length > 0) {
                let embed = new Discord.MessageEmbed()
                    .setColor(0x0096ff)
                    .setTitle("React for Role: " + found)
                    .setDescription(`Setup progress: 0/${r.length}\n\nAdd a reaction for <@&${r[0]}>`);

                message.channel.msg(`${botInfo.emotes.info}|Setting up reaction roles for **${found}**.\n__**If you need to change an emoji, type "cancel" and try again**__.`, {embed}).then(newMsg => {
                    newMsg.setReactListener(time.m * 5, 'reactGroupCreate', {group: found, emotes: [], roles: r}, [message.author.id]);
                    message.channel.setResponseListener([newMsg.id], [message.author.id], time.m * 5, 'reactGroupCancel');
                });
            } else message.channel.msg(`${botInfo.emotes.fail}|After verifying that status of roles, no more roles are in **${found}**.`);
        } else if (found.length > 1) message.channel.msg(`${botInfo.emotes.fail}|Too many groups found for **${args.join(' ')}**.`);
        else message.channel.msg(`${botInfo.emotes.fail}|No groups found for **${args.join(' ')}**.`);
    }

});
