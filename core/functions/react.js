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
					info.message.react(emoji.id).then(() => {
						info.reaction.users.remove(info.user.id);
					});
					react[info.self.id].args.emotes[emoji.id] = args.roles[size - 1];
				} else {
					info.channel.msg(`${botInfo.emotes.fail}|I'm not in a guild with that emote!`).then(newMsg => {newMsg.delete({timeout: 2000});});
					info.reaction.users.remove(info.user.id);
					return;
				}
			} else { // Standard twemoji
				info.message.react(emoji.name).then(() => {
					info.reaction.users.remove(info.user.id);
				});
				react[info.self.id].args.emotes[emoji.name] = args.roles[size - 1];
			}

			let emotes = [];
			let keys = Object.keys(react[info.self.id].args.emotes);
			for (let i = 0; i < keys.length; i++) {
				let id = keys[i];
				let emote = id;
				let discordEmote = bot.emojis.resolve(id);
				if (id.match(/[0-9]+/))
					emote = `<${discordEmote.animated ? "a" : ""}:emote_name:${id}>`;
				emotes.push(`${emote} : <@&${react[info.self.id].args.emotes[id]}>`)
			}

			let embed = info.message.embeds[0];

			let r = args.roles;
			if (size >= r.length) {
				embed.setDescription(emotes.join('\n'));

				info.message.edit('', {embed}).catch(console.log);

				react[info.self.id].onReact = "reactForRole";
				react[info.self.id].can = undefined;
				react[info.self.id].timeout = 0;
				saveReactListeners();
				// delete react[info.self.id];
				// info.message.setReactListener(0, "reactForRole", info.args);
			} else {
				embed.setDescription(`Setup progress: ${size}/${r.length}\n\n${emotes.join('\n')}\n\nAdd a reaction for <@&${r[size]}>`);

				info.message.edit({embed}).catch(console.log);
			}
		}
	},
	"reactForRole": function(info, emoji, args, isAdded) {
		let role = info.guild.roles.resolve(args.emotes[emoji.id ? emoji.id : emoji.name]);
		if (role) {
			if (isAdded) {
				if (!info.member.roles.cache.has(role.id)) {
					info.member.roles.add(role.id).then(() => {
						info.user.msg(`${botInfo.emotes.success}|**${info.guild.name}** - __Added__ role **${role.name}**.`);
					}).catch(err => {
						info.user.msg(`${botInfo.emotes.fail}|**${info.guild.name}** - You were supposted to get role **${role.name}**, but an error occurred:\`\`\`\n${err}\`\`\``)
					});
				}
			} else {
				if (info.member.roles.cache.has(role.id)) {
					info.member.roles.remove(role.id).then(() => {
						info.user.msg(`${botInfo.emotes.success}|**${info.guild.name}** - __Removed__ role **${role.name}**.`);
					}).catch(err => {
						info.user.msg(`${botInfo.emotes.fail}|**${info.guild.name}** - You were supposted to have the role **${role.name}** taken, but an error occurred:\`\`\`\n${err}\`\`\``)
					});
				}
			}
		} else {

		}
	}
}



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
    if (!can){ // User wasn't allowed to react
		if (added) {
			reaction.users.remove(user.id); // Remove the user's reaction
			user.msg(`${botInfo.emotes.fail}|You aren't allowed to react to that message!`);
		}
		return; 
	} 

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
        info.member = message.guild.members.resolve(user.id);
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
