new Command({
    title: "Help",
    desc: "Get the full usage and a description of all commands.",
    call: ["help"],
    usage: "{category | command} <page #>",
    onCall: function(parsedArgs, args, message) {
        if (message.guild) {
            message.react('667547836719824931').catch(console.log);
        }

        if (args.length === 0) {
            // Since they listed no args, the default page is a list of categories
            
            let categories = [];
            let cmds = {};
            let showing = 0;
            for (let i = 0; i < commands.length; i++) {
                let cmd = commands[i];
                
                if (cmd.hideFromHelp) continue;
                
                let can = true;
                if (cmd.can.length > 0) can = cmd.can.includes(message.author.id);
                
                if (can) {
                    showing++;
                    let cat = cmd.category;
                    if (!categories.includes(cat)) categories.push(cat);
                    
                    if (!cmds[cat]) cmds[cat] = [];
                    cmds[cat].push(commands[i].call[0]);
                }
            }
            
            let embed = new Discord.MessageEmbed()
                .setColor(0x0096ff)
                .setTitle("Help: Categories")
                .setDescription("Provide a category name to display commands in that category, or a command name for help with that command specifically.\nDisplaying **" + showing + "**/" + commands.length + " commands.");

            categories.sort();
            
            for (let i = 0; i < categories.length; i++) {
                if (categories[i] === "Other" || categories[i] === "Developer") continue;
                embed.addField(categories[i], `\`${cmds[categories[i]].join('` `')}\``);
            }
            if (categories.includes("Other")) embed.addField("Other", `\`${cmds["Other"].join('` `')}\``);
            if (categories.includes("Developer")) embed.addField("Developer", `\`${cmds["Developer"].join('` `')}\``);
            
            message.author.msg({embed});
        } else {
            // There are arguments specified, now we are going to filter

            let search = args.join(' ').toLowerCase();

            // First, we are going to search for a command, then for a category
            let com = null;
            let categories = [];
            let cmds = {};
            for (let i = 0; i < commands.length; i++) {
                let cmd = commands[i];

                if (cmd.hideFromHelp) continue;
                if (cmd.can.length > 0 && !cmd.can.includes(message.author.id)) continue;

                if (!categories.includes(cmd.category)) categories.push(cmd.category);
                if (!cmds[cmd.category]) cmds[cmd.category] = [];
                cmds[cmd.category].push(cmd);

                if (cmd.title.toLowerCase().includes(search)) {
                    com = cmd;
                    break;
                } else {
                    let found = false;
                    for (let x = 0; x < cmd.call.length; x++) {
                        if (cmd.call[x].toLowerCase().includes(search)) {
                            found = true;
                            com = cmd;
                            break;
                        }
                    }

                    if (found) break;
                }
            }

            if (com) {
                let embed = new Discord.MessageEmbed()
                    .setColor(0x0096ff)
                    .setTitle("Help: " + com.title)
                    .setDescription(com.desc.full)
                    .addField("Command/Aliases:", `\`${com.call.join('`, `')}\``);

                if (com.usage.length > 0) embed.addField("Usage:", `\`${com.usage}\``);
                if (com.examples.length > 0) embed.addField("Examples:", com.examples.join('\n'));
                
                message.author.msg({embed});
            } else {
                // No command was found, so check the categories
                let cat = null;
                for (let i = 0; i < categories.length; i++) {
                    if (categories[i].toLowerCase().includes(search)) {
                        cat = categories[i];
                        break;
                    }
                }
                if (cat) {
                    let list = cmds[cat];
                    let pageCount = Math.ceil(list.length/10);
                    
                    let embed = new Discord.MessageEmbed()
                        .setColor(0x0096ff)
                        .setTitle("Help: " + cat)
                        .setDescription(`Showing page **1**/${pageCount}`);

                    for (let i = 0; i < 10; i++) {
                        if (!list[i]) break;
                        
                        let cmd = list[i];

                        embed.addField(cmd.title, `${cmd.desc.brief}\nCommand: **${cmd.call[0]}** \`${cmd.usage}\``);
                    }

                    message.author.msg({embed}).then(newMsg => {
                        if (pageCount.length > 1) {
                            
                        }
                    });
                } else {
                    message.author.msg(`${botInfo.emotes.fail}|Unable to find a command or category to assist you in.`);
                }
            }
        }
    }
});