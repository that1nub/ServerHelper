global.FileSystem = require('fs');
global.Discord    = require('discord.js');
global.Jimp       = require('jimp');

global.bot = new Discord.Client({partials: ['MESSAGE', 'CHANNEL', 'REACTION']});

//Variables
global.bootTime = Date.now();

let root = process.cwd();
global.directory   = {} //If modifying this, make sure all values are a string and not anything else
directory.root     = root,
directory.commands = root    + "/commands",
directory.core     = root    + "/core",
directory.storage  = root    + "/storage", //This is read in `loadStorage()` guild and user data is saved in this under `/storage/guilds` and `/storage/users`
directory.images   = root    + "/images",
directory.botInfo  = root    + "/bot_information.json"

directory.blacklist = directory.storage + "/blacklist.json",
directory.react     = directory.storage + "/react.json",
directory.response  = directory.storage + "/response.json",
directory.reminders = directory.storage + "/reminders.json"

//Before we load anything, we want to make sure all the folders we will need exist. If not, we are going to create them.
let keys = Object.keys(directory);
for (let i = 0; i < keys.length; i++) {
	if (!FileSystem.existsSync(directory[keys[i]])) {
		if (directory[keys[i]].includes('.')) {
			let str = directory[keys[i]].endsWith('json') ? '{}' : '';
			FileSystem.writeFileSync(directory[keys[i]], str);
		} else {
			FileSystem.mkdirSync(directory[keys[i]]);
		}
	}
}
if (!FileSystem.existsSync(directory.storage + '/guilds')) FileSystem.mkdirSync(directory.storage + '/guilds');
if (!FileSystem.existsSync(directory.storage + '/users')) FileSystem.mkdirSync(directory.storage + '/users');

console.log('Bot initializing...', directory.root);

//This function should be in core but is required to load the core.
global.loadCore = function(dir = directory.core) {
	let files = FileSystem.readdirSync(dir);
	for (let i = 0; i < files.length; i++) {
		let f = dir + '/' + files[i];
		if (!files[i].includes('.')) {
			loadCore(f);
		} else {
			console.log('Core: Loading file ' + f);
			delete require.cache[require.resolve(f)];
			require(f);
		}
	}
}

global.storage     = {};
global.blacklisted = {};
global.react       = {};
global.response    = {};
global.commands    = [];
global.botInfo     = JSON.parse(FileSystem.readFileSync(directory.botInfo));
global.toSave      = {guilds: new Set(), users: new Set()};
global.mentionPatt = /<@!?[0-9]+>/;

global.time = {
	s: 1000,
	m: 60000,
	h: 3600000,
	d: 86400000,
	w: 604800000,
	y: 31534272000
};


//Core loading
console.log('Loading core files...', directory.core);
loadCore();

//Data loading
console.log('Loading stored data...', directory.storage);
loadStorage();

//Fetch blacklisted players
console.log('Fetching blacklisted players...', directory.blacklist);
fetchBlacklist();

//React
console.log('Listener: fetching react messages...', directory.react);
loadReactListeners();

//Response
console.log('Listener: fetching response channels...', directory.response);
loadResponseChannels();

// Load reminders
// console.log('Reminders: fetching reminders...', directory.reminders);
// loadReminders();

//Load commands
console.log('Loading commands...', directory.commands);
loadCommands();

//Log the bot in
bot.login(botInfo.token);
