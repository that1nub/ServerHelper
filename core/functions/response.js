//Response messages

global.responseFuncs = {
	"default": function(info, args) {
		info.channel.msg('Response recorded: ' + info.message.content.substring(0, 10));
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