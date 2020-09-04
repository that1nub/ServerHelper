//Another way of making a command
let cmd = {};
cmd.title = "Configuration";
cmd.desc = "Configurate how I work on your guild.";
cmd.call = ['conf', 'config', 'configuration'];

cmd.onCall = function(args, split, message) {
	if (!message.guild) {
		message.channel.msg(botInfo.emotes.fail + '|You must be on a guild to use this command.');
		return;
	}
	
	let can = false;
	if (message.author.id == message.guild.ownerID) can = true; //User is guild owner
	if (!can && message.member.hasPermission('ADMINISTRATOR')) can = true; //User is guild admin
	//Developers can modify config to help users. Plus they can already modify it with ~eval, so this just makes it easier.
	if (!can && botInfo.developers.includes(message.author.id)) can = true; 

	let fail = botInfo.emotes.fail;

	if (!can) {
		message.channel.msg(fail + '|You do not have permission to modify guild configuration.');
		return;
	}
	
	if (!split.length) {
		message.channel.msg(fail + '|You must specify at least one argument.');
		return;
	}
	
	let obj = storage.guilds.get(message.guild.id).plugins;
	let final;
	let arg = args.__unindexed;
	
	for (let i = 0; i < arg.length; i++) {		
		//If object and not array && !addCustom
		if (isObject(obj[arg[i]]) && !isArray(obj[arg[i]]) && !obj._canAddCustom) {
			obj = obj[arg[i]];
			final = arg[i + 1];
		}
	}
	
	if (final && obj[final]) {
		if (args.toggle) {
			if (isBool(obj[final])) {
				obj[final] = !obj[final];
			} else message.channel.msg(fail + '|Attempted to toggle a non-boolean setting.');
		} 
		if (args.set) {
			if (isString(obj[final])) {
				obj[final] = args.set.join(' ');
			} else message.channel.msg(fail + '|Attempted to set a value of a non-string setting.');
		}
		if (args.add) {
			if (isArray(obj[final])) {
				let added = [];
				if (message.guild[final]) {
					for (let i = 0; i < args.add.length; i++) {
						let mention = '<@&';
						if (final == "channels") mention = '<#';
						else if (final == "members") mention = '<@';
						
						if (message.guild[final].get(args.add[i])) {
							if (!added.includes(message.guild[final].get(args.add[i]))) 
								added.push(message.guild[final].get(args.add[i]));
							continue;
						}
						message.guild[final].forEach((key, value, map) => {
							if (value.name.includes(args.add[i]) && !added.includes(value)) 
								added.push(value);
							else if (args.add[i] == mention + key + '>') //@mention
								added.push(value);
						});
					}
				}
			} else if (isObject(obj[final])) {
				
			}
		}
	} else message.channel.msg(fail + '|Invalid configuration property');
	message.guild.saveStorage();
}

new Command(cmd);