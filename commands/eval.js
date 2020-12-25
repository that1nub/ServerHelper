
new Command({
	title: "Evaluate",
	desc: "Evaluate input javascript to make the bot perform actions.",
    category: "Developer",
	can: botInfo.developers,
	call: ['eval', 'evaluate'],
	onCall: function(args, split, message) {
		let consoleLogs = [];

		let normalLog = console.log;
		console.log = function(message) {
			if (typeof message === "object" || message instanceof Array)
				consoleLogs.push(JSON.stringify(message))
			else
				consoleLogs.push(message);
		}

		let success = error = null;
		try {
			let msg = message.content.substring(message.content.indexOf(split[0]) - 1);
			success = eval(msg.replace(/```js/g, '').replace(/```/g, ''));
		} catch (err) {
			error = err;
		}

		console.log = normalLog;

		if (success && !error) {
			let str = String(success);
			while (str.length >= 1993) {
				message.channel.msg('```\n' + str.substring(0, 1993) + '```');
				str = str.substring(1993);
			}
			if (str.length > 0) message.channel.msg('```\n' + str + '```');
		}
		else if (!success && !error) message.channel.msg(botInfo.emotes.success + '|Code ran without error, but no return value.');
		else message.channel.msg(botInfo.emotes.caution + '|Code ran with error```\n' + error + '```');

		if (consoleLogs.length > 0) {
			let logs = consoleLogs.join('\n');

			if (logs.length <= 1970)
				message.channel.msg(`Console:\`\`\`\n${logs}\`\`\``);
			else
				message.channel.msg(`Console: *The console output was too large, here's a text file instead*.`, {files: [{attachment: Buffer.from(logs), name: "console.txt"}]});
		}
	}
});
