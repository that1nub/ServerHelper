new Command({
    title: "Ban",
    desc: "Ban a member from the guild.",
    category: "Moderation",
    usage: "<member> [duration] {reason}",
    call: ['ban', 'banish'],
    onCall: function(parsedArgs, args, message) {
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
            message.channel.msg(botInfo.emotes.fail + "|You need at least one argument.");
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
            message.channel.msg(botInfo.emotes.fail + "|You can't ban yourself.");
            return;
        }

        if (!member.bannable) { // The bot can't ban this person
            message.channel.msg(botInfo.emotes.fail + "|I can't ban **" + member.displayName + "**.");
            return;
        }

        if (member.roles.highest.position > caller.roles.highest.position) { // The caller can't ban people of higher power
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

        if (args.length == 0) {
            message.channel.msg(botInfo.emotes.fail + "|You must specify the duration. Put 0 for indefinite.");
            return;
        }

        let duration = parseTime(args.shift());
        let reason = (args.length > 0) ? args.join(' ').substring(0, 1500) : "No reason specified.";

        message.guild.saveStorage();
        member.user.msg("Oh no!\nYou have been banned from **" + message.guild.name + "**\nReason: " + reason + "\nBy whom: " + caller.user.tag + "\nDuration: " + formatTime(duration));

        member.ban({days: 7, reason: reason}).then(
        () => {
            message.channel.msg(botInfo.emotes.success + "|Successfully banned **" + member.user.tag + "**.");
        }).catch(
        err => {
            message.channel.msg(botInfo.emotes.fail + "|Unable to ban **" + member.user.tag + "**.```\n" + err + "```");
        });
    }
});
