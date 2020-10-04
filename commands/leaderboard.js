new Command({
    title: "Leaderboard",
    desc: "Get the rank leaderboard on the server.",
    call: ['leaderboard', 'lb'],
    onCall: function(parsedArgs, args, message) {
        if (!message.guild) {
            message.channel.msg(`${botInfo.emotes.fail}|You must be on a guild to check a rank.`);
            return;
        }

        let sto = storage.guilds.get(message.guild.id);
        let [levels, leveling] = [sto.levels, sto.plugins.leveling];

        if (!leveling.enabled) {
            message.channel.msg(`${botInfo.emotes.fail}|The leveling plugin is currently disabled.`);
            return;
        }

        let users = [];
        let keys = Object.keys(levels);
        for (let i = 0; i < keys.length; i++) {
            let lev = levels[keys[i]];
            users.push({lvl: lev.is, xp: lev.totalExperience, id: keys[i]});
        }

        users.sort(function(a, b){return a.xp + b.xp});

        let msg = [];
        for (let i = 0; i < 20; i++) {
            let user = users[i];
            if (user) {
                msg.push(`${i+1}. <@${user.id}> [lvl: ${user.lvl} | total xp: ${user.xp}]`);
            }
        }

        let embed = new Discord.MessageEmbed()
            .setColor(0x0096ff)
            .setTitle("Leaderboard")
            .setDescription(msg.join('\n'));

        message.channel.msg({embed});
    }
});
