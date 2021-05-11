new Command({
    title: "Kick",
    desc: "Kick a member from the guild. They can rejoin at their own discretion.",
    category: "Moderation",
    usage: "<member> {reason}",
    call: ['kick'],
    onCall: async function(parsedArgs, args, message) {
        if (!message.guild) { // Can't kick from DMs
            return message.channel.msg(`${botInfo.emotes.fail}|You must be on a guild to use this.`);
        }

        let caller = message.member;

        let mod = false;
        if (caller.verifyMod()) mod = true; // Check if they have a mod role
        if (!mod && caller.hasPermission('KICK_MEMBERS')) mod = true;

        if (!mod) {
            return message.channel.msg(`${botInfo.emotes.fail}|You don't have the required permissions.`);
        }

        if (args.length == 0) {
            return message.channel.msg(`${botInfo.emotes.fail}|You need to mention a member to kick.`);
        }

        let targ = findUser(args.shift(), message.guild);

        if (targ.length == 0) {
            return message.channel.msg(`${botInfo.emotes.fail}|No targets found.`);
        } else if (targ.length > 1) {
            return message.channel.msg(`${botInfo.emotes.fail}|Too many targets found (${targ.length}).`);
        }

        let target = targ[0].member;
        if (target == caller) {
            return message.channel.msg(`${botInfo.emotes.fail}|Why would you want to kick yourself? :(`);
        }

        if (target == message.guild.me) {
            return message.channel.msg(`${botInfo.emotes.fail}|😭 why?? What did I do wrong???\n||You can submit feedback to the developers on Discord using the \`invite\` command.||`)
        }

        if (!target.kickable) {
            return message.channel.msg(`${botInfo.emotes.fail}|I'm unable to kick this member.`);
        }

        if (target.roles.highest.position >= caller.roles.highest.position) {
            return message.channel.msg(`${botInfo.emotes.fail}|You can't ban someone with higher power than you.`);
        }

        if (target.verifyMod()) {
            message.channel.msg(`${botInfo.emotes.fail}|You can't ban other moderators.`);
        }

        let reason = (args.length > 0) ? args.join(' ').substring(0, 1500) : "No reason specified.";

        await target.user.msg(`Oh no!\nYou've been kicked from **${message.guild.name}**\nReason: ${reason}\nBy whom: ${caller.user.tag}`);

        target.kick(reason).then(() => {
            // Create a case
            let caseNum = copyObject({}, botInfo.def.case);
            caseNum.type = "Kick";
            caseNum.info = `${caller.user.tag} kicked ${target.user.tag}.`;
            caseNum.by = caller.id;
            caseNum.target = target.id;
            caseNum.reason = reason;
            caseNum.on = message.createdTimestamp;

            let cases = storage.guilds.get(message.guild.id).cases;
            cases.push(caseNum);

            let embed = new Discord.MessageEmbed()
                .setColor(0xff3e3e)
                .setAuthor(`${target.user.tag} (${target.id})`, target.user.displayAvatarURL())
                .setTitle(caseNum.type)
                .setDescription(caseNum.info)
                .addField("Reason:", caseNum.reason)
                .addField("Administered By:", `<@${caseNum.by}>`)
                .setFooter(`Case #${cases.length}`)
                .setTimestamp(caseNum.on);

            message.channel.msg(`${botInfo.emotes.success}|Kicked **${target.user.tag}** (${target.id}).`, {embed});
            message.guild.saveStorage();
        }).catch(err => {
            message.channel.msg(`${botInfo.emotes.fail}|Unable to kick ${target}\`\`\`\n${err}\`\`\``);
        });
    }
});