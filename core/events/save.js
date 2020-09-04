//This saves user data and guild data
setInterval(() => {
	toSave.users.forEach(k => {
		save(directory.storage + "/users/" + k + '.json', JSON.stringify(storage.users.get(k)));
	});
	toSave.users.clear();

	toSave.guilds.forEach(k => {
		save(directory.storage + "/guilds/" + k + '.json', JSON.stringify(storage.guilds.get(k)));
	});
	toSave.guilds.clear();
}, 30000); //Save information every 30 seconds
