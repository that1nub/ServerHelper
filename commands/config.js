//Another way of making a command
let cmd = {};
cmd.title = "Configuration";
cmd.desc = "Configurate how I work on your guild.";
cmd.call = ['config', 'conf', 'cfg', 'configuration'];

cmd.website = "https://nubstoys.xyz/serverhelper/docs/config.html";

let meta = {
	"prefix": {
		desc: "What to start your message with to call the bot.",
		usage: [
			"prefix <new prefix>"
		]
	},
	"modroles": {
		desc: "A list of moderator roles. Those with a mod role bypass blacklists and have access to certain moderator commands.",
		usage: [
			"modroles (add|remove) {role(s)}"
		]
	},
	"reactGroups": {
		desc: "Reaction Groups. These are used when setting up react-for-role.",
		usage: [
			"(reactgroups|rg) (create|delete) {name}",
			"(reactgroups|rg) {name} (add|remove) {roles(s)}"
		]
	},
	"strike_punishments": {
		desc: "Strike Punishments are actions against a user after they reach a certain number of strikes.",
		usage: [
			"striking <strike #> {punishment}",
			"striking remove <strike #>"
		]
	},
	"join": {
		desc: "Manage join messages and what the bot does when someone joins.",
		usage: [
			"join (enable|disable)",
			"join message (enable|disable)",
			"join message {text}",
			"join channel {channel}",
			"join roles (add|remove) {roles(s)}"
		]
	},
	"leave": {
		desc: "Manage leave messages.",
		usage: [
			"leave (enable|disable)",
			"leave message {text}",
			"leave channel {channel}"
		]
	},
	"self_assign": {
		desc: "Manage the roles chat can be self-assigned by command.",
		usage: [
			"(selfassign|sa) (enable|disable)",
			"(selfassign|sa) message {text}",
			"(selfassign|sa) roles (add|remove) {roles(s)}",
			"(selfassign|sa) dm (enable|disable)",
			"(selfassign|sa) delete (enable|disable)"
		]
	},
	"auto_moderation": {
		desc: "Manage automatic moderation from the bot.",
		usage: [
			"(automod|am) (enable|disable)",
			"(automod|am) (excludemods|em) (enable|disable)",
			"(automod|am) (autopardon|ap) (enable|disable)",
			"(automod|am) (autopardon|ap) after <time>",
			"(automod|am) (autopardon|ap) amount <amount>",
			"(automod|am) (swearfilter|sf) (enable|disable)",
			"(automod|am) (swearfilter|sf) blacklist (add|remove) {word(s)}",
			"(automod|am) (swearfilter|sf) response <offense #> {punishment(s)}",
			"(automod|am) (swearfilter|sf) response remove <offense #>",
			"(automod|am) (linkfilter|lf) (enable|disable)",
			"(automod|am) (linkfilter|lf) (blacklistiswhitelist|biw) (enable|disable)",
			"(automod|am) (linkfilter|lf) blacklist (add|remove) {domain(s)}",
			"(automod|am) (linkfilter|lf) response <offense #> {punishment(s)}",
			"(automod|am) (linkfilter|lf) response remove <offense #>",
			"(automod|am) (massmentions|mm) (enable|disable)",
			"(automod|am) (massmentions|mm) limit (user|role) <limit>",
			"(automod|am) (massmentions|mm) response <offense #> {punishment(s)}",
			"(automod|am) (massmentions|mm) response remove <offense #>"
		]
	},
	"leveling": {
		desc: "Manage the leveling system.",
		usage: [
			"leveling (enable|disable)",
			"leveling message {text}",
			"leveling noxp (add|remove) {channel(s)}",
			"leveling rewards <level> (add|remove) {role(s)}",
			"leveling rewards delete <level>"
		]
	},
	"logging": {
		desc: "Manage logging channels.",
		usage: [
			"logging (enable|disable)",
			"logging messages {channel}",
			"logging (channelmanage|cm) {channel}",
			"logging (rolemanage|rm) {channel}",
			"logging (roleassign|ra) {channel}",
			"logging joins {channel}",
			"logging bans {channel}",
			"logging levels {channel}",
			"logging strikes {channel}"
		]
	}
};

cmd.onCall = function(parsedArgs, args, message) {
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
		message.channel.msg(fail + '|You do not have permission to modify/view guild configuration.');
		return;
	}

	let plugins = storage.guilds.get(message.guild.id).plugins;

	if (args[0]) {
		switch (args.shift().toLowerCase()) {
			case "prefix": {
				if (args[0]) {
					let pref = args[0].substring(0, 10);
					plugins.prefix = pref;
					DataBase.query(`UPDATE guildConfig SET prefix = '${pref}' WHERE guildID = '${message.guild.id}'`);
					message.channel.msg(`${botInfo.emotes.success}|Prefix set to \`${plugins.prefix}\`.`);
				} else {
					let embed = new Discord.MessageEmbed()
						.setColor(0x0096ff)
						.setTitle("Configuration: Prefix")
						.setDescription(`The current prefix is **\`${plugins.prefix}\`**.\nDescription: ${meta["prefix"].desc}`);

					message.channel.msg({embed});
				}
			} break;

			case "modroles": {
				if (args[0]) {
					switch (args.shift().toLowerCase()) {
						case "add": {
							if (args[0]) {
								let roles = message.guild.findRoles(args.join(''));

								for (let i = 0; i < roles.length; i++) {
									if (!plugins.modroles.includes(roles[i].id))
										plugins.modroles.push(roles[i].id);
								}

								let mrText = "`No moderation roles exist.`";
								if (plugins.modroles.length) {
									mrText = `<@&${plugins.modroles.join('> <@&')}>`;
								}

								let embed = new Discord.MessageEmbed()
									.setColor(0x0096ff)
									.setTitle("Configuration: Moderation Roles")
									.setDescription(`Mod roles:\n${mrText}\nDescription: ${meta["modroles"].desc}`);

								message.channel.msg(`${botInfo.emotes.success}|Moderator roles updated.`, {embed});
							} else message.channel.msg(`${botInfo.emotes.fail}|You must list at least one role.`);
						} break;

						case "remove": {
							if (args[0]) {
								message.guild.roles.cache.forEach((role, id, map) => {
									if (plugins.modroles.includes(id)) {
										if (role.name.toLowerCase().includes(args[0].toLowerCase())) {
											for (let i = 0; i < plugins.modroles.length; i++) {
												if (plugins.modroles[i] == id)
													plugins.modroles.splice(i, 1);
											}
										}
									}
								});

								let mrText = "`No moderation roles exist.`";
								if (plugins.modroles.length) {
									mrText = `<@&${plugins.modroles.join('> <@&')}>`;
								}

								let embed = new Discord.MessageEmbed()
									.setColor(0x0096ff)
									.setTitle("Configuration: Moderation Roles")
									.setDescription(`Mod roles:\n${mrText}\nDescription: ${meta["modroles"].desc}`);

								message.channel.msg(`${botInfo.emotes.success}|Moderator roles updated.`, {embed});
							} else message.channel.msg(`${botInfo.emotes.fail}|You must list at least one role.`);
						} break;

						default: {
							message.channel.msg(`${botInfo.emotes.fail}|You must either \`add\` or \`remove\` from mod roles.`);
						} break;
					}
				} else {
					let mrText = "`No moderation roles exist.`";
					if (plugins.modroles.length) {
						mrText = `<@&${plugins.modroles.join('> <@&')}>`;
					}

					let embed = new Discord.MessageEmbed()
						.setColor(0x0096ff)
						.setTitle("Configuration: Moderation Roles")
						.setDescription(`Mod roles:\n${mrText}\nDescription: ${meta["modroles"].desc}`);

					message.channel.msg({embed});
				}
			} break;

			case "reactgroups": case "rg": {
				if (args[0]) {
					switch (args[0].toLowerCase()) {
						case "create": {
							if (args[1]) {
								args.shift();

								let keys = Object.keys(plugins.reactGroups);
								for (let i = 0; i < keys.length; i++) {
									keys[i] = keys[i].toLowerCase();
								}

								let name = args.join(' ');

								if (name.toLowerCase() == "create" || name.toLowerCase() == "delete") {
									message.channel.msg(`${botInfo.emotes.fail}|Create and Delete are blocked names.`);
									return;
								}

								if (!keys.includes(name.toLowerCase()) && !plugins.reactGroups[name]) {
									plugins.reactGroups[name] = [];
									message.channel.msg(`${botInfo.emotes.success}|React group **${name}** created.`);
								} else {
									message.channel.msg(`${botInfo.emotes.fail}|A group with this name already exists.`);
								}
							} else {
								message.channel.msg(`${botInfo.emotes.fail}|You must specify the name of the new react group.`);
							}
						} break;

						case "delete" : {
							if (args[1]) {
								args.shift();

								let name = args.join(' ');
								let toDelete = [];

								let keys = Object.keys(plugins.reactGroups);
								for (let i = 0; i < keys.length; i++) {
									if (keys[i].toLowerCase().includes(name.toLowerCase()))
										toDelete.push(keys[i]);
								}


								if (toDelete.length > 0) {
									message.channel.msg(`${botInfo.emotes.caution}|Are you sure? This will delete group${toDelete.length > 1 ? "s" : ""} **${toDelete.join('**, **')}**. Reply with "yes" or "no" within 15 seconds.`).then(newMsg => {
										message.channel.setResponseListener(toDelete, [message.author.id], 15000, 'guildDeleteReactGroups');
									});
								} else {
									message.channel.msg(`${botInfo.emotes.fail}|No groups found.`);
								}
							} else {
								message.channel.msg(`${botInfo.emotes.fail}|You must specify the name of the new react group.`);
							}
						} break;

						default: {
							if (args[0]) {
								args[0] = args[0].toLowerCase();

								let found = [];
								let targ;

								let keys = Object.keys(plugins.reactGroups);
								for (let i = 0; i < keys.length; i++) {
									if (keys[i].toLowerCase().includes(args[0])) {
										found.push(keys[i]);
									}
								}

								if (found.length == 1) {
									found = found[0];
									args.shift();

									if (args[0]) {
										switch(args.shift().toLowerCase()) {
											case "add": {
												if (args[0]) {
													let r = plugins.reactGroups[found];

													let roles = message.guild.findRoles(args.join(''));

													for (let i = 0; i < roles.length; i++) {
														if (!r.includes(roles[i].id))
															r.push(roles[i].id);
													}

													let mrText = "`No roles for this group exist.`";
													if (r.length) {
														mrText = `<@&${r.join('> <@&')}>`;
													}

													let embed = new Discord.MessageEmbed()
														.setColor(0x0096ff)
														.setTitle(`Configuration: React Group - ${found}`)
														.setDescription(`Roles:\n${mrText}\nDescription: ${meta["reactGroups"].desc}`);

													message.channel.msg(`${botInfo.emotes.success}|Roles for reaction group **${found}** updated.`, {embed});
												} else message.channel.msg(`${botInfo.emotes.fail}|You must list at least one role.`);
											} break;

											case "remove": {
												if (args[0]) {
													let r = plugins.reactGroups[found];
													message.guild.roles.cache.forEach((role, id, map) => {
														if (r.includes(id)) {
															if (role.name.toLowerCase().includes(args[0].toLowerCase())) {
																for (let i = 0; i < r.length; i++) {
																	if (r[i] == id)
																		r.splice(i, 1);
																}
															}
														}
													});

													let mrText = "`No roles for this group exist.`";
													if (r.length) {
														mrText = `<@&${r.join('> <@&')}>`;
													}

													let embed = new Discord.MessageEmbed()
														.setColor(0x0096ff)
														.setTitle(`Configuration: React Group - ${found}`)
														.setDescription(`Roles:\n${mrText}\nDescription: ${meta["reactGroups"].desc}`);

													message.channel.msg(`${botInfo.emotes.success}|Roles for reaction group **${found}** updated.`, {embed});
												} else message.channel.msg(`${botInfo.emotes.fail}|You must list at least one role.`);
											} break;

											default: {
												message.channel.msg(`${botInfo.emotes.fail}|You must either \`add\` or \`remove\` from **${found}** roles.`);
											} break;
										}
									} else {
										let r = plugins.reactGroups[found];

										let mrText = "`No roles for this group exist.`";
										if (r.length) {
											mrText = `<@&${r.join('> <@&')}>`;
										}

										let embed = new Discord.MessageEmbed()
											.setColor(0x0096ff)
											.setTitle(`Configuration: React Group - ${found}`)
											.setDescription(`Roles:\n${mrText}\nDescription: ${meta["reactGroups"].desc}`);

										message.channel.msg({embed});
									}
								} else if (found.length > 1) message.channel.msg(`${botInfo.emotes.fail}|Too many react groups found. Please be more specific.`);
								else message.channel.msg(`${botInfo.emotes.fail}|No react groups found. Please be less specific.`);
							} else {
								message.channel.msg(`${botInfo.emotes.fail}|You must create, delete, or add/remove from a react group.`);
							}
						} break;
					}
				} else {
					let r = plugins.reactGroups;
					let keys = Object.keys(r);

					let text = '';
					for (let i = 0; i < keys.length; i++) {
						if (isArray(r[keys[i]])) {
							text += `**${keys[i]}**: ${r[keys[i]].length}\n`;
						}
					}

					let embed = new Discord.MessageEmbed()
						.setColor(0x0096ff)
						.setTitle(`Configuration: Reaction Groups`)
						.setDescription(text);

					message.channel.msg({embed});
				}
			} break;

			case "striking": {
				if (args[0]) {
					switch (args[0].toLowerCase()) {
						case "remove": {
							args.shift();
							if (args[0]) {
								console.log(args[0]);
								if (Object.keys(plugins.strike_punishments).includes(args[0])) {
									let sp = plugins.strike_punishments[args[0]]
									delete plugins.strike_punishments[args[0]];

									message.channel.msg(`${botInfo.emotes.success}|Deleted strike punishment #**${args[0]}**, which was: **${sp}**`);
								} else message.channel.msg(`${botInfo.emotes.fail}|Strike punishment not found.`);
							} else msg.channel.msg(`${botInfo.emotes.fail}|You must specify the strike punishment to remove.`);
						} break;

						default: {
							if (args[1]) {
								if (args[0] == Number(args[0])) {
									let num = args[0];

									args.shift();
									let joined = removeFormatting(args.join(' '));

									plugins.strike_punishments[num] = joined;

									message.channel.msg(`${botInfo.emotes.success}|When **${num}** active strikes are on a member, their punishment is: **${joined}**`);
								} else message.channel.msg(`${botInfo.emotes.fail}|The punishment for this strike must be a number.`);
							} else {
								if (Object.keys(plugins.strike_punishments).includes(args[0])) {
									let punishment = plugins.strike_punishments[args[0]];
									let punishments = parsePunishment(punishment);

									let embed = new Discord.MessageEmbed()
										.setColor(0x0096ff)
										.setTitle(`Configuration: Strike Punishment #${args[0]}`)
										.setDescription(`\`${punishment}\`\nInterpretted as:\n${punishments.join('\n')}`);

									message.channel.msg({embed});
								} else message.channel.msg(`${botInfo.emotes.fail}|Strike punishment not found.`);
							}
						} break;
					}
				} else {
					let strikes = "";

					let keys = Object.keys(plugins.strike_punishments);
					for (let i = 0; i < keys.length; i++) {
						strikes += `\n#**${keys[i]}**: \`${plugins.strike_punishments[keys[i]]}\``;
					}

					let embed = new Discord.MessageEmbed()
						.setColor(0x0096ff)
						.setTitle(`Configuration: Strike Punishments`)
						.setDescription(`Users will receive punishments after they get a certain number of strikes.${strikes}`);

					message.channel.msg({embed});
				}
			} break;

			case "join": {
				if (args[0]) {
					switch (args.shift().toLowerCase()) {
						case "enable": {
							plugins.join.enabled = true;
							message.channel.msg(`${botInfo.emotes.success}|Join plugin enabled.`);
						} break;

						case "disable": {
							plugins.join.enabled = false;
							message.channel.msg(`${botInfo.emotes.success}|Join plugin disabled.`);
						} break;

						case "message": {
							if (args[0]) {
								switch (args[0].toLowerCase()) {
									case "enable": {
										plugins.join.send_message = true;
										message.channel.msg(`${botInfo.emotes.success}|Join messages enabled.`);
									} break;

									case "disable": {
										plugins.join.send_message = false;
										message.channel.msg(`${botInfo.emotes.success}|Join messages disabled.`);
									} break;

									default: {
										let msg = args.join(' ');
										plugins.join.message = msg.replace(/`+/g, '');

										let g = message.guild;
										let m = message.member;
										let a = message.author;

										message.channel.msg(`${botInfo.emotes.success}|Join message set to \`${msg}\`\nPreview: ${msg.replace(/\$user_count/g, g.memberCount).replace(/\$user_id/g, a.id).replace(/\$user_name/g, m.displayName).replace(/\$user_tag/g, a.tag).replace(/\$user/g, a)}`);
									} break;
								}
							} else message.channel.msg(`${botInfo.emotes.info}|The join message is: \`${plugins.join.message}\``);
						} break;

						case "channel": {
							if (args[0]) {
								let channels = message.guild.findChannels(args[0]);

								if (channels.length == 1) {
									let valid = false;
									switch (channels[0].type) {
										case "text": valid = true; break;
										case "news": valid = true; break;
										case "store": valid = true; break;
									}

									if (valid) {
										plugins.join.channel = channels[0].id;
										message.channel.msg(`${botInfo.emotes.success}|Join message channel set to ${channels[0]}.`);
									} else message.channel.msg(`${botInfo.emotes.fail}|Join message channel must be a text channel.`);
								} else if (channels.length > 1) message.channel.msg(`${botInfo.emotes.fail}|Too many channels found for **${args[0]}**.`);
								else message.channel.msg(`${botInfo.emotes.fail}|No channels found for **${args[0]}**.`);
							} else message.channel.msg(`${botInfo.emotes.fail}|You must specify the channel.`);
						} break;

						case "roles": {
							if (args[0]) {
								switch(args.shift().toLowerCase()) {
									case "add": {
										if (args[0]) {
											let r = plugins.join.roles;

											let roles = message.guild.findRoles(args.join(''));

											for (let i = 0; i < roles.length; i++) {
												if (!r.includes(roles[i].id))
													r.push(roles[i].id);
											}

											let mrText = "`No roles will be assigned.`";
											if (r.length) {
												mrText = `<@&${r.join('> <@&')}>`;
											}

											let embed = new Discord.MessageEmbed()
												.setColor(0x0096ff)
												.setTitle(`Configuration: Join Roles`)
												.setDescription(`Roles:\n${mrText}\nDescription: ${meta["join"].desc}`);

											message.channel.msg(`${botInfo.emotes.success}|Join roles updated.`, {embed});
										} else message.channel.msg(`${botInfo.emotes.fail}|You must list at least one role.`);
									} break;

									case "remove": {
										if (args[0]) {
											let r = plugins.join.roles;
											message.guild.roles.cache.forEach((role, id, map) => {
												if (r.includes(id)) {
													if (role.name.toLowerCase().includes(args[0].toLowerCase())) {
														for (let i = 0; i < r.length; i++) {
															if (r[i] == id)
																r.splice(i, 1);
														}
													}
												}
											});

											let mrText = "`No roles will be assigned.`";
											if (r.length) {
												mrText = `<@&${r.join('> <@&')}>`;
											}

											let embed = new Discord.MessageEmbed()
												.setColor(0x0096ff)
												.setTitle(`Configuration: Join Roles`)
												.setDescription(`Roles:\n${mrText}\nDescription: ${meta["join"].desc}`);

											message.channel.msg(`${botInfo.emotes.success}|Join roles updated.`, {embed});
										} else message.channel.msg(`${botInfo.emotes.fail}|You must list at least one role.`);
									} break;

									default: {
										message.channel.msg(`${botInfo.emotes.fail}|You must either \`add\` or \`remove\` from **${found}** roles.`);
									} break;
								}
							} else {
								let r = plugins.join.roles;

								let mrText = "`No roles will be assigned.`";
								if (r.length) {
									mrText = `<@&${r.join('> <@&')}>`;
								}

								let embed = new Discord.MessageEmbed()
									.setColor(0x0096ff)
									.setTitle(`Configuration: Join Roles`)
									.setDescription(`Roles:\n${mrText}\nDescription: ${meta["join"].desc}`);

								message.channel.msg({embed});
							}
						} break;

						default: {
							message.channel.msg(`${botInfo.emotes.fail}|Invalid join configuration property.`);
						} break;
					}
				} else {
					let embed = new Discord.MessageEmbed()
						.setColor(0x0096ff)
						.setTitle("Configuration: Joining")
						.setDescription(plugins.join.enabled ? `${botInfo.emotes.success}|Plugin enabled.` : `${botInfo.emotes.fail}|Plugin disabled.\nWhile disabled, the following settings are irrelevant.`)
						.addField(plugins.join.send_message ? `${botInfo.emotes.success}|Will send this message:` : `${botInfo.emotes.fail}|Won't send this message:`, `\`${plugins.join.message}\``)
						.addField("Message sent in channel:", message.guild.channels.resolve(plugins.join.channel) ? `<#${plugins.join.channel}>` : "`No set channel.`")
						.addField(`Will assign roles [${plugins.join.roles.length}]`, plugins.join.roles.length > 0 ? `<@&${plugins.join.roles.join('> <@&')}>` : "`No roles will be assigned.`");

					message.channel.msg({embed});
				}
			} break;

			case "leave": {
				if (args[0]) {
					switch (args.shift().toLowerCase()) {
						case "enable": {
							plugins.leave.enabled = true;
							message.channel.msg(`${botInfo.emotes.success}|Leave plugin enabled.`);
						} break;

						case "disable": {
							plugins.leave.enabled = false;
							message.channel.msg(`${botInfo.emotes.success}|Leave plugin disabled.`);
						} break;

						case "message": {
							if (args[0]) {
								let msg = args.join(' ');
								plugins.leave.message = msg.replace(/`+/g, '');

								let g = message.guild;
								let m = message.member;
								let a = message.author;

								message.channel.msg(`${botInfo.emotes.success}|Leave message set to \`${msg}\`\nPreview: ${msg.replace(/\$user_count/g, g.memberCount).replace(/\$user_id/g, a.id).replace(/\$user_name/g, m.displayName).replace(/\$user_tag/g, a.tag).replace(/\$user/g, a)}`);
							} else message.channel.msg(`${botInfo.emotes.info}|The leave message is: \`${plugins.join.message}\``);
						} break;

						case "channel": {
							if (args[0]) {
								let channels = message.guild.findChannels(args[0]);

								if (channels.length == 1) {
									let valid = false;
									switch (channels[0].type) {
										case "text": valid = true; break;
										case "news": valid = true; break;
										case "store": valid = true; break;
									}

									if (valid) {
										plugins.leave.channel = channels[0].id;
										message.channel.msg(`${botInfo.emotes.success}|Leave message channel set to ${channels[0]}.`);
									} else message.channel.msg(`${botInfo.emotes.fail}|Leave message channel must be a text channel.`);
								} else if (channels.length > 1) message.channel.msg(`${botInfo.emotes.fail}|Too many channels found for **${args[0]}**.`);
								else message.channel.msg(`${botInfo.emotes.fail}|No channels found for **${args[0]}**.`);
							} else message.channel.msg(`${botInfo.emotes.fail}|You must specify the channel.`);
						} break;

						default: {
							message.channel.msg(`${botInfo.emotes.fail}|Invalid leave configuration property.`);
						} break;
					}
				} else {
					let embed = new Discord.MessageEmbed()
						.setColor(0x0096ff)
						.setTitle("Configuration: Leaving")
						.setDescription(plugins.leave.enabled ? `${botInfo.emotes.success}|Plugin enabled.` : `${botInfo.emotes.fail}|Plugin disabled.\nWhile disabled, the following settings are irrelevant.`)
						.addField(`${botInfo.emotes.success}|Will send this message:`, `\`${plugins.leave.message}\``)
						.addField("Message sent in channel:", message.guild.channels.resolve(plugins.leave.channel) ? `<#${plugins.leave.channel}>` : "`No set channel.`");

					message.channel.msg({embed});
				}
			} break;

			case "selfassign": case "sa": {
				if (args[0]) {
					switch (args.shift().toLowerCase()) {
						case "enable": {
							plugins.self_assign.enabled = true;
							message.channel.msg(`${botInfo.emotes.success}|Self assignable roles enabled.`);
						} break;

						case "disable": {
							plugins.self_assign.enabled = false;
							message.channel.msg(`${botInfo.emotes.success}|Self assignable roles disabled.`);
						} break;

						case "message": {
							if (args[0]) {
								let msg = args.join(' ').replace(/`+/g, '')
								plugins.self_assign.message = msg;

								let r = message.member.roles.highest;
								message.channel.msg(`${botInfo.emotes.success}|Message updated: \`${msg}\`\nPreview: ${msg.replace(/\$action/g, "were given/removed from").replace(/\$role_id/g, r.id).replace(/\$role_name/g, r.name)}`);
							} else {
								let msg = plugins.self_assign.message;
								let r = message.member.roles.highest;

								message.channel.msg(`${botInfo.emotes.success}|Self assign message: \`${msg}\`\nPreview: ${msg.replace(/\$action/g, "were given/removed from").replace(/\$role_id/g, r.id).replace(/\$role_name/g, r.name)}`);
							}
						} break;

						case "roles": {
							if (args[0]) {
								switch (args.shift().toLowerCase()) {
									case "add": {
										if (args[0]) {
											let r = plugins.self_assign.roles;

											let roles = message.guild.findRoles(args.join(''));

											for (let i = 0; i < roles.length; i++) {
												if (!r.includes(roles[i].id))
													r.push(roles[i].id);
											}

											let mrText = "`No roles can be self assigned.`";
											if (r.length) {
												mrText = `<@&${r.join('> <@&')}>`;
											}

											let embed = new Discord.MessageEmbed()
												.setColor(0x0096ff)
												.setTitle(`Configuration: Self Assignable Roles`)
												.setDescription(`Roles:\n${mrText}\nDescription: ${meta["self_assign"].desc}`);

											message.channel.msg(`${botInfo.emotes.success}|Self assignable roles updated.`, {embed});
										} else message.channel.msg(`${botInfo.emotes.fail}|You must list at least one role.`);
									} break;

									case "remove": {
										if (args[0]) {
											let r = plugins.self_assign.roles;
											message.guild.roles.cache.forEach((role, id, map) => {
												if (r.includes(id)) {
													if (role.name.toLowerCase().includes(args[0].toLowerCase())) {
														for (let i = 0; i < r.length; i++) {
															if (r[i] == id)
																r.splice(i, 1);
														}
													}
												}
											});

											let mrText = "`No roles can be self assigned.`";
											if (r.length) {
												mrText = `<@&${r.join('> <@&')}>`;
											}

											let embed = new Discord.MessageEmbed()
												.setColor(0x0096ff)
												.setTitle(`Configuration: Self Assignable Roles`)
												.setDescription(`Roles:\n${mrText}\nDescription: ${meta["self_assign"].desc}`);

											message.channel.msg(`${botInfo.emotes.success}|Self assignable roles updated.`, {embed});
										} else message.channel.msg(`${botInfo.emotes.fail}|You must list at least one role.`);
									} break;

									default: {
										message.channel.msg(`${botInfo.emotes.fail}|You must \`add\` or \`remove\` from self assignable roles.`);
									} break;
								}
							} else {
								let r = plugins.self_assign.roles;

								let mrText = "`No roles can be self assigned.`";
								if (r.length) {
									mrText = `<@&${r.join('> <@&')}>`;
								}

								let embed = new Discord.MessageEmbed()
									.setColor(0x0096ff)
									.setTitle(`Configuration: Self Assignable Roles`)
									.setDescription(`Roles:\n${mrText}\nDescription: ${meta["self_assign"].desc}`);

								message.channel.msg({embed});
							}
						} break;

						case "dm": {
							switch (isString(args[0]) ? args[0].toLowerCase() : args[0]) {
								case "enable": {
									plugins.self_assign.dm = true;
									message.channel.msg(`${botInfo.emotes.success}|User will be DMed instead of told in the guild.`);
								} break;

								case "disable": {
									plugins.self_assign.dm = false;
									message.channel.msg(`${botInfo.emotes.success}|User will not be DMed instead of told in the guild.`);
								} break;

								default: {
									message.channel.msg(`${botInfo.emotes.fail}|You must \`enable\` or \`disable\` whether the member should be DMed or not.`);
								} break;
							}
						} break;

						case "delete": {
							switch (isString(args[0]) ? args[0].toLowerCase() : args[0]) {
								case "enable": {
									plugins.self_assign.delete = true;
									message.channel.msg(`${botInfo.emotes.success}|User's message will be deleted.`);
								} break;

								case "disable": {
									plugins.self_assign.delete = false;
									message.channel.msg(`${botInfo.emotes.success}|User's message won't be deleted.`);
								} break;

								default: {
									message.channel.msg(`${botInfo.emotes.fail}|You must \`enable\` or \`disable\` whether the member's message should have been deleted or not.`);
								} break;
							}
						} break;

						default: {
							message.channel.msg(`${botInfo.emotes.fail}|Invalid self assign configuration.`);
						} break;
					}
				} else {
					let embed = new Discord.MessageEmbed()
						.setColor(0x0096ff)
						.setTitle("Configuration: Self Assignable Roles")
						.setDescription(plugins.self_assign.enabled ? `${botInfo.emotes.success}|Plugin enabled.` : `${botInfo.emotes.fail}|Plugin disabled.\nWhile disabled, the following settings are irrelevant.`)
						.addField(`${botInfo.emotes.success}|Will send this message:`, `\`${plugins.self_assign.message}\``)
						.addField("Messaged Delivered In:", `${botInfo.emotes.info}|${plugins.self_assign.dm ? 'DMs.' : 'The channel they ran the command in.'}`)
						.addField("Deletes their message:", `${botInfo.emotes.info}|${plugins.self_assign.delete ? 'Yes.' : 'No.'}`)
						.addField(`Roles [${plugins.self_assign.roles.length}]:`, plugins.self_assign.roles.length > 0 ? `<@&${plugins.self_assign.roles.join('> <@&')}>` : '`No self assignable roles.`');

					message.channel.msg({embed});
				}
			} break;

			// "auto_moderation": {
			// 	desc: "Manage automatic moderation from the bot.",
			// 	usage: [
			// 		"(automod|am) (enable|disable)",
			// 		"(automod|am) (excludemods|em) (enable|disable)",
			// 		"(automod|am) (autopardon|ap) (enable|disable)",
			// 		"(automod|am) (autopardon|ap) after <time>",
			// 		"(automod|am) (autopardon|ap) amount <amount>",
			// 		"(automod|am) (swearfilter|sf) (enable|disable)",
			// 		"(automod|am) (swearfilter|sf) blacklist (add|remove) {word(s)}",
			// 		"(automod|am) (swearfilter|sf) response <offense #> {punishment(s)}",
			// 		"(automod|am) (swearfilter|sf) response remove <offense #>",
			// 		"(automod|am) (linkfilter|lf) (enable|disable)",
			// 		"(automod|am) (linkfilter|lf) (blacklistiswhitelist|biw) (enable|disable)",
			// 		"(automod|am) (linkfilter|lf) blacklist (add|remove) {domain(s)}",
			// 		"(automod|am) (linkfilter|lf) response <offense #> {punishment(s)}",
			// 		"(automod|am) (linkfilter|lf) response remove <offense #>",
			// 		"(automod|am) (massmentions|mm) (enable|disable)",
			// 		"(automod|am) (massmentions|mm) limit (user|role) <limit>",
			// 		"(automod|am) (massmentions|mm) response <offense #> {punishment(s)}",
			// 		"(automod|am) (massmentions|mm) response remove <offense #>"
			// 	]
			// },

			case "automod": case "am": {

			} break;

			case "leveling": {
				if (args[0]) {
					switch (args.shift().toLowerCase()) {
						case "enable": {
							plugins.leveling.enabled = true;
							message.channel.msg(`${botInfo.emotes.success}|Leveling pluggin enabled.`);
						} break;

						case "disable": {
							plugins.leveling.enabled = false;
							message.channel.msg(`${botInfo.emotes.success}|Leveling pluggin disabled.`);
						} break;

						case "message": {
							if (args[0]) {
								let msg = args.join(' ').replace(/`+/g, '');

								let a = message.author;
								let m = message.member;
								let lvl = storage.guilds.get(message.guild.id).levels[a.id];

								plugins.leveling.message = msg;
								message.channel.msg(`${botInfo.emotes.success}|Level up message set to \`${msg}\`\nPreview: ${msg.replace(/\$user_id/g, a.id).replace(/\$user_name/g, m.displayName).replace(/\$user_tag/g, a.tag).replace(/\$user_level/g, lvl ? lvl.is : 1).replace(/\$user/g, a)}`);
							} else {
								let msg = plugins.leveling.message;

								let a = message.author;
								let m = message.member;
								let lvl = storage.guilds.get(message.guild.id).levels[a.id];

								message.channel.msg(`${botInfo.emotes.success}|Level up message: \`${msg}\`\nPreview: ${msg.replace(/\$user_id/g, a.id).replace(/\$user_name/g, m.displayName).replace(/\$user_tag/g, a.tag).replace(/\$user_level/g, lvl ? lvl.is : 1).replace(/\$user/g, a)}`);
							}
						} break;

						case "noxp": {
							if (args[0]) {
								switch (args.shift().toLowerCase()) {
									case "add": {
										if (args[0]) {
											let r = plugins.leveling.noXP;

											let channels = message.guild.findChannels(args.join(''));

											for (let i = 0; i < channels.length; i++) {
												if (!r.includes(channels[i].id))
													r.push(channels[i].id);
											}

											let mrText = "`All channels have xp enabled.`";
											if (r.length) {
												mrText = `<#${r.join('> <#')}>`;
											}

											let embed = new Discord.MessageEmbed()
												.setColor(0x0096ff)
												.setTitle(`Configuration: Leveling XP Excluded Channels`)
												.setDescription(`Excluded Channels:\n${mrText}\nDescription: ${meta["leveling"].desc}`);

											message.channel.msg(`${botInfo.emotes.success}|Excluded XP channels updated.`, {embed});
										} else message.channel.msg(`${botInfo.emotes.fail}|You must list at least one role.`);
									} break;

									case "remove": {
										if (args[0]) {
											let r = plugins.leveling.noXP;
											message.guild.channels.cache.forEach((channel, id, map) => {
												if (r.includes(id)) {
													if (channel.name.toLowerCase().includes(args[0].toLowerCase())) {
														for (let i = 0; i < r.length; i++) {
															if (r[i] == id)
																r.splice(i, 1);
														}
													}
												}
											});

											let mrText = "`All channels have xp enabled.`";
											if (r.length) {
												mrText = `<#${r.join('> <#')}>`;
											}

											let embed = new Discord.MessageEmbed()
												.setColor(0x0096ff)
												.setTitle(`Configuration: Leveling XP Excluded Channels`)
												.setDescription(`Excluded Channels:\n${mrText}\nDescription: ${meta["leveling"].desc}`);

											message.channel.msg(`${botInfo.emotes.success}|Excluded XP channels updated.`, {embed});
										} else message.channel.msg(`${botInfo.emotes.fail}|You must list at least one channel.`);
									} break;

									default: {
										message.channel.msg(`${botInfo.emotes.fail}|You must \`add\` or \`remove\` from no xp channels.`);
									} break;
								}
							} else {
								let r = plugins.leveling.noXP;

								let mrText = "`All channels have xp enabled.`";
								if (r.length) {
									mrText = `<#${r.join('> <#')}>`;
								}

								let embed = new Discord.MessageEmbed()
									.setColor(0x0096ff)
									.setTitle(`Configuration: Leveling XP Excluded Channels`)
									.setDescription(`Excluded Channels:\n${mrText}\nDescription: ${meta["leveling"].desc}`);

								message.channel.msg({embed});
							}
						} break;

						case "rewards": {
							if (args[0]) {
								switch (args[0].toLowerCase()) {
									case "delete": {
										args.shift();

										if (args[0]) {
											let lvls = Object.keys(plugins.leveling.rewards);
											if (lvls.includes(args[0])) {
												message.channel.msg(`${botInfo.emotes.caution}|Are you sure? This will delete all roles given for level **${args[0]}**. Reply with "yes" or "no" within 15 seconds.`).then(newMsg => {
													message.channel.setResponseListener([args[0]], [message.author.id], 15000, 'guildDeleteLevelingReward');
												});
											} else message.channel.msg(`${botInfo.emotes.fail}|No roles are given at this level.`);
										} else message.channel.msg(`${botInfo.emotes.fail}|You must specify the level to remove all roles for.`);
									} break;

									default: {
										if (args[1]) {
											if (args[0] == Number(args[0])) {
												let lvl = args[0];

												args.shift();

												if (!plugins.leveling.rewards[lvl]) {
													plugins.leveling.rewards[lvl] = [];
												}

												switch (args.shift().toLowerCase()) {
													case "add": {
														if (args[0]) {
															let r = plugins.leveling.rewards[lvl];

															let roles = message.guild.findRoles(args.join(''));

															for (let i = 0; i < roles.length; i++) {
																if (!r.includes(roles[i].id))
																	r.push(roles[i].id);
															}

															let mrText = "`No roles will be assigned.`";
															if (r.length) {
																mrText = `<@&${r.join('> <@&')}>`;
															}

															let embed = new Discord.MessageEmbed()
																.setColor(0x0096ff)
																.setTitle(`Configuration: Leveling Rewards For Level ${lvl}`)
																.setDescription(`Roles:\n${mrText}\nDescription: ${meta["leveling"].desc}`);

															message.channel.msg(`${botInfo.emotes.success}|Rewards for **${lvl}** updated.`, {embed});
														} else message.channel.msg(`${botInfo.emotes.fail}|You must list at least one role.`);
													} break;

													case "remove": {
														if (args[0]) {
															let r = plugins.leveling.rewards[lvl];
															message.guild.roles.cache.forEach((role, id, map) => {
																if (r.includes(id)) {
																	if (role.name.toLowerCase().includes(args[0].toLowerCase())) {
																		for (let i = 0; i < r.length; i++) {
																			if (r[i] == id)
																				r.splice(i, 1);
																		}
																	}
																}
															});

															if (r.length == 0) {
																delete plugins.leveling.rewards[lvl];
															}

															let mrText = "`No roles will be assigned.`";
															if (r.length) {
																mrText = `<@&${r.join('> <@&')}>`;
															}

															let embed = new Discord.MessageEmbed()
																.setColor(0x0096ff)
																.setTitle(`Configuration: Leveling Rewards For Level ${lvl}`)
																.setDescription(`Roles:\n${mrText}\nDescription: ${meta["leveling"].desc}`);

															message.channel.msg(`${botInfo.emotes.success}|Rewards for **${lvl}** updated.`, {embed});
														} else message.channel.msg(`${botInfo.emotes.fail}|You must list at least one role.`);
													} break;

													default: {
														message.channel.msg(`${botInfo.emotes.fail}|You must \`add\` or \`remove\` from the rewards for this level.`);
													} break;
												}
											} else message.channel.msg(`${botInfo.emotes.fail}|You must specify a level to reward.`);
										} else {
											let lvls = Object.keys(plugins.leveling.rewards);
											if (lvls.includes(args[0])) {
												let r = plugins.leveling.rewards[args[0]];

												let mrText = "`No roles will be assigned.`";
												if (r.length) {
													mrText = `<@&${r.join('> <@&')}>`;
												}

												let embed = new Discord.MessageEmbed()
													.setColor(0x0096ff)
													.setTitle(`Configuration: Leveling Rewards For Level ${args[0]}`)
													.setDescription(`Roles:\n${mrText}\nDescription: ${meta["leveling"].desc}`);

												message.channel.msg({embed});
											} else message.channel.msg(`${botInfo.emotes.fail}|No rewards exist for this level.`);
										}
									} break;
								}
							} else {
								let lvls = Object.keys(plugins.leveling.rewards);
								let embed = new Discord.MessageEmbed()
									.setColor(0x0096ff)
									.setTitle(`Configuration: Leveling Rewards [${lvls.length}]`)
									.setDescription(`Rewards given at levels:\n${lvls.length > 0 ? lvls.join(', ') : '`No rewards.`'}\nDescription: ${meta["leveling"].desc}`);

								message.channel.msg({embed});
							}
						} break;

						default: {
							message.channel.msg(`${botInfo.emotes.fail}|Invalid leveling configiration.`);
						} break;
					}
				} else {
					let lvls = Object.keys(plugins.leveling.rewards);
					let embed = new Discord.MessageEmbed()
						.setColor(0x0096ff)
						.setTitle('Configuration: Leveling')
						.setDescription(plugins.leveling.enabled ? `${botInfo.emotes.success}|Plugin enabled.` : `${botInfo.emotes.fail}|Plugin disabled.`)
						.addField('Message:', `\`${plugins.leveling.message}\``)
						.addField('No XP channels:', `<#${plugins.leveling.noXP.join('> <#')}>`)
						.addField('Rewards:', `Rewards given at levels:\n${lvls.length > 0 ? lvls.join(', ') : '`No rewards.`'}`);

					message.channel.msg({embed});
				}
			} break;

			case "logging": {
				if (args[0]) {
					switch (args.shift().toLowerCase()) {
						case "enable": {
							plugins.logging.enabled = true;
							message.channel.msg(`${botInfo.emotes.success}|Logging plugin enabled.`);
						} break;

						case "disable": {
							plugins.logging.enabled = false;
							message.channel.msg(`${botInfo.emotes.success}|Logging plugin disabled.`);
						} break;

						case "messages": {
							if (args[0]) {
								if (args[0].toLowerCase() == "remove") {
									plugins.logging.messages = ""
									message.channel.msg(`${botInfo.emotes.success}|Message logging channel removed.`);
								} else {
									let channel = message.guild.findChannels(args[0]);
									if (channel.length == 1) {
										plugins.logging.messages = channel[0].id;
										message.channel.msg(`${botInfo.emotes.success}|Message logging channel set to ${channel[0]}`);
									} else if (channel.length > 1) message.channel.msg(`${botInfo.emotes.fail}|Too many channels found for **${args[0]}**.`);
									else message.channel.msg(`${botInfo.emotes.fail}|No channels found for **${args[0]}**.`);
								}
							} else {
								if (message.guild.channels.resolve(plugins.logging.messages)) {
									message.channel.msg(`${botInfo.emotes.info}|Message logging channel currently set to <#${plugins.logging.messages}>.`);
								} else {
									message.channel.msg(`${botInfo.emotes.info}|No message logging channel.`);
								}
							}
						} break;

						case "channelmanage": case "cm": {
							if (args[0]) {
								if (args[0].toLowerCase() == "remove") {
									plugins.logging.channel_manage = ""
									message.channel.msg(`${botInfo.emotes.success}|Channel manage logging channel removed.`);
								} else {
									let channel = message.guild.findChannels(args[0]);
									if (channel.length == 1) {
										plugins.logging.channel_manage = channel[0].id;
										message.channel.msg(`${botInfo.emotes.success}|Channel manage logging channel set to ${channel[0]}`);
									} else if (channel.length > 1) message.channel.msg(`${botInfo.emotes.fail}|Too many channels found for **${args[0]}**.`);
									else message.channel.msg(`${botInfo.emotes.fail}|No channels found for **${args[0]}**.`);
								}
							} else {
								if (message.guild.channels.resolve(plugins.logging.channel_manage)) {
									message.channel.msg(`${botInfo.emotes.info}|Channel manage logging channel currently set to <#${plugins.logging.channel_manage}>.`);
								} else {
									message.channel.msg(`${botInfo.emotes.info}|No channel manage logging channel.`);
								}
							}
						} break;

						case "rolemanage": case "rm": {
							if (args[0]) {
								if (args[0].toLowerCase() == "remove") {
									plugins.logging.role_manage = ""
									message.channel.msg(`${botInfo.emotes.success}|Role manage logging channel removed.`);
								} else {
									let channel = message.guild.findChannels(args[0]);
									if (channel.length == 1) {
										plugins.logging.role_manage = channel[0].id;
										message.channel.msg(`${botInfo.emotes.success}|Role manage logging channel set to ${channel[0]}`);
									} else if (channel.length > 1) message.channel.msg(`${botInfo.emotes.fail}|Too many channels found for **${args[0]}**.`);
									else message.channel.msg(`${botInfo.emotes.fail}|No channels found for **${args[0]}**.`);
								}
							} else {
								if (message.guild.channels.resolve(plugins.logging.role_manage)) {
									message.channel.msg(`${botInfo.emotes.info}|Role manage logging channel currently set to <#${plugins.logging.role_manage}>.`);
								} else {
									message.channel.msg(`${botInfo.emotes.info}|No role manage logging channel.`);
								}
							}
						} break;

						case "roleassign": case "ra": {
							if (args[0]) {
								if (args[0].toLowerCase() == "remove") {
									plugins.logging.role_assign = ""
									message.channel.msg(`${botInfo.emotes.success}|Role assign logging channel removed.`);
								} else {
									let channel = message.guild.findChannels(args[0]);
									if (channel.length == 1) {
										plugins.logging.role_assign = channel[0].id;
										message.channel.msg(`${botInfo.emotes.success}|Role assign logging channel set to ${channel[0]}`);
									} else if (channel.length > 1) message.channel.msg(`${botInfo.emotes.fail}|Too many channels found for **${args[0]}**.`);
									else message.channel.msg(`${botInfo.emotes.fail}|No channels found for **${args[0]}**.`);
								}
							} else {
								if (message.guild.channels.resolve(plugins.logging.role_assign)) {
									message.channel.msg(`${botInfo.emotes.info}|Role assign logging channel currently set to <#${plugins.logging.role_assign}>.`);
								} else {
									message.channel.msg(`${botInfo.emotes.info}|No role assign logging channel.`);
								}
							}
						} break;

						case "joins": case "leaves": {
							if (args[0]) {
								if (args[0].toLowerCase() == "remove") {
									plugins.logging.join_leave = ""
									message.channel.msg(`${botInfo.emotes.success}|User joins/leaves logging channel removed.`);
								} else {
									let channel = message.guild.findChannels(args[0]);
									if (channel.length == 1) {
										plugins.logging.join_leave = channel[0].id;
										message.channel.msg(`${botInfo.emotes.success}|User joins/leaves logging channel set to ${channel[0]}`);
									} else if (channel.length > 1) message.channel.msg(`${botInfo.emotes.fail}|Too many channels found for **${args[0]}**.`);
									else message.channel.msg(`${botInfo.emotes.fail}|No channels found for **${args[0]}**.`);
								}
							} else {
								if (message.guild.channels.resolve(plugins.logging.join_leave)) {
									message.channel.msg(`${botInfo.emotes.info}|User joins/leaves logging channel currently set to <#${plugins.logging.join_leave}>.`);
								} else {
									message.channel.msg(`${botInfo.emotes.info}|No user joins/leaves logging channel.`);
								}
							}
						} break;

						case "bans": {
							if (args[0]) {
								if (args[0].toLowerCase() == "remove") {
									plugins.logging.bans = ""
									message.channel.msg(`${botInfo.emotes.success}|Bans logging channel removed.`);
								} else {
									let channel = message.guild.findChannels(args[0]);
									if (channel.length == 1) {
										plugins.logging.bans = channel[0].id;
										message.channel.msg(`${botInfo.emotes.success}|Bans logging channel set to ${channel[0]}`);
									} else if (channel.length > 1) message.channel.msg(`${botInfo.emotes.fail}|Too many channels found for **${args[0]}**.`);
									else message.channel.msg(`${botInfo.emotes.fail}|No channels found for **${args[0]}**.`);
								}
							} else {
								if (message.guild.channels.resolve(plugins.logging.bans)) {
									message.channel.msg(`${botInfo.emotes.info}|Bans logging channel currently set to <#${plugins.logging.bans}>.`);
								} else {
									message.channel.msg(`${botInfo.emotes.info}|No bans logging channel.`);
								}
							}
						} break;

						case "levels": {
							if (args[0]) {
								if (args[0].toLowerCase() == "remove") {
									plugins.logging.levels = ""
									message.channel.msg(`${botInfo.emotes.success}|Levels logging channel removed.`);
								} else {
									let channel = message.guild.findChannels(args[0]);
									if (channel.length == 1) {
										plugins.logging.levels = channel[0].id;
										message.channel.msg(`${botInfo.emotes.success}|Levels logging channel set to ${channel[0]}`);
									} else if (channel.length > 1) message.channel.msg(`${botInfo.emotes.fail}|Too many channels found for **${args[0]}**.`);
									else message.channel.msg(`${botInfo.emotes.fail}|No channels found for **${args[0]}**.`);
								}
							} else {
								if (message.guild.channels.resolve(plugins.logging.levels)) {
									message.channel.msg(`${botInfo.emotes.info}|Levels logging channel currently set to <#${plugins.logging.levels}>.`);
								} else {
									message.channel.msg(`${botInfo.emotes.info}|No levels logging channel.`);
								}
							}
						} break;

						case "strikes": {
							if (args[0]) {
								if (args[0].toLowerCase() == "remove") {
									plugins.logging.strikes = ""
									message.channel.msg(`${botInfo.emotes.success}|Strikes logging channel removed.`);
								} else {
									let channel = message.guild.findChannels(args[0]);
									if (channel.length == 1) {
										plugins.logging.strikes = channel[0].id;
										message.channel.msg(`${botInfo.emotes.success}|Strikes logging channel set to ${channel[0]}`);
									} else if (channel.length > 1) message.channel.msg(`${botInfo.emotes.fail}|Too many channels found for **${args[0]}**.`);
									else message.channel.msg(`${botInfo.emotes.fail}|No channels found for **${args[0]}**.`);
								}
							} else {
								if (message.guild.channels.resolve(plugins.logging.strikes)) {
									message.channel.msg(`${botInfo.emotes.info}|Strikes logging channel currently set to <#${plugins.logging.strikes}>.`);
								} else {
									message.channel.msg(`${botInfo.emotes.info}|No strikes logging channel.`);
								}
							}
						} break;

						default: {
							message.channel.msg(`${botInfo.emotes.fail}|Invalid logging configuration.`);
						} break;
					}
				} else {
					let embed = new Discord.MessageEmbed()
						.setColor(0x0096ff)
						.setTitle('Configuration: Logging')
						.setDescription(plugins.logging.enabled ? `${botInfo.emotes.success}|Plugin enabled.` : `${botInfo.emotes.fail}|Plugin disabled.\nWhile disabled, the following settings are irrelevant.`)
						.addField('Messages:', message.guild.channels.resolve(plugins.logging.messages) ? `<#${plugins.logging.messages}>` : '`No messages logging channel.`')
						.addField('Channel Management:', message.guild.channels.resolve(plugins.logging.channel_manage) ? `<#${plugins.logging.channel_manage}>` : '`No channel management logging channel.`')
						.addField('Role Management:', message.guild.channels.resolve(plugins.logging.role_manage) ? `<#${plugins.logging.role_manage}>` : '`No role management logging channel.`')
						.addField('Role Assignment:', message.guild.channels.resolve(plugins.logging.role_assign) ? `<#${plugins.logging.role_assign}>` : '`No role assignment logging channel.`')
						.addField('Join/Leave:', message.guild.channels.resolve(plugins.logging.joins) ? `<#${plugins.logging.joins}>` : '`No joins/leaves logging channel.`')
						.addField('Bans:', message.guild.channels.resolve(plugins.logging.bans) ? `<#${plugins.logging.bans}>` : '`No bans logging channel.`')
						.addField('Levels:', message.guild.channels.resolve(plugins.logging.levels) ? `<#${plugins.logging.levels}>` : '`No levels logging channel.`')
						.addField('Strikes:', message.guild.channels.resolve(plugins.logging.strikes) ? `<#${plugins.logging.strikes}>` : '`No strikes logging channel.`');

					message.channel.msg({embed});
				}
			} break;

			default: {
				message.channel.msg(`${botInfo.emotes.fail}|Invalid configuration property.`);
			} break;
		}
	} else {
		let rg = Object.keys(plugins.reactGroups);
		let sp = Object.keys(plugins.strike_punishments);
		let embed = new Discord.MessageEmbed()
			.setColor(0x0096ff)
			.setTitle("General Configuration")
			.setDescription('You can do \`config usage {propery}\` to view how to use that property. You can also check the website for the full usage, this is all simplified.\n' + cmd.website)
			.addField(`Prefix: \`${plugins.prefix}\``, `Description: ${meta["prefix"].desc}`)
			.addField(`Mod Roles: ${plugins.modroles.length} roles`, `Description: ${meta["modroles"].desc}`)
			.addField(`React Groups: ${rg.length} group${rg.length > 1 ? "s": ""}`, `Description: ${meta["reactGroups"].desc}`)
			.addField(`Strike Punishments: ${sp.length} punishment${sp.length > 1 ? "s" : ""}`, `Description: ${meta["strike_punishments"].desc}`)
			.addField(`Joining: ${plugins.join.enabled ? `${botInfo.emotes.success}|Enabled.` : `${botInfo.emotes.fail}|Disabled.`}`, `Description: ${meta["join"].desc}`)
			.addField(`Leaving: ${plugins.leave.enabled ? `${botInfo.emotes.success}|Enabled.` : `${botInfo.emotes.fail}|Disabled.`}`, `Description: ${meta["leave"].desc}`)
			.addField(`Self Assignable Roles: ${plugins.self_assign.enabled ? `${botInfo.emotes.success}|Enabled.` : `${botInfo.emotes.fail}|Disabled.`}`, `Description: ${meta["self_assign"].desc}`)
			.addField(`Leveling: ${plugins.leveling.enabled ? `${botInfo.emotes.success}|Enabled.` : `${botInfo.emotes.fail}|Disabled.`}`, `Description: ${meta["leveling"].desc}`)
			.addField(`Logging: ${plugins.logging.enabled ? `${botInfo.emotes.success}|Enabled.` : `${botInfo.emotes.fail}|Disabled.`}`, `Description: ${meta["logging"].desc}`);

		message.channel.msg({embed});
	}
}

new Command(cmd);
