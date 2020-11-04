new Command({
    title: "Restart",
    desc: "Restart the bot.",
    call: ['restart'],
    can: botInfo.developers,
    onCall: async function(parsedArgs, args, message) {
        if (parsedArgs.force) {
            await message.channel.msg(`${botInfo.emotes.info}|Forcing restarting now...`);
            process.exit();
        }

        await message.channel.msg(`${botInfo.emotes.info}|Bot Restarting...\nSay 'cancel' to cancel the restart, or 'restart now' to stop waiting`);

        message.channel.setResponseListener([], botInfo.developers, time.m, 'restart')

        let guild = bot.guilds.resolve(botInfo.ready.guild);
        if (guild) {
    		let channel = guild.channels.resolve(botInfo.ready.channel);
    		if (channel) {
    			await channel.msg(`${botInfo.emotes.info}|**${message.author.tag}** has requested a restart...`);
    		}
    	}

        restarting = true;
        setTimeout(async () => {
            if (restarting) {
                let guild = bot.guilds.resolve(botInfo.ready.guild);
                if (guild) {
            		let channel = guild.channels.resolve(botInfo.ready.channel);
            		if (channel) {
            			await channel.msg(`${botInfo.emotes.info}|Restarting...`);
            		}
            	}

                process.exit();
            }
        }, time.m);
    }
});
