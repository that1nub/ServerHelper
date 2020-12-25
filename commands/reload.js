new Command({
    title: "Reload",
    desc: "Reload a command.",
    category: "Developer",
    usage: "{File name}",
    can: botInfo.developers,
    call: ['reload'],
    onCall: function(parsedArgs, args, message) {
        if (!args[0]) {
            message.channel.msg(`${botInfo.emotes.fail}|You must specify a file name.`);
            return;
        }

        try {
            delete require.cache[require.resolve(`${directory.commands}/${args[0]}.js`)];
            require(`${directory.commands}/${args[0]}.js`);
            message.channel.msg(`${botInfo.emotes.success}|Reloaded command file **${args[0]}**.`);
        } catch (err) {
            message.channel.msg(`${botInfo.emotes.fail}|Error reloading file:\`\`\`\n${err.stack}\`\`\``);
        }
    }
});
