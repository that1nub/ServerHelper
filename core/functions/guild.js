Discord.Guild.prototype.setupStorage = function() {
	storage.guilds.set(this.id, copyObject(storage.guilds.get(this.id) || {}, botInfo.def.guilds));
	return storage.guilds.get(this.id);
}

Discord.Guild.prototype.saveStorage = function() {
	if (!storage.guilds.get(this.id)) return;
	if (!toSave.guilds.has(this.id)) toSave.guilds.add(this.id);
}


Discord.Guild.prototype.findRoles = function(needle) {
	if (!isString(needle)) throw new Error("Guild.findRoles: Bad argument #1: Expected string, got " + typeof needle);
	needle = needle.toLowerCase();

	let found = [];

	let res = this.roles.resolve(needle);
	let mat = needle.match(/<@&[0-9]+>/g);

	if (res)
		found.push(res);
	else if (isArray(mat)) {
		for (let i = 0; i < mat.length; i++) {
			let id = mat[i].match(/[0-9]+/)[0];
			let res = this.roles.resolve(id);
			if (res)
				found.push(res);
		}
	} else {
		this.roles.cache.forEach((role, id, map) => {
			if (role.name.toLowerCase().includes(needle))
				found.push(role);
		});
	}

	return found;
}

Discord.Guild.prototype.findChannels = function(needle) {
	if (!isString(needle)) throw new Error("Guild.findChannels: Bad argument #1: Expected string, got " + typeof needle);
	needle = needle.toLowerCase();

	let found = [];

	let res = this.channels.resolve(needle);
	let mat = needle.match(/<#[0-9]+>/g);

	if (res)
		found.push(res);
	else if (isArray(mat)) {
		for (let i = 0; i < mat.length; i++) {
			let id = mat[i].match(/[0-9]+/)[0];
			let res = this.channels.resolve(id);
			if (res)
				found.push(res);
		}
	} else {
		this.channels.cache.forEach((channel, id, map) => {
			if (channel.name.toLowerCase().includes(needle))
				found.push(channel);
		});
	}

	return found;
}

Discord.Guild.prototype.findMembers = async function(needle) {
	if (!isString(needle)) throw new Error("Guild.findMembers: Bad argument #1: Expected string, got " + typeof needle);
	needle = needle.toLowerCase();

	let res = this.members.resolve(needle);
	let mat = needle.match(/<@[0-9]+>/g);

	let found = [];

	if (res) {
		found.push(res);
	} else if (isArray(mat)) {
		for (let i = 0; i < mat.length; i++) {
			let id = mat[i].match(/[0-9]+/)[0];
			let res = this.members.resolve(id);
			if (res) {
				found.push(res);
			}
		}
	} else {
		let members = await this.members.fetch();
		members.forEach((member, id, map) => {
			if (member.displayName.toLowerCase().includes(needle) || member.user.tag.toLowerCase().includes(needle)) {
				found.push(member);
			}
		});
	}

	return found;
}
