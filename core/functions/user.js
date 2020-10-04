Discord.User.prototype.setupStorage = function() {
	storage.users.set(this.id, copyObject(storage.users.get(this.id) || {}, botInfo.def.users));
	return storage.users.get(this.id);
}

Discord.User.prototype.saveStorage = function() {
	if (!storage.users.get(this.id)) return;
	if (!toSave.users.has(this.id)) toSave.users.add(this.id);
}

Discord.GuildMember.prototype.verifyMod = function() {
	let guild = this.guild; // Prevent calling this over and over, makes it easier to type
	let config = guild.setupStorage(); // Make sure the server configuration is valid
	return config.plugins.modroles.includes(this.id);
}

/*------------------------------------------------------------------------------
	findUser(string needle, Guild guild)
		* string needle
			This is the name or id to look for.
		Guild guild
			If this is defined, will also return a guild member of the same
			person.

		Finds a list user object with the player specified. If guild is defined,
		it will also find a guild member object.
------------------------------------------------------------------------------*/
global.findUser = function(needle, guild) {
	if (!isString(needle)) return []; // No need to search of there's no string

	needle = needle.toLowerCase(); // Make sure the string is lowercase so it's not case sensitive

	let found = [];
	if (needle != "") {
		let user = bot.users.resolve(needle); // They entered a valid ID
		if (user) { // User is valid
			let push = true;
			let tbl = {user: user};
			if (guild instanceof Discord.Guild) {
				let member = guild.members.resolve(user.id);
				tbl.member = member;
				if (!tbl.member) push = false;
			}
			if (push) found.push(tbl); // Push the table to the output
		} else if (needle.match(mentionPatt)) { // @mention pattern
			let id = needle.match(/[0-9]+/)[0];
			user = bot.users.resolve(id);
			if (user) {
				let push = true;
				let tbl = {user: user};
				if (guild instanceof Discord.Guild) {
					let member = guild.members.resolve(user.id);
					tbl.member = member;
					if (!tbl.member) push = false;
				}
				if (push) found.push(tbl); // Push the table to the output
			}
		} else { // Not an id or mention, now we search by name
			bot.users.cache.forEach((user, id, map) => {
				if (user.tag.toLowerCase().includes(needle)) { // Needle is found in name
					let push = true;
					let tbl = {user: user};
					if (guild instanceof Discord.Guild) {
						let member = guild.members.resolve(id);
						tbl.member = member;
						if (!tbl.member) push = false;
					}
					if (push) found.push(tbl); // Push the table to the output
				}
			});
		}
	}

	return found;
}
