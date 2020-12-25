new Command({
    title: "Maintenance",
    desc: "Toggles bot maintenance.",
    category: "Developer",
    can: botInfo.developers,
    call: ['maintenance'],
    onCall: function(parsedArgs, args, message) {
        botInfo.maintenance = !botInfo.maintenance;

        bot.user.setPresence({
			status: (botInfo.maintenance ? 'dnd' : 'online')
		});

        message.channel.msg(`${botInfo.emotes.success}|Bot is ${botInfo.maintenance ? 'now' : 'no longer'} in maintenance mode.`);
    }
});
