//This file is for the react listener

reactFuncs = {
	"default": function(info, emoji, args, isAdded) {
		info.channel.msg("**" + info.user.tag + "** has __" + (isAdded ? "added" : "removed") + "__ reaction " + (emoji.name ? "*" + emoji.name + "*" : emoji.id));
		info.message.react(emoji.id || emoji.name).catch(console.log);
	},
	"reactGroupCreate": async function(info, emoji, args, isAdded) {
		if (isAdded) {
			let size = info.message.reactions.cache.size;
			if (emoji.id) {
				if (bot.emojis.resolve(emoji.id)) {
					info.message.react(emoji.id);
					react[info.self.id].args.emotes[emoji.id] = args.roles[size - 1];
				} else {
					info.channel.msg(`${botInfo.emotes.fail}|I'm not in a guild with that emote!`).then(newMsg => {newMsg.delete({timeout: 5});});
					await info.message.reactions.removeAll();
					for (let i = 0; i < args.emotes.length; i++) {
						await info.message.react(args.emotes[i]);
					}
				}
			} else {
				info.message.react(emoji.name);
				react[info.self.id].args.emotes[emoji.name] = args.roles[size - 1];
			}

			let emotes = [];
			let keys = Object.keys(react[info.self.id].args.emotes);
			for (let i = 0; i < keys.length; i++) {
				let id = keys[i];
				let emote = id;
				if (id.match(/[0-9]+/))
					emote = `<:a:${id}>`;
				emotes.push(`${emote} : <@&${react[info.self.id].args.emotes[id]}>`)
			}

			let embed = info.message.embeds[0];

			let r = args.roles;
			if (size >= r.length) {
				embed.setDescription(emotes.join('\n'));

				info.message.edit('', {embed}).catch(console.log);

				delete react[info.self.id];
			} else {
				embed.setDescription(`Setup progress: ${size}/${r.length}\n\n${emotes.join('\n')}\n\nAdd a reaction for <@&${r[size]}>`);

				info.message.edit({embed}).catch(console.log);
			}
		}
	}
}


// global.handleRawMessage = function(buffer) {
// 	let msgObj = JSON.parse(buffer.data);
// 	let data = msgObj.d;
//
// 	if(msgObj.op == 0){
// 		let r = react[data.message_id];
// 		if (!r) return; //No react listener set on this message
//
// 		if (!isFunction(reactFuncs[r.onReact])) return; //Invalid react function
//
// 		let can = r.can ? r.can.includes(data.user_id) : true; //If can is an empty array, return true, otherwise return if they are on that array.
// 		if (!can) return; //Not allowed to react
//
// 		let info = {
// 			guild: bot.guilds.get(data.guild_id),
// 			user: bot.users.get(data.user_id),
// 			message: data.message_id
// 		};
// 		if (info.guild) {
// 			info.channel = info.guild.channels.get(data.channel_id);
// 			info.member = info.guild.members.get(data.member_id);
// 		}
//
// 		switch(msgObj.t){ //React listener
// 			case "MESSAGE_REACTION_ADD": {
// 				r.changes.added++;
// 				try {
// 					//Following function arguments: info, emoji, args, isAdded, changes
// 					reactFuncs[r.onReact](info, data.emoji, r.args, true, r.changes);
// 				} catch (err) {
// 					let u = info.user;
// 					messageDevelopers(botInfo.emotes.caution + '|**' + u.tag + '** (' + u.id + ') has encountered an error in the __React Function__ ***' + r.onReact + '***:```\n' + err.stack + '```');
// 					u.msg(botInfo.emotes.caution + '|An error occured when you reacted to that message! I let the developers know, you don\'t have to do anything.');
// 				}
// 			}break;
// 			case "MESSAGE_REACTION_REMOVE": {
// 				r.changes.removed++;
// 				try {
// 					reactFuncs[r.onReact](info, data.emoji, r.args, false, r.changes);
// 				} catch (err) {
// 					let u = info.user;
// 					messageDevelopers(botInfo.emotes.caution + '|**' + u.tag + '** (' + u.id + ') has encountered an error in the __React Function__ ***' + r.onReact + '***:```\n' + err.stack + '```');
// 					u.msg(botInfo.emotes.caution + '|An error occured when you reacted to that message! I let the developers know, you don\'t have to do anything.');
// 				}
// 			}break;
// 		}
// 	}
// }

global.doReactFunction = function(reaction, user, added) {
    if (!reaction)
        throw new Error('doReactFunction: Bad argument #1: Reaction object expected, got something else.');
    if (reaction.partial)
        throw new Error('doReactFunction: Bad argument #1: Expected a complete reaction object, not a partial reaction object.');
    if (!isBool(added))
        throw new Error('doReactFunction: Bad argument #2: Expected a boolean, got ' + typeof added);

    let message = reaction.message;

    let r = react[message.id];
    if (!r) return; // Exit if there is no react listener on this message

    if (!isFunction(reactFuncs[r.onReact])) return; // The reaction function doesn't exist, so exit

    let can = r.can ? r.can.includes(user.id) : true; // If the allowed array is empty, then let anyone do it. Otherwise, they must be on the array.
    if (!can) return; // User wasn't allowed to reaction

    let info = {
        reaction: reaction,
        guild: message.guild,
        user: user,
		channel: user.dmChannel,
        message: message,
        self: r
    }
    if (message.guild) {
        info.channel = message.channel;
        info.member = message.member;
    }

    try {
        // reactFunc args:   info, emoji,          args,   added
        reactFuncs[r.onReact](info, reaction.emoji, r.args, added);
    } catch (err) {
        messageDevelopers(botInfo.emotes.caution + '|**' + user.tag + '** (' + user.id + ') has encountered an error in the __React Function__ ***' + r.onReact + '***:```\n' + err.stack + '```');
        user.msg(botInfo.emotes.caution + '|An error occured when you reacted to that message! I let the developers know, you don\'t have to do anything.');
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
