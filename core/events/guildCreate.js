function s(o) {
    return JSON.stringify(o);
}

bot.on('guildCreate', guild => {
    try {
        let plugins = botInfo.def.guilds.plugins; 

        DataBase.query(
            `INSERT INTO guilds VALUES ('${guild.id}', '${guild.ownerID}')`
        );

        DataBase.query(
            `INSERT INTO guildConfig VALUES ('${guild.id}', '${plugins.prefix}', '${s(plugins.modroles)}', '${s(plugins.strike_punishments)}', '${s(plugins.join)}', '${s(plugins.leave)}', '${s(plugins.selfassign)}', '${s(plugins.auto_moderation)}', '${s(plugins.leveling)}', '${s(plugins.logging)}')`.replace(/"/g, '\\"')
        );
    } catch (err) {
        console.log(err.stack);
    }
});
