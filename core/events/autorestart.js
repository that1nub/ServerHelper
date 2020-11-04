global.restarting = false;
global.restartTime = new Date();
restartTime.setHours(0);
restartTime.setMinutes(9);
restartTime.setSeconds(0);
restartTime.setMilliseconds(0);
restartTime.setDate(restartTime.getDate() + 1);

bot.on('ready', () => {
    console.log("Bot automatically restarting @ " + restartTime);
});

setInterval(async () => {
    let currentTime = new Date();
    if (currentTime >= restartTime) {
        console.log('Restart sequence initiated.');

        let guild = bot.guilds.resolve(botInfo.ready.guild);
        if (guild) {
    		let channel = guild.channels.resolve(botInfo.ready.channel);
    		if (channel) {
    			await channel.msg(`${botInfo.emotes.info}|Auto restart sequence initiated.`);
    		}
    	}

        restartTime.setDate(restartTime.getDate() + 1);
        restarting = true;

        setTimeout(async function() {
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
}, 1000);
