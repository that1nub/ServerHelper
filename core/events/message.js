// This is the command and level handler
bot.on('message', message => {
	if (message.author.bot) return;

	let guild = message.guild;
	let channel = message.channel;
	let author = message.author;

	let sto = {
		author: author.setupStorage()
	};

	let prefix = ""; // If in DMs, this will let them run commands without a prefix
	if(guild) {
		sto.guild = guild.setupStorage();
		prefix = storage.guilds.get(guild.id).plugins.prefix;
	}

	let msg = message.content.trim();
	if (bot.user) {
		if (msg.startsWith('<@' + bot.user.id + '>'))
			prefix = '<@' + bot.user.id + '>';
		if (msg.startsWith('<@!' + bot.user.id + '>'))
			prefix = '<@!' + bot.user.id + '>';
	}

	let [args, split] = parseArgs(msg.slice(prefix.length));
	let cmd = split.length ? removeFormatting(split.shift()).toLowerCase() : " "; // The space prevents running a command

	// Command handler
	if (msg.toLowerCase().startsWith(prefix.toLowerCase()) && msg.length > prefix.length) {
		let can = (botInfo.developers.includes(author.id) || botInfo.testers.includes(author.id)) || !botInfo.maintenance;
		if (can) {
			if (!restarting) {
				let isBlacklisted = false;
				if (blacklisted[author.id]) isBlacklisted = blacklisted[author.id].is;
				if (!isBlacklisted) {
					let lastUsed = message.createdTimestamp - sto.author.last.used;
					sto.author.last.used = message.createdTimestamp;
					if (lastUsed >= 1000) {
						let ran = false;
						for (let i = 0; i < commands.length; i++) { // Actually running command
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
						if (!ran && message.guild) channel.msg(`${botInfo.emotes.fail}|**${cmd}** is an invalid command.`);
					} else channel.msg(botInfo.emotes.fail + '|Slow down there! You\'re moving to fast for me!');
				} else channel.msg(botInfo.emotes.fail + '|You are currently blacklisted from ' + bot.user.username);
			} else channel.msg(`${botInfo.emotes.fail}|I am preparing for a daily restart, please wait a few minutes.`);
		} else channel.msg(botInfo.emotes.fail + '|Bot is currently down for maintenance.');
	}

	// Level handler
	if (guild) {
		// Instead of constantly retyping this, this line makes it easier
		let leveling = sto.guild.plugins.leveling;
		// We only want to add XP if the leveling plugin is enabled
		if (leveling.enabled) {
			// We want to make sure that the current channel isn't excluded from
			// leveling
			if (!leveling.noXP.includes(channel.id)) {
				// We don't want to add experience to bots
				if (!message.author.bot) {
					let levels = sto.guild.levels;

					levels[author.id] = copyObject(levels[author.id] || {}, botInfo.def.level);

					let lvl = levels[author.id];

					if (message.createdTimestamp - lvl.lastGained >= time.m) {
						// console.log("XP gained");
						let blevel = botInfo.leveling;
						let xptolvl = Math.round(blevel.base + (blevel.multiplier * (lvl.is - 1)));

						lvl.totalExperience += blevel.gains;

						lvl.experience += blevel.gains;
						if (lvl.experience >= xptolvl) {
							lvl.is++;
							lvl.experience -= xptolvl;
							channel.msg(leveling.message.replace(/\$user_level/g, lvl.is).replace(/\$user/g, message.member.displayName));
						}

						//TODO: rank rewards

						lvl.lastGained = message.createdTimestamp;
						guild.saveStorage();
					}
				}
			}
		}
	}

	// Message Counter
	if (guild) {
		let s = sto.guild.messages;

		if (!s[author.id]) s[author.id] = {}; // Make sure an index exists for the user
		if (!s[author.id][channel.id]) s[author.id][channel.id] = 0; // Make sure channel index exists for the user
		s[author.id][channel.id]++;

		guild.saveStorage();
	}

	// Response listener
	if (response[channel.id]) {
		let r = response[channel.id];

		if (Date.now() - r.created >= 50) {
			let can = true;
			if (isArray(r.can)) {
				can = false;
				if (r.can.includes(message.author.id))
					can = true;
			}

			if (can) {
				try {
					let info = {guild: guild, user: author, channel: channel, message: message, self: r};
					responseFuncs[r.onRespond](info, r.args);
				} catch (err) {
					messageDevelopers(botInfo.emotes.caution + '|**' + author.tag + '** (' + author.id + ') has encountered an error in the __Response Listener__ ***' + r.onRespond + '***:```\n' + err.stack + '```');
					channel.msg(botInfo.emotes.caution + '|An error occured when you replied! I let the developers know, you don\'t have to do anything.');
				}
			}
		}
	}
});
