new Command({
    title: "Restart",
    desc: "Restart the bot.",
    call: ['restart'],
    can: botInfo.developers,
    onCall: function(parsedArgs, args, message) {
        message.channel.msg(`${botInfo.emotes.info}|Bot Restarting...`).then(() => {
            process.exit(1);
        });
    }
});
