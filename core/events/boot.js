bot.on('ready', () => {
	global.readyTime = Date.now();

	let time = (readyTime - bootTime) / 1000;

	console.log('Bot online; took ' + time + ' seconds.');

	let guild = bot.guilds.resolve(botInfo.ready.guild);

	if (guild) {
		let channel = guild.channels.resolve(botInfo.ready.channel);
		if (channel) {
			let memUse = process.memoryUsage();
			let [used, total] = [memUse.heapUsed, memUse.heapTotal];

			let embed = new Discord.MessageEmbed()
				.setColor(0x0096ff)
				.setTitle('Startup Information')
				.addField('Memory Usage:', `**${((used/total) * 100).toFixed(3)}%** (${(used/1024/1024).toFixed(3)} / ${(total/1024/1024).toFixed(3)} MB)`)
				.addField('Startup time:', `**${time}** seconds.`);

			channel.msg({embed});
		}
	}

	if (botInfo.maintenance) {
		bot.user.setPresence({
			status: 'dnd'
		});
	}

	// Retrieve the configuration from the DataBase
	bot.guilds.cache.forEach(guild => {
		if (DataBase) {
			syncGuild(guild.id);
		}
	});

	// console.log(bot.ws);
	// bot.ws.on('message', handleRawMessage);
});
