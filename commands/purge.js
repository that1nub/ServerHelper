new Command({
    title: "Purge",
    desc: "Remove a number of messages from a channel that are newer than 2 weeks.",
    category: "Moderation",
    usage: '<# messages> {reason}',
    call: ['purge', 'clean'],
    onCall: function(parsedArgs, args, message) {
        if (!message.guild) {
            return message.channel.msg(`${botInfo.emotes.fail}|You must be on a guild to use this.`);
        }

        // Person who called the command (duh)
        let caller = message.member;

        let mod = false;
        if (caller.verifyMod()) mod = true; // Check if they have a mod role
        if (!mod && caller.hasPermission('BAN_MEMBERS')) mod = true; // Checks if they have the ban perms through another role (including admin)

        if (!mod) {
            return message.channel.msg(`${botInfo.emotes.fail}|You must be a moderator to use this.`);
        }

        if (!args[0]) {
            return message.channel.msg(`${botInfo.emotes.fail}|You must list the number of messages to purge.`);
        } 

        let num = Number(args.shift());
        if (Number.isNaN(num) || !Number.isFinite(num) || num < 0) {
            return message.channel.msg(`${botInfo.emotes.fail}|Invalid number of messages.`);
        }

        if (num > 100) {
            return message.channel.msg(`${botInfo.emotes.fail}|You can only purge up to 100 messages at a time.`);
        }

        if (num != Math.floor(num)) {
            return message.channel.msg(`${botInfo.emotes.fail}|You must give an integer, not a fraction.`);
        }

        let transcript = [];
        message.delete().then(() => {
            message.channel.bulkDelete(num).then(messages => {
                messages.forEach((msg, id, map) => {
                    let auth = `${msg.author.tag} (${msg.author.id})`;
                    let time = msg.createdAt;
                    let content = msg.content || "-[Empty Message]-";
                    
                    if (msg.attachments.size > 0) {
                        content += "\n-> Message has attachments (image, video, etc)";
                    }

                    transcript.push(`${auth} - ${time}\n${content}`);
                });
                transcript.reverse();

                let reason = (args.length > 0) ? args.join(' ') : 'No reason specified.';

                let buffer = Buffer.from(transcript.join('\n\n'));

                // Create a case
                let caseNum = copyObject({}, botInfo.def.case);
                caseNum.type = "Purge";
                caseNum.info = `${caller.user.tag} purged ${num} messages from <#${message.channel.id}>.`;
                caseNum.by = caller.id;
                caseNum.target = message.channel.id;
                caseNum.reason = reason;
                caseNum.on = message.createdTimestamp;

                let cases = storage.guilds.get(message.guild.id).cases;
                cases.push(caseNum);

                let embed = new Discord.MessageEmbed()
                    .setColor(0xffff3e)
                    .setAuthor(message.channel.name)
                    .setTitle(caseNum.type)
                    .setDescription(caseNum.info)
                    .addField("Reason:", caseNum.reason)
                    .addField("Administered By:", `<@${caseNum.by}>`)
                    .setFooter(`Case #${cases.length}`)
                    .setTimestamp(caseNum.on);

                message.author.send(`${botInfo.emotes.info}|Here's a transcript of your recent purge request:`, {files: [{attachment: buffer, name: "transcription_channel_" + message.channel.name + ".txt"}]}).then(() => {
                    message.channel.msg(`${botInfo.emotes.success}|Successfully deleted \`${messages.size}\` messages. Transcription of the deleted messages was sent to your DMs.`).then(newMsg => {
                        newMsg.delete({timeout: 5000});
                    });
                }).catch(err => {
                    message.channel.msg(`${botInfo.emotes.caution}|Successfully deleted \`${messages.size}\` messages, however I was unable to send you the transcription in your DMs. Instead it is attached here.\nI couldn't DM you for: \`${err}\``, {files: [{attachment: buffer, name: "transcription_channel_" + message.channel.name + ".txt"}]});
                });

                message.channel.msg({embed});
            }).catch(err => {
                message.channel.msg((`${botInfo.emotes.fail}|Failed to purge messages: \`${err}\``).replace('DiscordAPIError: ', ''));
            });
        }).catch(err => {
            message.channel.msg(`${botInfo.emotes.fail}|I do not have permission to delete messages.`);
        });
    }
});