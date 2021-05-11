new Command({
    title: "Ban",
    desc: "Ban a member from the guild.",
    category: "Moderation",
    usage: "<member> {reason}",
    call: ['ban', 'banish'],
    onCall: async function(parsedArgs, args, message) {
        if (!message.guild) { // We can't ban from DMs
            message.channel.msg(botInfo.emotes.fail + "|You must be on a guild to use this.");
            return;
        }

        // Person who called the command (duh)
        let caller = message.member;

        let mod = false;
        if (caller.verifyMod()) mod = true; // Check if they have a mod role
        if (!mod && caller.hasPermission('BAN_MEMBERS')) mod = true; // Checks if they have the ban perms through another role (including admin)

        if (!mod) {
            message.channel.msg(botInfo.emotes.fail + "|You don't have the required permissions.");
            return;
        }

        if (args.length == 0) {
            message.channel.msg(botInfo.emotes.fail + "|You need to mention a member to ban.");
            return;
        }

        let targ = findUser(args.shift(), message.guild); // Get the users they are trying to target

        if (targ.length == 0) {
            message.channel.msg(botInfo.emotes.fail + "|No targets found.");
            return;
        } else if (targ.length > 1) {
            message.channel.msg(botInfo.emotes.fail + "|Too many targets found (" + targ.length + ").");
            return;
        }

        let member = targ[0].member;
        if (member == caller) { // The caller can't ban themself
            message.channel.msg(botInfo.emotes.fail + "|Why would you want to ban yourself? :(");
            return;
        }

        if (member == message.guild.me) {
            message.channel.msg(botInfo.emotes.fail + "|why?? What did I do wrong???\n||You can submit feedback to the developers on Discord using the `invite` command.||");
            return;
        }

        if (!member.bannable) { // The bot can't ban this person
            message.channel.msg(botInfo.emotes.fail + "|I can't ban **" + member.displayName + "**.");
            return;
        }

        if (member.roles.highest.position >= caller.roles.highest.position) { // The caller can't ban people of higher power
            message.channel.msg(botInfo.emotes.fail + "|You can't ban someone with higher power than you.");
            return;
        }

        if (member.hasPermission('ADMINISTRATOR')) { // The caller can't ban an administrator
            message.channel.msg(botInfo.emotes.fail + "|You can't ban an admin.");
            return;
        }

        if (member.verifyMod()) { // Mods can ban other mods
            message.channel.msg(botInfo.emotes.fail + "|You can't ban another mod.");
        }

        let reason = (args.length > 0) ? args.join(' ').substring(0, 1500) : "No reason specified.";

        await member.user.msg("Oh no!\nYou have been banned from **" + message.guild.name + "**\nReason: " + reason + "\nBy whom: " + caller.user.tag);
        
        member.ban({days: 7, reason: reason}).then(() => {
            // Create a case # 
            let caseNum = copyObject({}, botInfo.def.case);
            caseNum.type = "Ban",
            caseNum.info = message.author.tag + " banned " + member.user.tag + ".";
            caseNum.by = message.author.id;
            caseNum.target = member.id;
            caseNum.reason = reason;
            caseNum.on = message.createdTimestamp;
            
            let cases = storage.guilds.get(message.guild.id).cases;
            cases.push(caseNum);
            
            // Send a message with the case number
            let embed = new Discord.MessageEmbed()
                .setColor(0xff3e3e)
                .setAuthor(`${member.user.tag} (${member.id})`, member.user.displayAvatarURL())
                .setTitle(caseNum.type)
                .setDescription(caseNum.info)
                .addField("Reason:", caseNum.reason)
                .addField("Administered By:", `<@${caseNum.by}>`)
                .setFooter(`Case #${cases.length}`)
                .setTimestamp(caseNum.on);
            message.channel.msg(botInfo.emotes.success + "|Successfully banned **" + member.user.tag + "**.", {embed});
            message.guild.saveStorage();
        }).catch(err => {
            message.channel.msg(botInfo.emotes.fail + "|Unable to ban **" + member.user.tag + "**.```\n" + err + "```");
        });
    }
});
