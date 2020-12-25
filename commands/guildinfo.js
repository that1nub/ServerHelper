new Command({
    title: "Guild Information",
    desc: "Get information about the guild.",
    category: "Server Information",
    call: ['guild', 'guildinfo', 'server', 'serverinfo'],
    onCall: function(parsedArgs, args, message){
        if (!message.guild) {
            message.channel.msg(`${botInfo.emotes.fail}|You must be on a guild to use this.`);
            return;
        }

        let sto = storage.guilds.get(message.guild.id);

        message.guild.fetch().then(guild => {
            let created = `${guild.createdAt} [${formatTime(message.createdTimestamp - guild.createdTimestamp)} ago]`;
            let creator = `<@${guild.ownerID}>`;

            let members = `${guild.memberCount} members`;
            let real = bot = 0; // let real and bots = 0
            guild.members.cache.forEach((member, id, map) => {
                if (member.user.bot) bot++;
                else real++;
            });

            members += ` (${real} real, ${bot} bots)`;

            let channels = "";
            let total = text = voice = category = 0;
            guild.channels.cache.forEach((channel, id, map) => {
                total++;
                switch (channel.type) {
                    case "text": text++; break;
                    case "news": text++; break;
                    case "store": text++; break;
                    case "voice": voice++; break;
                    case "category": category++; break;
                }
            });
            channels += `${total} channels (${text} text, ${voice} voice, ${category} categor${category > 1 ? "ies" : "y"})`;

            let roles = "";
            let rc = -1; // The loop below will include @everyone, which we don't want to include, so we offset
            guild.roles.cache.forEach((role, id, map) => {
                rc++;
            });
            roles += `${rc} roles`;

            let verif = "";
            switch (guild.verificationLevel) {
                case "NONE": verif = "None"; break;
                case "LOW": verif = "Low (Accounts must have a verified email account)"; break;
                case "MEDIUM": verif = "Medium (Accounts must be registered for at least 5 minutes)"; break;
                case "HIGH": verif = "High (Accounts must be in server for at least 10 minutes)"; break;
                case "VERY_HIGH": verif = "Very High (Accounts must have a verified phone)"; break;
            }

            let active = "";
            let cnl = "";
            let usr = ""
            let usrAct = {};
            let cnlAct = {};

            let users = Object.keys(sto.messages);
            for (let i = 0; i < users.length; i++) {
                let channels = Object.keys(sto.messages[users[i]]);
                for (let x = 0; x < channels.length; x++) {
                    let c = sto.messages[users[i]][channels[x]];

                    if (!isNumber(usrAct[users[i]])) usrAct[users[i]] = 0;
                    if (!isNumber(cnlAct[channels[x]])) cnlAct[channels[x]] = 0;

                    usrAct[users[i]] += c;
                    cnlAct[channels[x]] += c;
                }
            }

            let uKeys = Object.keys(usrAct);
            let cKeys = Object.keys(cnlAct);

            let maxU = 0;
            for (let i = 0; i < uKeys.length; i++) {
                let inf = usrAct[uKeys[i]];
                if (inf > maxU) {
                    usr = `<@${uKeys[i]}> (${inf} messages)`;
                    maxU = inf;
                }
            }

            let maxC = 0;
            for (let i = 0; i < cKeys.length; i++) {
                let inf = cnlAct[cKeys[i]];
                if (inf > maxC) {
                    cnl = `<#${cKeys[i]}> (${inf} messages)`;
                    maxC = inf;
                }
            }

            active += `User: ${usr}\nChannel: ${cnl}`;

            let embed = new Discord.MessageEmbed()
                .setColor(0x0096ff)
                .setAuthor(guild.name, guild.iconURL())
                .addField(":alarm_clock: Created On:", created)
                .addField(":crown: Owned By:", creator)
                .addField(":bust_in_silhouette: Members:", members)
                .addField(":envelope: Channels:", channels)
                .addField(":receipt: Roles:", roles)
                .addField(botInfo.emotes.success + " Verification Level:", verif)
                .addField(":speaking_head: Most Active:", active);

            message.channel.msg({embed});
        });
    }
});
