//This file is for the react listener

reactFuncs = {
	"default": function(info, emoji, args, isAdded, changes) {
		info.channel.msg("**" + info.user.tag + "** has __" + (isAdded ? "added" : "removed") + "__ reaction " + (emoji.name ? "*" + emoji.name + "*" : emoji.id));
	}
}


global.handleRawMessage = function(buffer) {
	let msgObj = JSON.parse(buffer.data);
	let data = msgObj.d;
	
	if(msgObj.op == 0){ 
		let r = react[data.message_id];
		if (!r) return; //No react listener set on this message
		
		if (!isFunction(reactFuncs[r.onReact])) return; //Invalid react function
		
		let can = r.can ? r.can.includes(data.user_id) : true; //If can is an empty array, return true, otherwise return if they are on that array.
		if (!can) return; //Not allowed to react
		
		let info = {
			guild: bot.guilds.get(data.guild_id),
			user: bot.users.get(data.user_id),
			message: data.message_id
		};
		if (info.guild) {
			info.channel = info.guild.channels.get(data.channel_id);
			info.member = info.guild.members.get(data.member_id);
		}	
		
		switch(msgObj.t){ //React listener
			case "MESSAGE_REACTION_ADD": { 
				r.changes.added++;
				try {
					//Following function arguments: info, emoji, args, isAdded, changes
					reactFuncs[r.onReact](info, data.emoji, r.args, true, r.changes);
				} catch (err) {
					let u = info.user;
					messageDevelopers(botInfo.emotes.caution + '|**' + u.tag + '** (' + u.id + ') has encountered an error in the __React Function__ ***' + r.onReact + '***:```\n' + err.stack + '```');
					u.msg(botInfo.emotes.caution + '|An error occured when you reacted to that message! I let the developers know, you don\'t have to do anything.');
				}
			}break; 
			case "MESSAGE_REACTION_REMOVE": {
				r.changes.removed++;
				try {
					reactFuncs[r.onReact](info, data.emoji, r.args, false, r.changes);
				} catch (err) {
					let u = info.user;
					messageDevelopers(botInfo.emotes.caution + '|**' + u.tag + '** (' + u.id + ') has encountered an error in the __React Function__ ***' + r.onReact + '***:```\n' + err.stack + '```');
					u.msg(botInfo.emotes.caution + '|An error occured when you reacted to that message! I let the developers know, you don\'t have to do anything.');
				}
			}break; 	
		} 
	}
}

setInterval(() => { //Delete react listener when it times out.
	let keys = Object.keys(react);
	let now = Date.now();
	for (let i = 0; i < keys.length; i++) {
		let r = react[keys[i]];
		if (r.timeout <= 0) return;
		if (now - r.created >= r.timeout) delete react[keys[i]];
	}
}, 500);

global.saveReactListeners = function() {
	save(directory.react, JSON.stringify(react, null, 2));
}

global.loadReactListeners = function(sync = true) {
	if (sync) {
		try {
			react = JSON.parse(FileSystem.readFileSync(directory.react));	
		} catch (err) {
			cLog('Error loading react listener', err.stack);
		}
	} else {
		FileSystem.readFile(directory.react, (err, data) => {
			if (err) {
				cLog('Error loading react listener', err.stack);
				return;
			}
			react = JSON.parse(data);
		});
	}
}