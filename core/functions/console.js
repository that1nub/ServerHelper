let guildID = "667514990131150904";
let channelID = "790072162219458580";

let guild;
let channel;

let oldConsoleLog = console.log;
console.log = function() {
    oldConsoleLog(...arguments);

    if (!bot) return;

    if (!guild) {
        guild = bot.guilds.resolve(guildID);
    }

    if (!channel && guild) {
        channel = guild.channels.resolve(channelID);
    }

    if (channel) {
        // We don't want to log a console.log(true, <log>);
        if (arguments.length > 1 && arguments[0] === true) {
            return;
        }

        let msg = [...arguments].join(' ');
        if (msg.length < 1993) {
            channel.msg('```\n' + msg + '```');
        } else {
            channel.msg(`Something was outputted to console, however was too large to be put here.`, {files: [{attachment: Buffer.from(msg), name: "console.txt"}]});
        }
    }
}

let oldConsoleError = console.error;
console.error = function() {
    oldConsoleLog(...arguments);

    if (!bot) return;

    if (!guild) {
        guild = bot.guilds.resolve(guildID);
    }

    if (!channel && guild) {
        channel = guild.channels.resolve(channelID);
    }

    if (channel) {
        // We don't want to log a console.log(true, <log>);
        if (arguments.length > 1 && arguments[0] === true) {
            return;
        }

        let msg = [...arguments].join(' ');
        if (msg.length < 1993) {
            channel.msg('```\n' + msg + '```');
        } else {
            channel.msg(`Something was outputted to console, however was too large to be put here.`, {files: [{attachment: Buffer.from(msg), name: "console_err.txt"}]});
        }
    }
}