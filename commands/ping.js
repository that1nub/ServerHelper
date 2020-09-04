new Command({
	title: "Ping",
	desc: "Ping the bot for a response. Will respond if it's online.",
	call: ['ping'],
	onCall: function(args, split, message) {
		message.channel.msg(botInfo.emotes.info + '|Pinging..').then(newMsg => {
			newMsg.edit(botInfo.emotes.info + '|Pong! Took ' + (newMsg.createdTimestamp - message.createdTimestamp) + " milliseconds to respond.").catch(cLog);
		});
	}
});