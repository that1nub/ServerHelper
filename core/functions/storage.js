//All functions here are high priority, which is why they use sync reading.

global.loadStorage = function(dir = directory.storage) {
	try {
		let files = FileSystem.readdirSync(dir);
		for (let i = 0; i < files.length; i++) {
			let f = dir + '/' + files[i];
			if (!files[i].includes('.')) {
				if (!storage[files[i]]) storage[files[i]] = new Map();
				loadStorage(f);
			} else {
				console.log('storage: Loading file ' + f);
				let d = dir.substring(dir.lastIndexOf('/') + 1); //data type
				let fn = files[i].substring(0, files[i].indexOf('.'));
				try {
					let info = JSON.parse(FileSystem.readFileSync(f));
					if (storage[d] instanceof Map)
						storage[d].set(fn, botInfo.def[d] ? copyObject(info, botInfo.def[d]) : info);
					else
						storage[d] = botInfo.def[d] ? copyObject(info, botInfo.def[d]) : info;
				} catch (err) {
					console.log('Error loading storage for ' + f, err.stack);
					if (storage[d] instanceof Map)
						storage[d].set(fn, botInfo.def[d] ? copyObject({}, botInfo.def[d]) : {});
					else
						storage[d] = botInfo.def[d] ? copyObject({}, botInfo.def[d]) : {};
				}
			}
		}
	} catch (err) {
		console.log('Error loading storage dir', err.stack);
	}
}

global.dirHasFile = function(dir, file, sync = true) {
	if (!isString(dir)) throw new Error("dirHasFile: Argument one must be a string, got " + typeof dir);
	if (!isString(file)) throw new Error("dirHasFile: Argument two must be a string, got " + typeof file);

	if (sync) {
		try {
			let files = FileSystem.readdirSync(dir);
		 	for (let i = 0; i < files.length; i++) {
				let f = dir + '/' + files[i];
		 		if (!files[i].includes('.')) {
		 			return dirHasFile(f, file);
		 		} else if (files[i] === file) {
		 			return f;
				}
			}
			return null;
		} catch(err) {
			console.log('Unable to read directory to check if file exists', err.stack);
		}
	} else {
		FileSystem.readdir(dir, (err, files) => {
			if (err) {
				console.log('Unable to read directory to check if file exists', err.stack);
				return;
			}
			for (let i = 0; i < files.length; i++) {
				let f = dir + '/' + files[i];
		 		if (!files[i].includes('.')) {
		 			return dirHasFile(f, file, false);
		 		} else if (files[i] === file) {
		 			return f;
				}
			}
		});
	}
}

global.loadCommands = function(sync = true, dir = directory.commands) {
	if (sync) {
		try {
			let files = FileSystem.readdirSync(dir);
			for (let i = 0; i < files.length; i++){
				let f = dir + '/' + files[i];
				if (!files[i].includes('.')) {
					loadCommands(true, f);
				} else {
					delete require.cache[require.resolve(f)];
					require(f);
				}
			}
		} catch (err) {
			console.log('Error loading command directory', err.stack);
		}
	} else {
		FileSystem.readdir(dir, (err, files) => {
			if (err) {
				console.log('Error loading command directory', err.stack);
				return;
			}

			for (let i = 0; i < files.length; i++){
				let f = dir + '/' + files[i];
				if (!files[i].includes('.')) {
					loadCommands(false, f);
				} else {
					delete require.cache[require.resolve(f)];
					require(f);
				}
			}
		});
	}
}
global.reloadCommand = function(cmd = "") {
	let path = dirHasFile(directory.commands, cmd, false);
	if (path) {
		delete require.cache[require.resolve(path)];
		require(path);
	}
}

global.blacklisted = {};
global.fetchBlacklist = function(sync = true, file = directory.blacklist) {
	if (sync) {
		try {
			blacklisted = JSON.parse(FileSystem.readFileSync(file));
		} catch (err) {
			console.log('Unable to fetch blacklisted users', err.stack);
		}
		let bKeys = Object.keys(blacklisted);
		for (let i = 0; i < bKeys.length; i++) {
			console.log('Blacklisted: ' + bKeys[i]);
		}
	} else {
		FileSystem.readFile(file, (err, data) => {
			if (err) {
				console.log('Unable to fetch blacklisted users', err.stack);
				return;
			}
			blacklisted = JSON.parse(data);
		});
	}
}

global.save = function(file, info) {
	if (!isString(file)) throw new Error('save: first argument must be a string, got ' + typeof file);
	if (!isString(info)) throw new Error('save: second argument must be a string, got ' + typeof file);

	FileSystem.open(file, 'w', (err, fd) => {
		if (err) {
			console.log('Error saving to file ', file, '\n', err.stack);
			return;
		}

		FileSystem.write(fd, info, err => {
			if (err) console.log('Error saving to file ', file, '\n', err.stack);
		});
	});
}
