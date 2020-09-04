bot.on('ready', () => {
	global.readyTime = Date.now();

	let time = (readyTime - bootTime) / 1000;

	console.log('Bot online; took ' + time + ' seconds.');

	let guild = bot.guilds.resolve(botInfo.ready.guild);

	if (guild) {
		let channel = guild.channels.resolve(botInfo.ready.channel);
		if (channel) {
			let message = botInfo.emotes.success + botInfo.emotes.info + "|Bot started! Here's some information:";
			let memUse = process.memoryUsage();
			let used = memUse.heapUsed;
			let total = memUse.heapTotal;
			message += "\nMemory: **" + ((used/total) * 100).toFixed(3) + "%** (" + (used/1000/1000).toFixed(3) + " / " + (total/1000/1000).toFixed(3) + " MB)";
			message += "\nBoot Time: **" + time + " seconds**.";
			channel.msg(message);
		}
	}

	// console.log(bot.ws);
	bot.ws.on('message', handleRawMessage);
});
