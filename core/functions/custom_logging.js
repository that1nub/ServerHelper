let log = {
	guild: null,
	channel: null,
	last: {
		guild: botInfo.ready.guild,
		channel: botInfo.ready.channel
	}
};

global.cLog = function(...args) {
	console.log.apply(null, args); //Log to console
	
	//Now we want to log to channel
	if (bot.status === 0) { // https://discord.js.org/#/docs/main/stable/typedef/Status
		if (botInfo.ready.guild !== log.last.guild) {
			log.guild = bot.guilds.get(botInfo.ready.guild);
			log.last.guild = botInfo.ready.guild;
		}
		if (log.guild) {
			if (botInfo.ready.log !== log.last.channel) {
				log.channel = log.guild.get(botInfo.ready.log);
				log.last.channel = botInfo.ready.log;
			}
			if (log.channel) {
				let str = '';
				let msgs = [];
				for (let i = 0; i < args.length; i++) {
					str += " " + String(args[i]);
				}
				while (str.length > 1992) {
					msgs.push('```\n' + str.substring(0, 1992) + '```');
					str = str.substring(1992);
				}
				if (str.length > 0) {
					msgs.push('```\n' + str + '```');
				}
				for (let i = 0; i < msgs.length; i++) {
					channel.msg(msgs[i]);
				}
			}
		}
	}
}