bot.on('guildDelete', guild => {
    try {
        DataBase.query(
            `DELETE FROM guilds WHERE guildID = '${guild.id}'`
        );
        DataBase.query(
            `DELETE FROM guildConfig WHERE guildID = '${guild.id}'`
        );
        DataBase.query(
            `DROP TABLE \`applications_${guild.id}\``
        );
    } catch (err) {
        console.log(err.stack);
    }
});