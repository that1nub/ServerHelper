Discord.Guild.prototype.setupStorage = function() {
	storage.guilds.set(this.id, copyObject(storage.guilds.get(this.id) || {}, botInfo.def.guilds));
	return storage.guilds.get(this.id);
}

Discord.Guild.prototype.saveStorage = function() {
	if (!storage.guilds.get(this.id)) return;
	if (!toSave.guilds.has(this.id)) toSave.guilds.add(this.id);
}
