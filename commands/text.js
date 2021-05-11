new Command({
    title: "Text",
    desc: "Send a message in a text file :)",
    call: ['text'],
    onCall: function(parsedArgs, args, message, rawArgString) {
        if (!message.guild) {
            return message.channel.msg(`${botInfo.emotes.fail}|You must be on a guild to use this.`);
        }
        
        let arg = rawArgString.trim();
        if (arg === "") {
            message.channel.msg(`${botInfo.emotes.fail}|You must supply some text.`);
            return;
        }

        let buffer = Buffer.from(arg);

        message.delete();
        message.channel.createWebhook(message.member.displayName, {avatar: message.author.displayAvatarURL()}).then(webhook => {
            webhook.send({files: [{attachment: buffer, name: "message.txt"}]}).then(msg => {
                webhook.delete();
            }).catch(err => {
                message.channel.msg(message.member.displayName + ": ", {files: [{attachment: buffer, name: "message.txt"}]});
                webhook.delete();
            });
        }).catch(err => {
            message.channel.msg(message.member.displayName + ": ", {files: [{attachment: buffer, name: "message.txt"}]});
        });
    }
});