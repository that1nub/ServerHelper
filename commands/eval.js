new Command({
	title: "Evaluate",
	desc: "Evaluate input javascript to make the bot perform actions.",
	can: botInfo.developers,
	call: ['eval', 'evaluate'],
	onCall: function(args, split, message) {
		let success = error = null;
		try {
			success = eval(split.join(' '));
		} catch (err) {
			error = err;
		}
		if (success && !error) {
			let str = String(success);
			while (str.length >= 1993) {
				message.channel.msg('```\n' + str.substring(0, 1993) + '```');
				str = str.substring(1993);
			}
			if (str.length > 0) message.channel.msg('```\n' + str + '```');
		}
		else if (!success && !error) message.channel.msg(botInfo.emotes.success + '|Code ran without error, but no return value.');
		else message.channel.msg(botInfo.emotes.caution + '|Code ran with error```\n' + String(error.stack) + '```');
	}
});
