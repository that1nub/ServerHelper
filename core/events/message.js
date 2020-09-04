//This is the command and level handler
bot.on('message', message => {
	if (message.author.bot) return;

	let guild = message.guild;
	let channel = message.channel;
	let author = message.author;

	let sto = {
		author: author.setupStorage()
	};

	let prefix = "~"; //Default prefix
	if(guild) {
		sto.guild = guild.setupStorage();
		prefix = storage.guilds.get(guild.id).plugins.prefix;
	}

	let msg = message.content.trim();
	if (msg.startsWith('<@' + bot.user.id + '>')) prefix = '<@' + bot.user.id + '>';
	if (msg.startsWith('<@!' + bot.user.id + '>')) prefix = '<@!' + bot.user.id + '>';

	let [args, split] = parseArgs(msg.slice(prefix.length));
	let cmd = split.length ? removeFormatting(split.shift()).toLowerCase() : " "; //The space prevents running a command

	//Command handler
	if (msg.startsWith(prefix) && msg.length > prefix.length) {
		let can = (botInfo.developers.includes(author.id) || botInfo.testers.includes(author.id)) || !botInfo.maintenance;
		if (can) {
			let isBlacklisted = false;
			if (blacklisted[author.id]) isBlacklisted = blacklisted[author.id].is;
			if (!isBlacklisted) {
				let lastUsed = message.createdTimestamp - sto.author.last.used;
				sto.author.last.used = message.createdTimestamp;
				if (lastUsed >= 1000) {
					let ran = false;
					for (let i = 0; i < commands.length; i++) { //Actually running command
						if (commands[i].can.length ? commands[i].can.includes(author.id) : true) {
							for (let x = 0; x < commands[i].call.length; x++) {
								if (cmd === commands[i].call[x].toLowerCase()) {
									ran = true;
									try {
										commands[i].onCall(args, split, message);
									} catch (err) {
										cLog(author.tag + ' (' + author.id + ') has experienced an error running ', commands[i].title, '\n', err.stack);
										messageDevelopers(botInfo.emotes.caution + '|**' + author.tag + '** (' + author.id + ') has encountered an error in **' + commands[i].title + '**```\n' + err.stack + '```');
										channel.msg(botInfo.emotes.caution + '|You have encountered an error! I have told the developers so you don\'t need to do anything.');
									}
								}
							}
						}
					}
					if (!ran) {
						if (guild) {
							let g = sto.guild.plugins.badcmd;
							if (g.enabled)
								channel.msg(g.message.replace(/\$cmd/g, cmd));
						} else channel.msg(botInfo.emotes.fail + '|' + botInfo.def.guilds.plugins.badcmd.message.replace(/\$cmd/g, cmd));
					}
				} else channel.msg(botInfo.emotes.fail + '|Slow down there! You\'re moving to fast for me!');
			} else channel.msg(botInfo.emotes.fail + '|You are currently blacklisted from ' + bot.user.username);
		} else channel.msg(botInfo.emotes.fail + '|Bot is currently down for maintenance.');
	}

	//Level handler
	if (guild) {

	}

	//Message Counter
	if (guild) {
		let s = sto.guild.messages;

		if (!s[author.id]) s[author.id] = {}; // Make sure an index exists for the user
		if (!s[author.id][channel.id]) s[author.id][channel.id] = 0; // Make sure channel index exists for the user
		s[author.id][channel.id]++;

		guild.saveStorage();
	}

	//Response listener
	if (response[channel.id]) {
		let r = response[channel.id];
		try {
			let info = {guild: guild, user: author, channel: channel, message: message};
			responseFuncs[r.onRespond](info, r.args);
		} catch (err) {
			messageDevelopers(botInfo.emotes.caution + '|**' + author.tag + '** (' + author.id + ') has encountered an error in the __Response Listener__ ***' + r.onRespond + '***:```\n' + err.stack + '```');
			channel.msg(botInfo.emotes.caution + '|An error occured when you replied! I let the developers know, you don\'t have to do anything.');
		}
	}
});
