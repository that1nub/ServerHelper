new Command({
    title: "Bot Information",
    desc: "Get information related to the bot.",
    category: "Bot Related",
    call: ['bot', 'botinfo', 'botinformation'],
    onCall: function(parsedArgs, args, message) {
        let info = botInfo.information;
        let embed = new Discord.MessageEmbed()
            .setColor(0x0096ff)
            .setAuthor(bot.user.tag, bot.user.displayAvatarURL())
            .addField('Creation Date:', info.created)
            .addField('Finished Date:', info.finished)
            .addField('Need support? Have question? Official Discord:', `${botInfo.emotes.link} [Invitation](${info.links.invite})`)
            .addField('Want to visit the website?:', `${botInfo.emotes.link} [Website link](${info.links.website})`);

        let devs = [];
        for (let dev of botInfo.developers) {
            let res = bot.users.resolve(dev);
            if (res)
                devs.push(res.tag);
        }

        embed.addField('Developers:', devs.length ? devs.join(', ') : 'No developers, I am the ultimate AI ( ͡° ͜ʖ ͡°)');

        let testers = [];
        for (let tester of botInfo.testers) {
            let res = bot.users.resolve(tester);
            if (res)
                testers.push(res.tag);
        }

        embed.addField('Testers:', testers.length ? testers.join(', ') : 'No testers ( ͡° ʖ̯ ͡°)');

        message.channel.msg({embed});
    }
});
