//Response messages

global.responseFuncs = {
	"default": function(info, args) {
		info.channel.msg('Response recorded: ' + info.message.content.substring(0, 10));
	},
	"guildDeleteReactGroups": function(info, args) {
		let msg = info.message.content.toLowerCase();
		if (msg.startsWith("yes")) {
			let rg = storage.guilds.get(info.guild.id).plugins.reactGroups;
			let keys = Object.keys(rg);

			for (let i = 0; i < args.length; i++) {
				if (rg[args[i]] && keys.includes(args[i])) {
					delete rg[args[i]];
				}
			}

			info.message.channel.msg(`${botInfo.emotes.success}|Deleted react group${args.length > 1 ? "s" : ""} **${args.join('**, **')}**.\nNote that you will have to delete any reaction messages using these groups.`);
		} else if (msg.startsWith("no")) {
			info.message.channel.msg(`${botInfo.emotes.info}|You have canceled your action.`);
			delete response[info.self.id];
		}
	},
	"guildDeleteLevelingReward": function(info, args) {
		let msg = info.message.content.toLowerCase();
		if (msg.startsWith("yes")) {
			let rewards = storage.guilds.get(info.guild.id).plugins.leveling.rewards;
			if (rewards[args[0]]) {
				delete rewards[args[0]];
			}
			info.message.channel.msg(`${botInfo.emotes.success}|Removed all rewards for level **${args[0]}**.`);
		} else if (msg.startsWith("no")) {
			info.message.channel.msg(`${botInfo.emotes.info}|You have canceled your action.`);
			delete response[info.self.id];
		}
	},
	"reactGroupCancel": function(info, args) {
		let msg = info.message.content.toLowerCase();
		if (msg.startsWith('cancel')) {
			if (react[args[0]]) {
				delete react[args[0]];
				message.channel.msg(`${botInfo.emotes.success}|Canceled reaction listener setup. You may delete the message.`);
			} else {
				message.channel.msg(`${botInfo.emotes.fail}|No reaction setup to cancel.`);
			}
			delete response[info.self.id];
		}
	},
	"restart": async function(info, args) {
		let msg = info.message.content.toLowerCase();
		if (msg.startsWith('cancel')) {
			restarting = false;

			delete response[info.self.id];
			info.message.channel.msg(`${botInfo.emotes.success}|Canceled, bot will no longer restart.`);

			let guild = bot.guilds.resolve(botInfo.ready.guild);
			if (guild) {
				let channel = guild.channels.resolve(botInfo.ready.channel);
				if (channel) {
					channel.msg(`${botInfo.emotes.info}|Restart canceled by **${info.message.author.tag}**.`);
				}
			}
		} else if (msg.startsWith('restart now')) {
			await info.message.channel.msg(`${botInfo.emotes.success}|Forcing restart now...`);

			let guild = bot.guilds.resolve(botInfo.ready.guild);
			if (guild) {
				let channel = guild.channels.resolve(botInfo.ready.channel);
				if (channel) {
					await channel.msg(`${botInfo.emotes.info}|Restart forced now by **${info.message.author.tag}**.`);
				}
			}
			
			process.exit();
		}
	},
	"kodersPurge": async function(info, args) {
		let msg = info.message.content.toLowerCase();
		if (msg.startsWith("yes")) {
			info.message.channel.msg(`${botInfo.emotes.info}|Kicking ${args[1].length} member${args[1].length > 1 ? "s" : ""}...`);
			// info.message.channel.msg('```\n' + JSON.stringify(args, null, 2) + '```');
			// for (let i = 0; i < args[1].length; i++) {
			// 	await info.message.channel.msg(`<@${args[1][i]}>`);
			// }
			for (let i = 0; i < args[0].length; i++) {
				await purgeKoders(args[0][i]);
			}
			info.message.channel.msg(`${botInfo.emotes.success}|Members kicked.`);
		} else if (msg.startsWith("no")) {
			info.message.channel.msg(`${botInfo.emotes.info}|You have canceled your action.`);
			delete response[info.self.id];
		}
	}
}

setInterval(() => {
	let now = Date.now();
	let keys = Object.keys(response);
	for (let i = 0; i < keys.length; i++) {
		let r = response[keys[i]];
		if (r.timeout <= 0) return;
		if (now - r.created >= r.timeout) delete response[keys[i]];
	}
}, 500);

global.saveResponseChannels = function() {
	save(directory.response, JSON.stringify(response, null, 2));
}
global.loadResponseChannels = function(sync = true) {
	if (sync) {
		try {
			response = JSON.parse(FileSystem.readFileSync(directory.response));
		} catch (err) {
			cLog('Unable to load response channels', err.stack);
		}
	} else {
		FileSystem.readFile(directory.response, (err, data) => {
			if (err) {
				cLog('Unable to load reponse channels', err.stack);
				return;
			}
			response = JSON.parse(data);
		});
	}
}
