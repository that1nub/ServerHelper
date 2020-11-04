bot.on('guildCreate', async (guild) => {
    try {
        await DataBase.query(
            `INSERT INTO guilds VALUES ('${guild.id}', '${guild.ownerID}')`
        );
        await DataBase.query(
            `INSERT INTO guildConfig (guildID) VALUES ('${guild.id}')`
        );
    } catch (err) {
        console.log(err);
    }
});
